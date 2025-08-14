import { useState, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'
import { chatAPI } from '../services/api'
import { formatRelativeTime } from '../utils/helpers'

export const useChat = (roomId) => {
  const { socket, joinRoom, leaveRoom, sendMessage, startTyping, stopTyping } = useSocket()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [typingUsers, setTypingUsers] = useState([])
  const [suggestions, setSuggestions] = useState([])

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!roomId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await chatAPI.getMessages(roomId, { limit: 50 })
      setMessages(response.data.messages.map(msg => ({
        ...msg,
        formattedTime: formatRelativeTime(msg.createdAt)
      })))
    } catch (err) {
      setError(err.message || 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [roomId])

  // Send message
  const sendChatMessage = useCallback(async (content, messageType = 'text') => {
    if (!content.trim() || !roomId) return

    try {
      // Optimistically add message to UI
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content,
        messageType,
        sender: 'current-user',
        createdAt: new Date().toISOString(),
        formattedTime: 'Just now',
        isOptimistic: true
      }
      
      setMessages(prev => [...prev, tempMessage])
      
      // Send via socket
      sendMessage(roomId, content, messageType)
      
      // Also send via API for persistence
      await chatAPI.sendMessage(roomId, { content, messageType })
      
    } catch (err) {
      setError(err.message || 'Failed to send message')
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isOptimistic))
    }
  }, [roomId, sendMessage])

  // Handle typing
  const handleTyping = useCallback((isTyping) => {
    if (isTyping) {
      startTyping(roomId)
    } else {
      stopTyping(roomId)
    }
  }, [roomId, startTyping, stopTyping])

  // Socket event handlers
  useEffect(() => {
    if (!socket || !roomId) return

    // Join room
    joinRoom(roomId)

    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.roomId === roomId) {
        const newMessage = {
          ...data.message,
          formattedTime: formatRelativeTime(data.message.createdAt)
        }
        setMessages(prev => [...prev, newMessage])
      }
    }

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => [...prev.filter(user => user !== data.user), data.user])
      }
    }

    const handleTypingStop = (data) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => prev.filter(user => user !== data.user))
      }
    }

    // Listen for AI suggestions
    const handleSuggestions = (data) => {
      if (data.roomId === roomId) {
        setSuggestions(data.suggestions)
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('typing_start', handleTypingStart)
    socket.on('typing_stop', handleTypingStop)
    socket.on('response_suggestions', handleSuggestions)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('typing_start', handleTypingStart)
      socket.off('typing_stop', handleTypingStop)
      socket.off('response_suggestions', handleSuggestions)
      leaveRoom(roomId)
    }
  }, [socket, roomId, joinRoom, leaveRoom])

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    loading,
    error,
    typingUsers,
    suggestions,
    sendMessage: sendChatMessage,
    handleTyping,
    loadMessages,
    clearSuggestions: () => setSuggestions([])
  }
}
