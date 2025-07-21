import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  disputeType: {
    type: String,
    required: [true, 'Please select a dispute type'],
    enum: ['property', 'contract', 'family', 'employment', 'business', 'consumer', 'landlord-tenant', 'other']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['civil', 'criminal', 'family', 'property', 'corporate', 'tax', 'labor', 'other']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'mediation', 'arbitration', 'resolved', 'closed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedLawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lawyerRequests: [{
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date,
    message: String
  }],
  citizenRequests: [{
    lawyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date,
    message: String
  }],
  opposingParty: {
    name: String,
    contact: String,
    address: String
  },
  disputeValue: {
    type: Number,
    min: [0, 'Dispute value cannot be negative']
  },
  documents: [{
    filename: String,
    originalName: String,
    path: String,
    documentType: {
      type: String,
      enum: ['evidence', 'contract', 'notice', 'correspondence', 'other']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  hearingDates: [{
    date: Date,
    time: String,
    venue: String,
    purpose: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'postponed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  resolution: {
    type: {
      type: String,
      enum: ['settlement', 'judgment', 'mediation', 'arbitration', 'withdrawal']
    },
    summary: String,
    terms: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    isSuccessful: Boolean
  },
  timeline: [{
    action: String,
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
disputeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add timeline entry on status change
disputeSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      action: 'status_change',
      description: `Status changed to ${this.status}`,
      timestamp: new Date()
    });
  }
  next();
});

// Method to check if lawyer request already exists
disputeSchema.methods.hasRequestedLawyer = function(lawyerId) {
  return this.lawyerRequests.some(
    req => req.lawyerId.toString() === lawyerId.toString() && 
    req.status === 'pending'
  );
};

// Method to add lawyer request
disputeSchema.methods.addLawyerRequest = function(lawyerId, message = '') {
  if (!this.hasRequestedLawyer(lawyerId)) {
    this.lawyerRequests.push({
      lawyerId,
      message
    });
  }
};

// Method to check if citizen request already exists
disputeSchema.methods.hasCitizenRequestedLawyer = function(lawyerId) {
  return this.citizenRequests.some(
    req => req.lawyerId.toString() === lawyerId.toString() &&
    req.status === 'pending'
  );
};

// Method to add citizen request
disputeSchema.methods.addCitizenRequest = function(lawyerId, message = '') {
  if (!this.hasCitizenRequestedLawyer(lawyerId)) {
    this.citizenRequests.push({
      lawyerId,
      message
    });
  }
};

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;