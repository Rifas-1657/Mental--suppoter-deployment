import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Brightness4,
  Brightness7,
  AccountCircle,
  Notifications,
  Chat,
  Menu as MenuIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme as useCustomTheme } from '../hooks/useTheme'
import { getInitials, getAvatarColor } from '../utils/helpers'

const Navbar = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useCustomTheme()
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMobileMenuAnchor(null)
  }

  const handleLogout = () => {
    logout()
    handleMenuClose()
  }

  const handleProfileClick = () => {
    navigate('/profile')
    handleMenuClose()
  }

  const handleMatchesClick = () => {
    navigate('/matchmaking')
    handleMenuClose()
  }

  const menuItems = [
    { label: 'Profile', onClick: handleProfileClick },
    { label: 'Matches', onClick: handleMatchesClick },
    { label: 'Logout', onClick: handleLogout }
  ]

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 700,
            color: 'primary.main'
          }}
          onClick={() => navigate('/')}
        >
          Mental Health Matcher
        </Typography>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Theme Toggle */}
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{ ml: 1 }}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit" onClick={() => navigate('/chats')}>
              <Badge badgeContent={0} color="error">
                <Notifications />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: getAvatarColor(user?.alias || ''),
                  width: 32,
                  height: 32,
                  fontSize: '0.875rem'
                }}
              >
                {getInitials(user?.alias || 'U')}
              </Avatar>
            </IconButton>
          </Box>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={handleMobileMenuOpen}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Desktop User Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {menuItems.map((item) => (
            <MenuItem key={item.label} onClick={item.onClick}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Mobile Menu */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleMatchesClick}>
            <Chat sx={{ mr: 1 }} />
            Matches
          </MenuItem>
          <MenuItem onClick={handleProfileClick}>
            <AccountCircle sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={toggleTheme}>
            {isDarkMode ? <Brightness7 sx={{ mr: 1 }} /> : <Brightness4 sx={{ mr: 1 }} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
