import '@testing-library/jest-dom'

// Mock environment variables
import.meta.env = {
  VITE_API_URL: 'http://localhost:5000',
  VITE_SOCKET_URL: 'http://localhost:5000',
  VITE_APP_NAME: 'Mental Health Support Matcher',
  VITE_APP_VERSION: '1.0.0',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_CRISIS_DETECTION: 'true',
  VITE_ENABLE_AI_SUGGESTIONS: 'true',
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
