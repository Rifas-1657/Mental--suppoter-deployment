import React from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Avatar,
  Chip,
  Button,
  Box,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  Chat,
  Favorite,
  FavoriteBorder,
  Psychology,
  Interests,
  AccessTime
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { getInitials, getAvatarColor, getEmotionColor, getEmotionIcon, isUserOnline } from '../utils/helpers'

const MatchCard = ({ match, onConnect, onLike, isLiked = false }) => {
  const navigate = useNavigate()

  const handleConnect = () => {
    if (onConnect) {
      onConnect(match)
    }
  }

  const handleLike = () => {
    if (onLike) {
      onLike(match._id, !isLiked)
    }
  }

  const handleViewProfile = () => {
    navigate(`/profile/${match._id}`)
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header with Avatar and Online Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              sx={{
                bgcolor: getAvatarColor(match.alias),
                width: 56,
                height: 56,
                fontSize: '1.25rem',
                border: 2,
                borderColor: isUserOnline(match.lastSeen) ? 'success.main' : 'grey.300'
              }}
            >
              {getInitials(match.alias)}
            </Avatar>
            {isUserOnline(match.lastSeen) && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 16,
                  height: 16,
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  border: 2,
                  borderColor: 'white'
                }}
              />
            )}
          </Box>
          
          <Box sx={{ ml: 2, flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {match.alias}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {isUserOnline(match.lastSeen) ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={handleLike} color={isLiked ? 'error' : 'default'}>
            {isLiked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Box>

        {/* Compatibility Score */}
        {match.compatibility && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Compatibility
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {match.compatibility.overallScore}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={match.compatibility.overallScore}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: 'primary.main'
                }
              }}
            />
          </Box>
        )}

        {/* Emotion Tags */}
        {match.emotionTags && match.emotionTags.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Psychology sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Emotions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {match.emotionTags.slice(0, 3).map((emotion) => (
                <Chip
                  key={emotion}
                  label={`${getEmotionIcon(emotion)} ${emotion}`}
                  size="small"
                  sx={{
                    bgcolor: getEmotionColor(emotion),
                    color: 'white',
                    fontSize: '0.75rem'
                  }}
                />
              ))}
              {match.emotionTags.length > 3 && (
                <Chip
                  label={`+${match.emotionTags.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Interests */}
        {match.interests && match.interests.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Interests sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Interests
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {match.interests.slice(0, 3).map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
              {match.interests.length > 3 && (
                <Chip
                  label={`+${match.interests.length - 3}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Bio */}
        {match.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {match.bio}
          </Typography>
        )}

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {match.stats?.totalChats || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Chats
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {match.stats?.matchesFound || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Matches
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleViewProfile}
          sx={{ flex: 1 }}
        >
          View Profile
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Chat />}
          onClick={handleConnect}
          sx={{ flex: 1 }}
        >
          Connect
        </Button>
      </CardActions>
    </Card>
  )
}

export default MatchCard
