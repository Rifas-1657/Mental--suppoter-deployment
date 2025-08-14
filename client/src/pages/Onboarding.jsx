import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Psychology,
  Interests,
  Description,
  CheckCircle
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { profileAPI, matchAPI } from '../services/api'
import { getEmotionIcon, getEmotionColor } from '../utils/helpers'

const steps = ['Emotional Profile', 'Interests', 'Bio', 'Complete']

const Onboarding = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [availableEmotions, setAvailableEmotions] = useState([])
  
  const [formData, setFormData] = useState({
    emotionTags: [],
    interests: [],
    bio: ''
  })

  // Suggested interests (click to add)
  const suggestedInterests = [
    'music', 'reading', 'sports', 'art', 'gaming', 'coding', 'movies', 'travel',
    'photography', 'writing', 'fitness', 'yoga', 'meditation', 'cooking', 'nature',
    'volunteering', 'mental health', 'journaling', 'podcasts', 'technology'
  ]

  // Load available emotions
  useEffect(() => {
    const loadEmotions = async () => {
      try {
        const response = await matchAPI.getEmotions()
        // Map to string values expected by UI helpers
        const emotionValues = (response.data.emotions || []).map(e => e.value || e)
        setAvailableEmotions(emotionValues)
      } catch (err) {
        console.error('Failed to load emotions:', err)
      }
    }
    loadEmotions()
  }, [])

  const handleEmotionToggle = (emotion) => {
    setFormData(prev => ({
      ...prev,
      emotionTags: prev.emotionTags.includes(emotion)
        ? prev.emotionTags.filter(e => e !== emotion)
        : prev.emotionTags.length < 5
          ? [...prev.emotionTags, emotion]
          : prev.emotionTags
    }))
  }

  const handleInterestAdd = (interest) => {
    if (interest.trim() && !formData.interests.includes(interest.trim()) && formData.interests.length < 10) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }))
    }
  }

  const handleInterestRemove = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  const handleBioChange = (e) => {
    setFormData(prev => ({
      ...prev,
      bio: e.target.value
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.emotionTags.length > 0
      case 1:
        return formData.interests.length > 0
      case 2:
        return true // Bio is optional
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleComplete = async () => {
    setLoading(true)
    setError(null)

    try {
      await profileAPI.completeOnboarding(formData)
      await updateUser({ ...user, ...formData })
      navigate('/matchmaking')
    } catch (err) {
      setError(err.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              How are you feeling lately?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select up to 5 emotions that best describe your current state. This helps us match you with supportive peers.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {availableEmotions.map((emotion) => (
                <Chip
                  key={emotion}
                  label={`${getEmotionIcon(emotion)} ${emotion}`}
                  onClick={() => handleEmotionToggle(emotion)}
                  color={formData.emotionTags.includes(emotion) ? 'primary' : 'default'}
                  variant={formData.emotionTags.includes(emotion) ? 'filled' : 'outlined'}
                  sx={{
                    bgcolor: formData.emotionTags.includes(emotion) ? getEmotionColor(emotion) : 'transparent',
                    color: formData.emotionTags.includes(emotion) ? 'white' : 'inherit',
                    '&:hover': {
                      bgcolor: formData.emotionTags.includes(emotion) ? getEmotionColor(emotion) : 'grey.100'
                    }
                  }}
                />
              ))}
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Selected: {formData.emotionTags.length}/5
            </Typography>
          </Box>
        )

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              What are your interests?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add interests that help others understand you better. This improves matching compatibility.
            </Typography>
            
            <TextField
              fullWidth
              label="Add an interest"
              placeholder="e.g., reading, music, sports, art..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleInterestAdd(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {suggestedInterests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  onClick={() => handleInterestAdd(interest)}
                  color={formData.interests.includes(interest) ? 'primary' : 'default'}
                  variant={formData.interests.includes(interest) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {formData.interests.map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  onDelete={() => handleInterestRemove(interest)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Added: {formData.interests.length}/10
            </Typography>
          </Box>
        )

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Tell us about yourself
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Share a brief bio to help others get to know you. This is optional but helps with matching.
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Bio"
              placeholder="Share something about yourself, your journey, or what you're looking for in a support partner..."
              value={formData.bio}
              onChange={handleBioChange}
              inputProps={{ maxLength: 500 }}
              helperText={`${formData.bio.length}/500 characters`}
            />
          </Box>
        )

      case 3:
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              You're All Set!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your profile is complete. You can now start finding supportive matches and begin your mental health journey.
            </Typography>
            
            <Box sx={{ textAlign: 'left', bgcolor: 'background.default', p: 2, borderRadius: 2, mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Emotions:</strong> {formData.emotionTags.join(', ')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Interests:</strong> {formData.interests.join(', ')}
              </Typography>
              {formData.bio && (
                <Typography variant="body2">
                  <strong>Bio:</strong> {formData.bio}
                </Typography>
              )}
            </Box>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          {/* Header */}
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
              Welcome to Your Journey
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Let's set up your profile to find the best support matches
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
          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                  onClick={handleComplete}
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep)}
                  sx={{ px: 4 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          {/* Progress Indicator */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Onboarding
