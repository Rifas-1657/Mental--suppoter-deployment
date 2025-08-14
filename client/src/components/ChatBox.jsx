import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material'
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  Block
} from '@mui/icons-material'
import { useChat } from '../hooks/useChat'
import { useAuth } from '../hooks/useAuth'
import { getInitials, getAvatarColor, getEmotionIcon, getEmotionColor } from '../utils/helpers'

const ChatBox = ({ roomId, onClose }) => {
  const { user } = useAuth()
  const {
    messages,
    loading,
    error,
    typingUsers,
    suggestions,
    sendMessage,
    handleTyping,
    clearSuggestions
  } = useChat(roomId)

  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle typing with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        handleTyping(false)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [isTyping, handleTyping])

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)
    if (!isTyping) {
      setIsTyping(true)
      handleTyping(true)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const messageContent = newMessage.trim()
    setNewMessage('')
    setIsTyping(false)
    handleTyping(false)
    
    await sendMessage(messageContent)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion)
    clearSuggestions()
    inputRef.current?.focus()
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
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
        <Avatar
          sx={{
            bgcolor: getAvatarColor('Anonymous'),
            width: 40,
            height: 40
          }}
        >
          {getInitials('Anonymous')}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Anonymous Chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {typingUsers.length > 0 ? 'Typing...' : 'Online'}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <MoreVert />
        </IconButton>
        <IconButton color="error" title="Block">
          <Block />
        </IconButton>
      </Paper>

      {/* Messages Area */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.map((message) => {
          const isOwnMessage = message.sender === user._id || message.sender === 'current-user'
          
          return (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: isOwnMessage ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 1
                }}
              >
                {!isOwnMessage && (
                  <Avatar
                    sx={{
                      bgcolor: getAvatarColor(message.senderAlias || 'Anonymous'),
                      width: 32,
                      height: 32,
                      fontSize: '0.75rem'
                    }}
                  >
                    {getInitials(message.senderAlias || 'Anonymous')}
                  </Avatar>
                )}
                
                <Box>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: isOwnMessage ? 'primary.main' : 'background.paper',
                      color: isOwnMessage ? 'white' : 'text.primary',
                      borderRadius: 2,
                      maxWidth: '100%',
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                    
                    {/* Emotion indicator */}
                    {message.metadata?.emotion && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {getEmotionIcon(message.metadata.emotion)}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                  
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block', 
                      mt: 0.5,
                      textAlign: isOwnMessage ? 'right' : 'left'
                    }}
                  >
                    {formatTime(message.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )
        })}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
            <Avatar
              sx={{
                bgcolor: getAvatarColor('Anonymous'),
                width: 24,
                height: 24,
                fontSize: '0.625rem'
              }}
            >
              {getInitials('Anonymous')}
            </Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'background.paper'
              }}
            >
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <CircularProgress size={12} />
                <CircularProgress size={12} sx={{ animationDelay: '0.2s' }} />
                <CircularProgress size={12} sx={{ animationDelay: '0.4s' }} />
              </Box>
            </Paper>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            💡 AI Suggestions:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                size="small"
                variant="outlined"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Message Input */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <IconButton size="small">
            <AttachFile />
          </IconButton>
          <IconButton size="small">
            <EmojiEmotions />
          </IconButton>
          
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              '&.Mui-disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}

export default ChatBox
