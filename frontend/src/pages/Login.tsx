import { useState } from 'react'
import { Box, Button, Card, CardContent, Stack, Tab, Tabs, TextField, Typography, Avatar, Fade } from '@mui/material'
import { api, setAuthToken } from '../api'
import MapIcon from '@mui/icons-material/Map'

export default function Login({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const formatError = (errorDetail: any): string => {
    if (typeof errorDetail === 'string') {
      return errorDetail
    }
    if (Array.isArray(errorDetail)) {
      return errorDetail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
    }
    if (errorDetail && typeof errorDetail === 'object') {
      if (errorDetail.msg) return errorDetail.msg
      if (errorDetail.message) return errorDetail.message
      return JSON.stringify(errorDetail)
    }
    return 'Request failed'
  }
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError(null)

    // Client-side validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password.trim()) {
      setError('Password is required')
      return
    }
    if (tab === 1 && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const path = tab === 0 ? '/auth/login' : '/auth/register'
      const res = await api.post(path, { email: email.trim(), password })
      setAuthToken(res.data.access_token)
      onSuccess()
    } catch (e: any) {
      const errorMessage = formatError(e?.response?.data?.detail)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Fade in timeout={800}>
        <Card
          elevation={24}
          sx={{
            width: { xs: '100%', sm: 420 },
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'primary.main',
                  boxShadow: 3,
                }}
              >
                <MapIcon sx={{ fontSize: 32 }} />
              </Avatar>

              <Box textAlign="center">
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1,
                  }}
                >
                  Mapping Studio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transform your data with precision
                </Typography>
              </Box>

              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  width: '100%',
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    minHeight: 48,
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: 1.5,
                  }
                }}
              >
                <Tab label="Login" />
                <Tab label="Register" />
              </Tabs>

              <Stack spacing={2} sx={{ width: '100%' }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                {error && (
                  <Typography
                    color="error"
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      bgcolor: 'error.light',
                      color: 'error.contrastText',
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                    }}
                  >
                    {error}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  onClick={submit}
                  disabled={loading}
                  size="large"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      boxShadow: '0 6px 10px 2px rgba(102, 126, 234, .3)',
                    },
                  }}
                >
                  {loading ? 'Please wait...' : (tab === 0 ? 'Sign In' : 'Create Account')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  )
}
