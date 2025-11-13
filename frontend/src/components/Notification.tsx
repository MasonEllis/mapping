import { Alert, Snackbar } from '@mui/material'

interface NotificationProps {
  open: boolean
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
}

export default function Notification({ open, message, severity, onClose }: NotificationProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          minWidth: '300px',
          fontWeight: 500,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}



