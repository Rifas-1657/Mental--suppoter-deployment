import React, { useEffect, useState, useMemo } from 'react'
import { Box, Container, Typography, Card, CardContent, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { chatAPI, matchAPI } from '../services/api'
import { getInitials, getAvatarColor } from '../utils/helpers'
import BackButton from '../components/BackButton'

const Chats = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      setError(null)
      const [roomsRes] = await Promise.all([
        chatAPI.getRooms(),
      ])
      setRooms(roomsRes.data.rooms || [])
      // Placeholder: incoming requests could be from matches with status 'pending'
      try {
        const myMatches = await matchAPI.getMyMatches()
        const pending = (myMatches.data.matches || []).filter(m => m.status === 'pending')
        setIncomingRequests(pending)
      } catch {}
    } catch (err) {
      setError(err.message || 'Failed to load chats')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAccept = async (m) => {
    // For now, navigate to chat room if exists
    if (m.chatRoom?.roomId) {
      navigate(`/chat/${m.chatRoom.roomId}`)
    }
  }

  const handleReject = async (m) => {
    // Soft reject: no-op UI remove
    setIncomingRequests(prev => prev.filter(x => x._id !== m._id))
  }

  const handleOpenAIChat = () => {
    navigate('/chat/ai')
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <BackButton />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Chats
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* AI Chat Entry */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Chat with AI (Gemini)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Start a conversation even if you have no active matches.
            </Typography>
            <Button variant="contained" onClick={handleOpenAIChat}>Open AI Chat</Button>
          </CardContent>
        </Card>

        {/* Incoming Requests */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Incoming Requests
            </Typography>
            {incomingRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No incoming requests.</Typography>
            ) : (
              <List>
                {incomingRequests.map((m) => (
                  <ListItem key={m._id} secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" onClick={() => handleAccept(m)}>Accept</Button>
                      <Button size="small" variant="outlined" onClick={() => handleReject(m)}>Reject</Button>
                    </Box>
                  }>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getAvatarColor('U') }}>{getInitials('U')}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={`Request from ${m.otherUser?.alias || 'User'}`} secondary={`Shared: ${m.sharedEmotions?.join(', ') || '-'}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Active Rooms */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Active Chats
            </Typography>
            {rooms.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No active chats.</Typography>
            ) : (
              <List>
                {rooms.map((r) => (
                  <ListItem key={r.roomId} button onClick={() => navigate(`/chat/${r.roomId}`)}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getAvatarColor(r.otherParticipant?.alias || 'U') }}>
                        {getInitials(r.otherParticipant?.alias || 'U')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={r.otherParticipant?.alias || 'Anonymous'} secondary={`Messages: ${r.messageCount}`} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Chats


