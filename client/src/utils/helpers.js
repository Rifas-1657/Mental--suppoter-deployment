// Format timestamp to relative time
export const formatRelativeTime = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

// Format timestamp to readable date
export const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Generate random avatar color
export const getAvatarColor = (alias) => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
    '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
    '#ff5722', '#795548', '#9e9e9e', '#607d8b'
  ]
  const index = alias.charCodeAt(0) % colors.length
  return colors[index]
}

// Generate initials from name/alias
export const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      length: password.length < minLength ? `At least ${minLength} characters` : null,
      uppercase: !hasUpperCase ? 'At least one uppercase letter' : null,
      lowercase: !hasLowerCase ? 'At least one lowercase letter' : null,
      numbers: !hasNumbers ? 'At least one number' : null,
    }
  }
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Generate random string
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Calculate compatibility score
export const calculateCompatibility = (user1, user2) => {
  let score = 0
  let totalFactors = 0

  // Emotion tags compatibility
  if (user1.emotionTags && user2.emotionTags) {
    const sharedEmotions = user1.emotionTags.filter(tag => 
      user2.emotionTags.includes(tag)
    )
    const emotionScore = (sharedEmotions.length / Math.max(user1.emotionTags.length, user2.emotionTags.length)) * 100
    score += emotionScore
    totalFactors++
  }

  // Interests compatibility
  if (user1.interests && user2.interests) {
    const sharedInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    )
    const interestScore = (sharedInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 100
    score += interestScore
    totalFactors++
  }

  return totalFactors > 0 ? Math.round(score / totalFactors) : 0
}

// Get emotion color
export const getEmotionColor = (emotion) => {
  const emotionColors = {
    anxiety: '#ff9800',
    depression: '#9c27b0',
    stress: '#f44336',
    loneliness: '#607d8b',
    grief: '#795548',
    anger: '#d32f2f',
    fear: '#7b1fa2',
    sadness: '#1976d2',
    joy: '#4caf50',
    hope: '#8bc34a',
    gratitude: '#ffc107',
    confusion: '#9e9e9e',
    overwhelm: '#e91e63',
    peace: '#00bcd4',
    excitement: '#ff5722',
    calm: '#009688'
  }
  return emotionColors[emotion] || '#9e9e9e'
}

// Get emotion icon
export const getEmotionIcon = (emotion) => {
  const emotionIcons = {
    anxiety: '😰',
    depression: '😔',
    stress: '😤',
    loneliness: '😢',
    grief: '💔',
    anger: '😠',
    fear: '😨',
    sadness: '😞',
    joy: '😊',
    hope: '✨',
    gratitude: '🙏',
    confusion: '😕',
    overwhelm: '😵',
    peace: '😌',
    excitement: '🤩',
    calm: '😌'
  }
  return emotionIcons[emotion] || '😐'
}

// Check if user is online
export const isUserOnline = (lastSeen) => {
  if (!lastSeen) return false
  const now = new Date()
  const lastSeenDate = new Date(lastSeen)
  const diffInMinutes = (now - lastSeenDate) / (1000 * 60)
  return diffInMinutes < 5 // Consider online if last seen within 5 minutes
}

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validate file type
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

// Validate file size
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize
}
