import React, { useState } from 'react'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Psychology,
  CheckCircle
} from '@mui/icons-material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail, validatePassword } from '../utils/helpers'

const steps = ['Account Details', 'Profile Setup', 'Confirmation']

const Register = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { register, error, loading } = useAuth()
  
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    alias: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep = (step) => {
    const errors = {}

    switch (step) {
      case 0: // Account Details
        if (!formData.email) {
          errors.email = 'Email is required'
        } else if (!isValidEmail(formData.email)) {
          errors.email = 'Please enter a valid email address'
        }

        if (!formData.password) {
          errors.password = 'Password is required'
        } else {
          const passwordValidation = validatePassword(formData.password)
          if (!passwordValidation.isValid) {
            errors.password = Object.values(passwordValidation.errors).filter(Boolean)[0]
          }
        }

        if (!formData.confirmPassword) {
          errors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match'
        }
        break

      case 1: // Profile Setup
        if (!formData.alias) {
          errors.alias = 'Alias is required'
        } else if (formData.alias.length < 3) {
          errors.alias = 'Alias must be at least 3 characters'
        } else if (formData.alias.length > 20) {
          errors.alias = 'Alias must be less than 20 characters'
        } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.alias)) {
          errors.alias = 'Alias can only contain letters, numbers, hyphens, and underscores'
        }
        break

      default:
        break
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return
    }

    try {
      await register({
           email: formData.email,
           password: formData.password,
           alias: formData.alias
         })
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const handleTogglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Create Your Account
            </Typography>
            
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleToggleConfirmPassword} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
          </Box>
        )

      case 1:
        return (
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Choose Your Alias
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This will be your anonymous identity in the app. Choose something that represents you.
            </Typography>

            <TextField
              fullWidth
              label="Alias"
              name="alias"
              value={formData.alias}
              onChange={handleInputChange}
              error={!!validationErrors.alias}
              helperText={validationErrors.alias || '3-20 characters, letters, numbers, hyphens, and underscores only'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Privacy Note:</strong> Your alias will be visible to other users, but your email and personal information will remain private.
              </Typography>
            </Box>
          </Box>
        )

      case 2:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Ready to Get Started!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your information and create your account to begin your mental health support journey.
            </Typography>
            
            <Box sx={{ textAlign: 'left', bgcolor: 'background.default', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {formData.email}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Alias:</strong> {formData.alias}
              </Typography>
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3
          }}
        >
          {/* Logo/Icon */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <Psychology sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Join Our Community
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start your journey to better mental health
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Create Account'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ px: 4 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/login"
                sx={{
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign in here
              </Link>
            </Typography>
          </Box>

          {/* Privacy Notice */}
          <Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" align="center">
              By creating an account, you agree to our{' '}
              <Link href="#" sx={{ textDecoration: 'none' }}>
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="#" sx={{ textDecoration: 'none' }}>
                Terms of Service
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Register
