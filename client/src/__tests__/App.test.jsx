import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ThemeProvider } from '@mui/material/styles'
import App from '../App'
import { AuthProvider } from '../context/AuthContext'
import { SocketProvider } from '../context/SocketContext'
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext'
import { theme } from '../styles/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithProviders = (component) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CustomThemeProvider>
          <ThemeProvider theme={theme}>
            <AuthProvider>
              <SocketProvider>
                {component}
              </SocketProvider>
            </AuthProvider>
          </ThemeProvider>
        </CustomThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('App', () => {
  test('renders without crashing', () => {
    renderWithProviders(<App />)
    expect(screen.getByText(/Mental Health Matcher/i)).toBeInTheDocument()
  })
})
