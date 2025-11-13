import { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Paper
} from '@mui/material'
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Link as LinkIcon,
  Business as BusinessIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material'

type Page = 'profiles' | 'entities'

interface NavigationProps {
  currentPage: Page
  onPageChange: (page: Page) => void
  onLogout: () => void
}

export default function Navigation({ currentPage, onPageChange, onLogout }: NavigationProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    {
      key: 'profiles' as Page,
      label: 'Mapping Profiles',
      icon: <LinkIcon />,
    },
    {
      key: 'entities' as Page,
      label: 'Entity Manager',
      icon: <BusinessIcon />,
    },
  ]

  const handlePageChange = (page: Page) => {
    onPageChange(page)
    if (isMobile) {
      setMobileMenuOpen(false)
    }
  }

  const sidebarWidth = sidebarExpanded ? 240 : 72

  // Desktop Sidebar
  const renderDesktopSidebar = () => (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: sidebarWidth,
        backgroundColor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        zIndex: 1000,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        }}
      >
        <Collapse in={sidebarExpanded} orientation="horizontal">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap'
            }}
          >
            🔗 Mapping Studio
          </Typography>
        </Collapse>

        <IconButton
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {sidebarExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handlePageChange(item.key)}
                selected={currentPage === item.key}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  px: 2,
                  minHeight: 48,
                  justifyContent: sidebarExpanded ? 'flex-start' : 'center',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                  '&:hover': {
                    backgroundColor: currentPage === item.key ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'auto',
                    mr: sidebarExpanded ? 2 : 0,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Collapse in={sidebarExpanded} orientation="horizontal">
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      noWrap: true,
                    }}
                  />
                </Collapse>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 2,
              minHeight: 48,
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 'auto',
                mr: sidebarExpanded ? 2 : 0,
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <Collapse in={sidebarExpanded} orientation="horizontal">
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }}
              />
            </Collapse>
          </ListItemButton>
        </ListItem>
      </Box>
    </Paper>
  )

  // Mobile Navigation
  const renderMobileNavigation = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
          🔗 Mapping Studio
        </Typography>
      </Box>

      <List sx={{ pt: 1 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            <ListItemButton
              selected={currentPage === item.key}
              onClick={() => handlePageChange(item.key)}
              sx={{
                py: 1.5,
                px: 3,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  color: 'primary.main',
                  borderRight: '3px solid',
                  borderColor: 'primary.main',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={onLogout}
            sx={{
              py: 1.5,
              px: 3,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Bar */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 64,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            px: 2,
          }}
        >
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              mr: 2,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            🔗 Mapping Studio
          </Typography>
        </Box>

        {/* Mobile Drawer */}
        {renderMobileNavigation()}

        {/* Mobile Content Spacer */}
        <Box sx={{ height: 64 }} />
      </>
    )
  }

  return (
    <>
      {/* Desktop Sidebar */}
      {renderDesktopSidebar()}

      {/* Desktop Content Spacer */}
      <Box sx={{ width: sidebarWidth, flexShrink: 0 }} />
    </>
  )
}
