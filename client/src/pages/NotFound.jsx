import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material'
import {
  Home,
  Search,
  Psychology
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NotFound = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate(-1)
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
      <Container maxWidth="md">
        <Paper
          elevation={8}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <Psychology sx={{ fontSize: 60, color: 'white' }} />
          </Box>

          {/* 404 Text */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 700,
              color: 'primary.main',
              mb: 2
            }}
          >
            404
          </Typography>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 2
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{ px: 4, py: 1.5 }}
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Search />}
              onClick={handleGoBack}
              sx={{ px: 4, py: 1.5 }}
            >
              Go Back
            </Button>
          </Box>

          {/* Additional Help */}
          <Box sx={{ mt: 6, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Need Help?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              If you're looking for mental health support, you can:
            </Typography>
            <Box sx={{ textAlign: 'left', maxWidth: 400, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • {user ? 'Go to your matches' : 'Sign up'} to find support partners
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • Contact our support team
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Visit our help center
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default NotFound
