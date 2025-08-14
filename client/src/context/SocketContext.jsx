import React, { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

export const SocketContext = createContext()

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection with authentication
      const socketBase = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? undefined : window.location.origin)
      socketRef.current = io(socketBase, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      })

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('Connected to server')
      })

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        toast.error('Connection error. Please refresh the page.')
      })

      // Chat events
      socketRef.current.on('new_message', (data) => {
        // This will be handled by the chat component
        console.log('New message received:', data)
      })

      socketRef.current.on('typing_start', (data) => {
        // Handle typing indicator
        console.log('User started typing:', data)
      })

      socketRef.current.on('typing_stop', (data) => {
        // Handle typing indicator stop
        console.log('User stopped typing:', data)
      })

      socketRef.current.on('response_suggestions', (data) => {
        // Handle AI response suggestions
        console.log('AI suggestions received:', data)
      })

      socketRef.current.on('crisis_detected', (data) => {
        // Handle crisis detection
        toast.error('Crisis detected. Please seek professional help immediately.')
        console.log('Crisis detected:', data)
      })

      socketRef.current.on('error', (error) => {
        console.error('Socket error:', error)
        toast.error(error.message || 'An error occurred')
      })

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }
  }, [user, token])

  const joinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', { roomId })
    }
  }

  const leaveRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', { roomId })
    }
  }

  const sendMessage = (roomId, content, messageType = 'text') => {
    if (socketRef.current) {
      socketRef.current.emit('send_message', { roomId, content, messageType })
    }
  }

  const startTyping = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing_start', { roomId })
    }
  }

  const stopTyping = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('typing_stop', { roomId })
    }
  }

  const reactToMessage = (roomId, messageId, reaction) => {
    if (socketRef.current) {
      socketRef.current.emit('react_to_message', { roomId, messageId, reaction })
    }
  }

  const markMessageRead = (roomId, messageId) => {
    if (socketRef.current) {
      socketRef.current.emit('mark_read', { roomId, messageId })
    }
  }

  const updateStatus = (status) => {
    if (socketRef.current) {
      socketRef.current.emit('update_status', { status })
    }
  }

  const value = {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    reactToMessage,
    markMessageRead,
    updateStatus,
    isConnected: socketRef.current?.connected || false
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
