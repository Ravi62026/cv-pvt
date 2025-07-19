import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  Button,
  Grid,
  Rating,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import { 
  LocationOn,
  Verified,
  Message,
  Person,
  AccessTime,
  TrendingUp
} from '@mui/icons-material';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import ChatWindow from '../chat/ChatWindow';
import { useNavigate } from 'react-router-dom';
import RequestMessageModal from '../chat/RequestMessageModal';

const LawyerCard = ({ lawyer, onSelect, variant = 'full', existingRoom }) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState(null);
  const navigate = useNavigate();
  
  const rating = lawyer.rating?.average || 0;
  const reviewCount = lawyer.rating?.count || 0;
  const experience = lawyer.expertise?.[0]?.experience || 0;

  const handleOpenModal = () => {
    if (!socket) return;
    setShowModal(true);
  };

  const handleSendRequest = (initialMessage) => {
    setShowModal(false);
    socket.emit('chat:request', { lawyerId: lawyer._id, content: initialMessage }, ({ room, message }) => {
      setChatRoom(room);
      setShowChat(true);
    });
  };

  const handleViewProfile = () => {
    navigate(`/profile/${lawyer._id}`);
  };

  if (variant === 'compact') {
    return (
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box position="relative">
            <Avatar
              src={lawyer.profileImage?.url}
              alt={lawyer.name}
            />
            {lawyer.verified && (
              <Box position="absolute" top={-4} right={-4}>
                <Verified color="success" fontSize="small" />
              </Box>
            )}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" noWrap>{lawyer.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {lawyer.expertise?.[0]?.category || 'General Practice'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={rating} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {experience}y exp
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        {/* Header */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box position="relative">
            <Avatar
              src={lawyer.profileImage?.url}
            alt={lawyer.name}
              sx={{ width: 64, height: 64 }}
            />
            {lawyer.verified && (
              <Box position="absolute" bottom={-4} right={-4}>
                <Verified color="success" />
              </Box>
            )}
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6">{lawyer.name}</Typography>
              {lawyer.verified && (
                <Verified color="success" fontSize="small" />
              )}
            </Stack>
            
            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={rating} readOnly size="small" />
              <Typography variant="body2" color="text.secondary">
                ({reviewCount} reviews)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {experience} years experience
              </Typography>
            </Stack>

          {lawyer.profile?.location && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {lawyer.profile.location.city}, {lawyer.profile.location.state}
                </Typography>
              </Stack>
          )}
          </Box>
        </Box>

      {/* Expertise */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Specializations
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
          {lawyer.expertise?.slice(0, 3).map((exp, index) => (
              <Chip
              key={index}
                label={exp.category.replace('-', ' ')}
                size="small"
                color="primary"
                variant="outlined"
              />
          ))}
          {lawyer.expertise?.length > 3 && (
              <Chip
                label={`+${lawyer.expertise.length - 3} more`}
                size="small"
                variant="outlined"
              />
          )}
          </Stack>
        </Box>

      {/* Bio */}
      {lawyer.profile?.bio && (
          <Typography variant="body2" color="text.secondary">
          {lawyer.profile.bio}
          </Typography>
      )}

      {/* Stats */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6">
            {lawyer.statistics?.totalConsultations || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cases
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6">
            {lawyer.statistics?.successRate || 0}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Success
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h6">
            {lawyer.statistics?.avgResponseTime || 0}h
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Response
              </Typography>
            </Box>
          </Grid>
        </Grid>

      {/* Pricing */}
      {lawyer.consultationRates && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Consultation Rate:
            </Typography>
            <Typography variant="subtitle1">
            ₹{lawyer.consultationRates.perHour || lawyer.consultationRates.perQuery || 0}
            {lawyer.consultationRates.perHour ? '/hour' : '/query'}
            </Typography>
          </Box>
      )}

        {/* Actions */}
        <Stack direction="row" spacing={2}>
        {user?.role === 'citizen' && (
          existingRoom ? (
            existingRoom.status === 'active' ? (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Message />}
                  onClick={() => { setChatRoom(existingRoom); setShowChat(true); }}
                >
                  Chat
                </Button>
            ) : (
                <Button
                  fullWidth
                  variant="outlined"
                  disabled
                >
                  Request Pending
                </Button>
            )
          ) : (
              <Button
                fullWidth
                variant="contained"
                onClick={handleOpenModal}
              >
                Request Consultation
              </Button>
          )
        )}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleViewProfile}
          >
          View Profile
          </Button>
        </Stack>
      </Stack>

      {/* Modals */}
      {showModal && (
        <RequestMessageModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSendRequest}
        />
      )}
      {showChat && chatRoom && (
        <ChatWindow
          room={chatRoom}
          onClose={() => setShowChat(false)}
        />
      )}
    </Card>
  );
};

export default LawyerCard; 