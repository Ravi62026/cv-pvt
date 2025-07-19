import Dispute from '../models/Dispute.js';
import { validationResult } from 'express-validator';

// Create a new dispute (citizen only)
export const createDispute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      disputeType,
      category,
      priority,
      opposingParty,
      disputeValue
    } = req.body;

    const dispute = await Dispute.create({
      title,
      description,
      disputeType,
      category,
      priority: priority || 'medium',
      opposingParty,
      disputeValue,
      citizen: req.user._id
    });

    // Add timeline entry
    dispute.timeline.push({
      action: 'created',
      description: 'Dispute created by citizen',
      performedBy: req.user._id
    });

    await dispute.save();

    // Populate citizen details
    await dispute.populate('citizen', 'name email');

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: { dispute }
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute'
    });
  }
};

// Get disputes with filters and pagination
export const getDisputes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      disputeType,
      category,
      priority,
      search,
      citizenId,
      lawyerId
    } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'citizen') {
      query.citizen = req.user._id;
    } else if (req.user.role === 'lawyer') {
      const { type = 'available' } = req.query;

      switch (type) {
        case 'available':
          // Show unassigned disputes only
          query.$or = [
            { assignedLawyer: { $exists: false } },
            { assignedLawyer: null }
          ];
          query.status = { $in: ['pending', 'open'] };
          break;

        case 'assigned':
          // Show disputes assigned to this lawyer
          query.assignedLawyer = req.user._id;
          break;

        case 'requests':
          // Show disputes where lawyer has sent request
          query['lawyerRequests.lawyerId'] = req.user._id;
          break;

        default:
          // Default: show available disputes
          query.$or = [
            { assignedLawyer: { $exists: false } },
            { assignedLawyer: null }
          ];
          query.status = { $in: ['pending', 'open'] };
      }
    } else if (req.user.role === 'admin') {
      // Admin sees all disputes
      // No additional filtering needed
    }

    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (disputeType && disputeType !== 'all') {
      query.disputeType = disputeType;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (citizenId) {
      query.citizen = citizenId;
    }
    if (lawyerId) {
      query.assignedLawyer = lawyerId;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const disputes = await Dispute.find(query)
      .populate('citizen', 'name email phone')
      .populate('assignedLawyer', 'name email lawyerDetails.specialization')
      .populate('lawyerRequests.lawyerId', 'name email lawyerDetails.specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Dispute.countDocuments(query);

    res.json({
      success: true,
      data: {
        disputes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get disputes'
    });
  }
};

// Get single dispute by ID
export const getDisputeById = async (req, res) => {
  try {
    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId)
      .populate('citizen', 'name email phone address')
      .populate('assignedLawyer', 'name email phone lawyerDetails')
      .populate('lawyerRequests.lawyerId', 'name email lawyerDetails.specialization')
      .populate('timeline.performedBy', 'name role')
      .populate('notes.author', 'name role');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'citizen' && dispute.citizen._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (req.user.role === 'lawyer') {
      const hasAccess = dispute.assignedLawyer?._id.toString() === req.user._id.toString() ||
                       dispute.lawyerRequests.some(req => req.lawyerId._id.toString() === req.user._id.toString());
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { dispute }
    });
  } catch (error) {
    console.error('Get dispute by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dispute'
    });
  }
};

// Send request for dispute (both lawyer and citizen can send)
export const sendDisputeRequest = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message, targetUserId } = req.body;

    const dispute = await Dispute.findById(disputeId).populate('citizen', 'name email');
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Dispute is not available for requests'
      });
    }

    // Determine request type based on user role
    let requestData;
    let notificationTarget;

    if (req.user.role === 'lawyer') {
      // Lawyer requesting to handle citizen's dispute
      if (dispute.citizen._id.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot request to handle your own dispute'
        });
      }

      // Check if lawyer already requested
      if (dispute.hasRequestedLawyer(req.user._id)) {
        return res.status(400).json({
          success: false,
          message: 'You have already requested to handle this dispute'
        });
      }

      dispute.addLawyerRequest(req.user._id, message);
      notificationTarget = dispute.citizen._id;
      requestData = {
        disputeId: dispute._id,
        requestId: dispute.lawyerRequests[dispute.lawyerRequests.length - 1]._id,
        caseType: 'dispute',
        requestType: 'lawyer_to_citizen',
        lawyer: {
          _id: req.user._id,
          name: req.user.name,
          specialization: req.user.lawyerDetails?.specialization
        },
        message
      };
    } else if (req.user.role === 'citizen') {
      // Citizen requesting specific lawyer for their dispute
      if (!targetUserId) {
        return res.status(400).json({
          success: false,
          message: 'Target lawyer ID is required'
        });
      }

      // Check if it's citizen's own dispute
      if (dispute.citizen._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You can only request lawyers for your own disputes'
        });
      }

      // Check if already requested this lawyer
      if (dispute.hasRequestedLawyer(targetUserId)) {
        return res.status(400).json({
          success: false,
          message: 'This lawyer has already been requested for this dispute'
        });
      }

      dispute.addLawyerRequest(targetUserId, message);
      notificationTarget = targetUserId;
      requestData = {
        disputeId: dispute._id,
        requestId: dispute.lawyerRequests[dispute.lawyerRequests.length - 1]._id,
        caseType: 'dispute',
        requestType: 'citizen_to_lawyer',
        citizen: {
          _id: req.user._id,
          name: req.user.name
        },
        message
      };
    }

    await dispute.save();

    // Send notification via Socket.io
    const io = req.app.get('socketio');
    io.emit('dispute_request_sent', {
      targetUserId: notificationTarget,
      requestData
    });

    res.json({
      success: true,
      message: 'Request sent successfully'
    });
  } catch (error) {
    console.error('Send dispute request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send request'
    });
  }
};

// Legacy function for backward compatibility
export const requestToHandleDispute = sendDisputeRequest;

// Offer help on dispute (lawyer only) - Alternative to requestToHandleDispute
export const offerHelpOnDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message, proposedFee, estimatedDuration } = req.body;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    if (dispute.status !== 'pending' && dispute.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Dispute is not available for offers'
      });
    }

    // Check if dispute is already assigned
    if (dispute.assignedLawyer) {
      return res.status(400).json({
        success: false,
        message: 'Dispute is already assigned to a lawyer'
      });
    }

    // Check if lawyer already offered help
    if (dispute.hasRequestedLawyer(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already offered help for this dispute'
      });
    }

    // Add lawyer offer
    dispute.addLawyerRequest(req.user._id, message, proposedFee, estimatedDuration);
    await dispute.save();

    // Send notification to citizen via Socket.io
    const io = req.app.get('socketio');
    io.emit('lawyer_request_sent', {
      citizenId: dispute.citizen,
      requestData: {
        disputeId: dispute._id,
        requestId: dispute.lawyerRequests[dispute.lawyerRequests.length - 1]._id,
        caseType: 'dispute',
        lawyer: {
          _id: req.user._id,
          name: req.user.name,
          specialization: req.user.lawyerDetails?.specialization
        },
        message,
        proposedFee,
        estimatedDuration
      }
    });

    res.json({
      success: true,
      message: 'Offer sent successfully'
    });
  } catch (error) {
    console.error('Offer help on dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send offer'
    });
  }
};

// Respond to request (both citizen and lawyer can respond)
export const respondToDisputeRequest = async (req, res) => {
  try {
    const { disputeId, requestId } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "accept" or "reject"'
      });
    }

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Find the request
    const lawyerRequest = dispute.lawyerRequests.id(requestId);
    if (!lawyerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check authorization based on user role and request type
    let canRespond = false;
    let notificationTarget;

    if (req.user.role === 'citizen') {
      // Citizen can respond to lawyer requests for their own disputes
      if (dispute.citizen.toString() === req.user._id.toString()) {
        canRespond = true;
        notificationTarget = lawyerRequest.lawyerId;
      }
    } else if (req.user.role === 'lawyer') {
      // Lawyer can respond to citizen requests directed to them
      if (lawyerRequest.lawyerId.toString() === req.user._id.toString()) {
        canRespond = true;
        notificationTarget = dispute.citizen;
      }
    }

    if (!canRespond) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you cannot respond to this request'
      });
    }

    if (lawyerRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been responded to'
      });
    }

    // Update request status
    lawyerRequest.status = action === 'accept' ? 'accepted' : 'rejected';
    lawyerRequest.respondedAt = new Date();

    if (action === 'accept') {
      // Assign lawyer and update dispute status
      dispute.assignedLawyer = lawyerRequest.lawyerId;
      dispute.status = 'assigned';

      // Reject all other pending requests
      dispute.lawyerRequests.forEach(req => {
        if (req._id.toString() !== requestId && req.status === 'pending') {
          req.status = 'rejected';
          req.respondedAt = new Date();
        }
      });

      // Add timeline entry
      dispute.timeline.push({
        action: 'assigned',
        description: 'Lawyer assigned to dispute',
        performedBy: req.user._id
      });
    }

    await dispute.save();

    // Send notification via Socket.io
    const io = req.app.get('socketio');

    if (action === 'accept') {
      // Emit case assignment event to create chat room via Socket.io
      io.emit('case_assigned', {
        citizenId: dispute.citizen,
        lawyerId: lawyerRequest.lawyerId,
        caseType: 'dispute',
        caseId: disputeId,
        caseData: {
          disputeId: dispute._id,
          title: dispute.title,
          action: 'accepted',
          responder: {
            _id: req.user._id,
            name: req.user.name,
            role: req.user.role
          }
        }
      });
    }

    // Send request response notification to the appropriate user
    io.to(`user_${notificationTarget}`).emit('request_response', {
      disputeId: dispute._id,
      requestId,
      action,
      caseType: 'dispute',
      responder: {
        _id: req.user._id,
        name: req.user.name,
        role: req.user.role
      }
    });

    res.json({
      success: true,
      message: `Request ${action}ed successfully`
    });
  } catch (error) {
    console.error('Respond to dispute request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to request'
    });
  }
};

// Legacy function for backward compatibility
export const respondToLawyerRequest = respondToDisputeRequest;

// Update dispute status
export const updateDisputeStatus = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { status, notes, resolution } = req.body;

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check permissions
    const canUpdate = (req.user.role === 'lawyer' && dispute.assignedLawyer?.toString() === req.user._id.toString()) ||
                     (req.user.role === 'citizen' && dispute.citizen.toString() === req.user._id.toString()) ||
                     req.user.role === 'admin';

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const oldStatus = dispute.status;
    dispute.status = status;

    // Add notes if provided
    if (notes) {
      dispute.notes.push({
        author: req.user._id,
        content: notes
      });
    }

    // Handle resolution
    if (status === 'resolved' && oldStatus !== 'resolved') {
      dispute.resolution = {
        ...resolution,
        resolvedBy: req.user._id,
        resolvedAt: new Date()
      };
    }

    await dispute.save();

    // Send notification
    const io = req.app.get('socketio');
    const notificationUsers = [dispute.citizen];
    if (dispute.assignedLawyer) {
      notificationUsers.push(dispute.assignedLawyer);
    }

    notificationUsers.forEach(userId => {
      if (userId.toString() !== req.user._id.toString()) {
        io.to(`user_${userId}`).emit('dispute_status_updated', {
          disputeId: dispute._id,
          newStatus: status,
          updatedBy: {
            _id: req.user._id,
            name: req.user.name,
            role: req.user.role
          }
        });
      }
    });

    res.json({
      success: true,
      message: 'Dispute status updated successfully'
    });
  } catch (error) {
    console.error('Update dispute status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dispute status'
    });
  }
};