import { useEffect, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Box } from '@mui/material'
import Login from './pages/Login'
import MappingProfiles from './pages/MappingProfiles'
import EntityManager from './pages/EntityManager'
import Navigation from './components/Navigation'
import { initAuthFromStorage } from './api'

type Page = 'profiles' | 'entities'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
      light: '#9fa8ff',
      dark: '#3f51b5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#a66dd4',
      dark: '#4a2c73',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#607d8b',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#ef5350',
      dark: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
  },
})

export default function App() {
  const [authed, setAuthed] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<Page>('profiles')
  const [authInitialized, setAuthInitialized] = useState<boolean>(false)

  useEffect(() => {
    initAuthFromStorage()
    setAuthed(!!localStorage.getItem('token'))
    setAuthInitialized(true)
  }, [])

  // Respond to cross-app logout signals without full page reloads
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        setAuthed(!!localStorage.getItem('token'))
        if (!localStorage.getItem('token')) {
          setCurrentPage('profiles')
        }
      }
    }

    const handleSoftLogout = () => {
      setAuthed(false)
      setCurrentPage('profiles')
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('auth:logout', handleSoftLogout as EventListener)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('auth:logout', handleSoftLogout as EventListener)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setAuthed(false)
    setCurrentPage('profiles')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'entities':
        return <EntityManager />
      case 'profiles':
      default:
        return <MappingProfiles />
    }
  }

  // Show loading or login screen until auth is initialized
  if (!authInitialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {authed ? (
        <Box sx={{ minHeight: '100vh', display: 'flex' }}>
          <Navigation
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
          />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {renderCurrentPage()}
          </Box>
        </Box>
      ) : (
        <Login onSuccess={() => setAuthed(true)} />
      )}
    </ThemeProvider>
  )
}
