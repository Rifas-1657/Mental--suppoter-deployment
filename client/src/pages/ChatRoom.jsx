import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  ArrowBack,
  MoreVert,
  Chat,
  Person,
  Settings,
  Help,
  Security
} from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ChatBox from '../components/ChatBox'
import LoadingSpinner from '../components/LoadingSpinner'
import BackButton from '../components/BackButton'

const ChatRoom = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleBack = () => {
    navigate('/matchmaking')
  }

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleCloseChat = () => {
    navigate('/matchmaking')
  }

  const drawerItems = [
    { icon: <Person />, text: 'Profile', action: () => navigate('/profile') },
    { icon: <Chat />, text: 'My Matches', action: () => navigate('/matchmaking') },
    { icon: <Settings />, text: 'Settings', action: () => {} },
    { icon: <Help />, text: 'Help & Support', action: () => {} },
    { icon: <Security />, text: 'Privacy Policy', action: () => {} }
  ]

  if (loading) {
    return <LoadingSpinner message="Loading chat..." />
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <BackButton label="Back" />
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Anonymous Chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Room: {roomId}
          </Typography>
        </Box>

        <IconButton onClick={handleDrawerToggle}>
          <MoreVert />
        </IconButton>
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <ChatBox roomId={roomId} onClose={handleCloseChat} />
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Menu
          </Typography>
        </Box>
        
        <Divider />
        
        <List>
          {drawerItems.map((item, index) => (
            <ListItem
              key={index}
              button
              onClick={() => {
                item.action()
                setDrawerOpen(false)
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  )
}

export default ChatRoom
