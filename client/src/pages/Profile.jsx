import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Chip,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Edit,
  Save,
  Cancel,
  Person,
  Psychology,
  Interests,
  Settings,
  BarChart,
  Security
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { profileAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { getInitials, getAvatarColor, getEmotionIcon, getEmotionColor } from '../utils/helpers'

const Profile = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, updateUser } = useAuth()
  
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState(null)
  
  const [formData, setFormData] = useState({
    alias: user?.alias || '',
    bio: user?.bio || '',
    emotionTags: user?.emotionTags || [],
    interests: user?.interests || []
  })

  const [preferences, setPreferences] = useState({
    allowAnonymousChat: user?.preferences?.allowAnonymousChat ?? true,
    notificationSettings: {
      email: user?.preferences?.notificationSettings?.email ?? true,
      push: user?.preferences?.notificationSettings?.push ?? true
    },
    privacyLevel: user?.preferences?.privacyLevel || 'friends'
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await profileAPI.getStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

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

  const handlePreferenceChange = (name, value) => {
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        alias: formData.alias,
        bio: formData.bio,
        ...(formData.emotionTags && formData.emotionTags.length > 0 ? { emotionTags: formData.emotionTags } : {}),
        ...(formData.interests && formData.interests.length > 0 ? { interests: formData.interests } : {}),
      }
      await profileAPI.updateProfile(payload)
      await updateUser({ ...user, ...formData })
      setIsEditing(false)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      alias: user?.alias || '',
      bio: user?.bio || '',
      emotionTags: user?.emotionTags || [],
      interests: user?.interests || []
    })
    setIsEditing(false)
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    setError(null)

    try {
      await profileAPI.updatePreferences(preferences)
      await updateUser({ 
        ...user, 
        preferences: { ...user.preferences, ...preferences }
      })
    } catch (err) {
      setError(err.message || 'Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Profile
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Profile Information
              </Typography>
              {!isEditing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: '3rem',
                        bgcolor: getAvatarColor(user?.alias || ''),
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {getInitials(user?.alias || 'U')}
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {user?.alias || 'Anonymous'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Member since {new Date(user?.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <TextField
                      fullWidth
                      label="Alias"
                      name="alias"
                      value={formData.alias}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      sx={{ mb: 3 }}
                    />

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      inputProps={{ maxLength: 500 }}
                      helperText={`${formData.bio.length}/500 characters`}
                      sx={{ mb: 3 }}
                    />

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Emotions
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {['anxiety', 'depression', 'stress', 'loneliness', 'grief', 'anger', 'fear', 'sadness', 'joy', 'hope', 'gratitude', 'confusion', 'overwhelm', 'peace', 'excitement', 'calm'].map((emotion) => (
                        <Chip
                          key={emotion}
                          label={`${getEmotionIcon(emotion)} ${emotion}`}
                          onClick={isEditing ? () => handleEmotionToggle(emotion) : undefined}
                          color={formData.emotionTags.includes(emotion) ? 'primary' : 'default'}
                          variant={formData.emotionTags.includes(emotion) ? 'filled' : 'outlined'}
                          sx={{
                            bgcolor: formData.emotionTags.includes(emotion) ? getEmotionColor(emotion) : 'transparent',
                            color: formData.emotionTags.includes(emotion) ? 'white' : 'inherit',
                            cursor: isEditing ? 'pointer' : 'default'
                          }}
                        />
                      ))}
                    </Box>

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Interests
                    </Typography>
                    {isEditing && (
                      <TextField
                        fullWidth
                        label="Add an interest"
                        placeholder="e.g., reading, music, sports..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleInterestAdd(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        sx={{ mb: 2 }}
                      />
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.interests.map((interest) => (
                        <Chip
                          key={interest}
                          label={interest}
                          onDelete={isEditing ? () => handleInterestRemove(interest) : undefined}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )

      case 1: // Statistics
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Your Statistics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats?.totalChats || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Chats
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats?.totalMessages || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Messages Sent
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats?.matchesFound || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Matches Found
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700, mb: 1 }}>
                      {stats?.avgCompatibility || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Compatibility
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )

      case 2: // Settings
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Privacy & Settings
            </Typography>

            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Chat Settings
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.allowAnonymousChat}
                      onChange={(e) => handlePreferenceChange('allowAnonymousChat', e.target.checked)}
                    />
                  }
                  label="Allow anonymous chat requests"
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Notifications
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notificationSettings.email}
                      onChange={(e) => handlePreferenceChange('notificationSettings', {
                        ...preferences.notificationSettings,
                        email: e.target.checked
                      })}
                    />
                  }
                  label="Email notifications"
                  sx={{ mb: 2 }}
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notificationSettings.push}
                      onChange={(e) => handlePreferenceChange('notificationSettings', {
                        ...preferences.notificationSettings,
                        push: e.target.checked
                      })}
                    />
                  }
                  label="Push notifications"
                  sx={{ mb: 2 }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Privacy Level
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Control who can see your profile information
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {['public', 'friends', 'private'].map((level) => (
                    <Chip
                      key={level}
                      label={level.charAt(0).toUpperCase() + level.slice(1)}
                      onClick={() => handlePreferenceChange('privacyLevel', level)}
                      color={preferences.privacyLevel === level ? 'primary' : 'default'}
                      variant={preferences.privacyLevel === level ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleSavePreferences}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Save Preferences'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Profile
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your account and preferences
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Profile" icon={<Person />} />
            <Tab label="Statistics" icon={<BarChart />} />
            <Tab label="Settings" icon={<Settings />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </Box>
  )
}

export default Profile
