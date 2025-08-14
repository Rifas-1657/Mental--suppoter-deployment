import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Search,
  FilterList,
  Refresh,
  Chat,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useMatch } from '../hooks/useMatch'
import { useAuth } from '../hooks/useAuth'
import MatchCard from '../components/MatchCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { getEmotionIcon, getEmotionColor } from '../utils/helpers'

const Matchmaking = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    matches,
    myMatches,
    emotions,
    loading,
    error,
    suggestions,
    findMatches,
    loadMyMatches,
    createMatch,
    clearError
  } = useMatch()

  const [activeTab, setActiveTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState([])
  const [likedMatches, setLikedMatches] = useState(new Set())

  useEffect(() => {
    loadMyMatches()
    findMatches()
  }, [loadMyMatches, findMatches])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleEmotionToggle = (emotion) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    )
  }

  const handleSearch = () => {
    const filters = {}
    if (searchTerm) filters.q = searchTerm
    if (selectedEmotions.length > 0) filters.emotionTags = selectedEmotions
    findMatches(filters)
  }

  const handleRefresh = () => {
    setSearchTerm('')
    setSelectedEmotions([])
    findMatches()
  }

  const handleLike = (matchId, isLiked) => {
    setLikedMatches(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.add(matchId)
      } else {
        newSet.delete(matchId)
      }
      return newSet
    })
  }

  const handleConnect = async (match) => {
    try {
      const newMatch = await createMatch({
        targetUserId: match._id,
        emotionTags: match.emotionTags,
        interests: match.interests
      })
      
      if (newMatch?.chatRoom?.roomId) {
        navigate(`/chat/${newMatch.chatRoom.roomId}`)
      }
    } catch (err) {
      console.error('Failed to create match:', err)
    }
  }

  const filteredMatches = matches.filter(match => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        match.alias.toLowerCase().includes(searchLower) ||
        match.bio?.toLowerCase().includes(searchLower) ||
        match.interests?.some(interest => interest.toLowerCase().includes(searchLower))
      )
    }
    return true
  })

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Find Matches
        return (
          <Box>
            {/* Search and Filters */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Find Support Partners
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <TextField
                    placeholder="Search by alias, bio, or interests..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flexGrow: 1, minWidth: 200 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<Search />}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleRefresh}
                    startIcon={<Refresh />}
                  >
                    Refresh
                  </Button>
                </Box>

                {/* Emotion Filters */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Filter by emotions:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {emotions.map((emotion) => (
                      <Chip
                        key={emotion}
                        label={`${getEmotionIcon(emotion)} ${emotion}`}
                        onClick={() => handleEmotionToggle(emotion)}
                        color={selectedEmotions.includes(emotion) ? 'primary' : 'default'}
                        variant={selectedEmotions.includes(emotion) ? 'filled' : 'outlined'}
                        size="small"
                        sx={{
                          bgcolor: selectedEmotions.includes(emotion) ? getEmotionColor(emotion) : 'transparent',
                          color: selectedEmotions.includes(emotion) ? 'white' : 'inherit'
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* AI Suggestions */}
                {suggestions.length > 0 && (
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      💡 AI Suggestions:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {suggestions.join(', ')}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Matches Grid */}
            {loading ? (
              <LoadingSpinner message="Finding matches..." />
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : filteredMatches.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No matches found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your search criteria or check back later for new matches.
                  </Typography>
                  <Button variant="outlined" onClick={handleRefresh}>
                    Refresh Matches
                  </Button>
                </CardContent>
              </Card>
                ) : (
              <Grid container spacing={3}>
                {filteredMatches.map((match) => (
                  <Grid item xs={12} sm={6} md={4} key={match._id}>
                    <MatchCard
                      match={match}
                      onConnect={handleConnect}
                      onLike={handleLike}
                      isLiked={likedMatches.has(match._id)}
                    />
                  </Grid>
                ))}
                    {filteredMatches.length === 0 && (
                      <Grid item xs={12}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 3 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              No human matches right now. You can still chat with AI.
                            </Typography>
                            <Button variant="contained" onClick={() => navigate('/chat/ai')}>Chat with AI</Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
              </Grid>
            )}
          </Box>
        )

      case 1: // My Matches
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Your Active Matches
            </Typography>

            {loading ? (
              <LoadingSpinner message="Loading your matches..." />
            ) : myMatches.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No active matches yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Start connecting with potential support partners to see your matches here.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab(0)}
                  >
                    Find Matches
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {myMatches.map((match) => (
                  <Grid item xs={12} sm={6} md={4} key={match._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Match with {match.users.find(u => u._id !== user._id)?.alias || 'Anonymous'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Status: {match.status}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Compatibility: {match.compatibility?.overallScore || 0}%
                        </Typography>
                        {match.chatRoom && (
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<Chat />}
                            onClick={() => navigate(`/chat/${match.chatRoom.roomId}`)}
                          >
                            Continue Chat
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
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
            Find Your Support Partner
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Connect with peers who understand your emotional journey
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Find Matches" />
            <Tab label="My Matches" />
          </Tabs>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
            {error}
          </Alert>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </Container>
    </Box>
  )
}

export default Matchmaking
