import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

export const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const navigate = useNavigate()

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
        return
      }

      try {
        dispatch({ type: 'AUTH_START' })
        const response = await authAPI.getCurrentUser()
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token }
        })
      } catch (error) {
        localStorage.removeItem('token')
        dispatch({ type: 'AUTH_FAILURE', payload: error.message })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.login(email, password)
      const { user, token } = response.data

      localStorage.setItem('token', token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })

      toast.success('Login successful!')
      
      // Redirect based on profile completion
      if (!user.emotionTags || user.emotionTags.length === 0) {
        navigate('/onboarding')
      } else {
        navigate('/matchmaking')
      }
    } catch (error) {
      const message = error?.response?.data?.error || error.message
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      toast.error(message === 'User already exists with this email' ? 'You already have an account. Please sign in.' : (message || 'Login failed'))
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.register(userData)
      const { user, token } = response.data

      localStorage.setItem('token', token)
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })

      toast.success('Registration successful!')
      navigate('/onboarding')
    } catch (error) {
      const message = error?.response?.data?.error || error.message
      dispatch({ type: 'AUTH_FAILURE', payload: message })
      if (message && message.toLowerCase().includes('already exists')) {
        toast.error("You've already have an account. Please login instead.")
      } else {
        toast.error(message || 'Registration failed')
      }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
      navigate('/')
      toast.success('Logged out successfully')
    }
  }

  // Update user profile
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Check if user has completed onboarding
  const hasCompletedOnboarding = () => {
    return state.user && state.user.emotionTags && state.user.emotionTags.length > 0
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasCompletedOnboarding,
    isAuthenticated: !!state.token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
