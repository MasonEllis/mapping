import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Chip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import JsonEditor from './JsonEditor'
import Notification from './Notification'
import ConfirmationDialog from './ConfirmationDialog'
import { entityApi, Entity, EntityCreate, EntityUpdate } from '../api'

interface EntityManagerProps {
  onEntitySelect?: (entity: Entity) => void
  selectedEntityId?: number | null
  showCreateButton?: boolean
}

interface EntityAutocompleteProps {
  entities: Entity[]
  selectedEntity: Entity | null
  onEntitySelect: (entity: Entity | null) => void
  label: string
  placeholder?: string
  loading?: boolean
}

export default function EntityManager({
  onEntitySelect,
  selectedEntityId,
  showCreateButton = true
}: EntityManagerProps) {
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [jsonData, setJsonData] = useState('{\n  \n}')

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({ open: false, message: '', severity: 'info' })

  // Confirmation dialog state
  const [confirmation, setConfirmation] = useState<{
    open: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ open: false, title: '', message: '', onConfirm: () => {} })

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity })
  }

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmation({ open: true, title, message, onConfirm })
  }

  const closeConfirmation = () => {
    setConfirmation({ open: false, title: '', message: '', onConfirm: () => {} })
  }

  const loadEntities = async () => {
    setLoading(true)
    try {
      const res = await entityApi.list()
      setEntities(res.data)
    } catch (e: any) {
      // Don't show error for authentication failures
      if (e?.response?.status === 401) {
        // Token is invalid, soft logout to login
        localStorage.removeItem('token')
        window.dispatchEvent(new Event('auth:logout'))
      } else {
        showNotification(e?.response?.data?.detail || 'Failed to load entities', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJsonChange = (value: string) => {
    setJsonData(value)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setJsonData('{\n  \n}')
  }

  const openCreateDialog = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  const openEditDialog = (entity: Entity) => {
    setEditingEntity(entity)
    setName(entity.name)
    setDescription(entity.description || '')
    setJsonData(entity.json_data)
    setEditDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      showNotification('Name is required', 'error')
      return
    }

    try {
      const data: EntityCreate = {
        name: name.trim(),
        description: description.trim() || null,
        json_data: jsonData
      }

      await entityApi.create(data)
      showNotification('Entity created successfully', 'success')
      setCreateDialogOpen(false)
      await loadEntities()
      resetForm()
    } catch (e: any) {
      showNotification(e?.response?.data?.detail || 'Failed to create entity', 'error')
    }
  }

  const handleUpdate = async () => {
    if (!editingEntity) return

    if (!name.trim()) {
      showNotification('Name is required', 'error')
      return
    }

    try {
      const data: EntityUpdate = {
        name: name.trim(),
        description: description.trim() || null,
        json_data: jsonData
      }

      await entityApi.update(editingEntity.id, data)
      showNotification('Entity updated successfully', 'success')
      setEditDialogOpen(false)
      setEditingEntity(null)
      await loadEntities()
    } catch (e: any) {
      showNotification(e?.response?.data?.detail || 'Failed to update entity', 'error')
    }
  }

  const handleDelete = async (entity: Entity) => {
    showConfirmation(
      'Delete Entity',
      `Are you sure you want to delete the entity "${entity.name}"? This action cannot be undone.`,
      async () => {
        try {
          await entityApi.delete(entity.id)
          await loadEntities()
          showNotification('Entity deleted successfully', 'success')
        } catch (e: any) {
          showNotification(e?.response?.data?.detail || 'Failed to delete entity', 'error')
        }
      }
    )
  }

  useEffect(() => {
    // Only load entities if user is authenticated
    if (localStorage.getItem('token')) {
      loadEntities()
    }
  }, [])

  const filteredEntities = entities

  return (
    <>
      <Box>
        {showCreateButton && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Create New Entity
            </Button>
          </Box>
        )}

        {loading ? (
          <Typography>Loading entities...</Typography>
        ) : filteredEntities.length === 0 ? (
          <Paper
            elevation={1}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No entities yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create an entity to get started with mapping.
            </Typography>
          </Paper>
        ) : (
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
            {filteredEntities.map(entity => (
              <Card
                key={entity.id}
                elevation={selectedEntityId === entity.id ? 4 : 1}
                sx={{
                  minWidth: 280,
                  maxWidth: 320,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: selectedEntityId === entity.id ? 'primary.main' : 'divider',
                  transition: 'all 0.2s ease-in-out',
                  cursor: onEntitySelect ? 'pointer' : 'default',
                  '&:hover': {
                    elevation: 4,
                    transform: onEntitySelect ? 'translateY(-2px)' : 'none',
                  }
                }}
                onClick={() => onEntitySelect?.(entity)}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        mr: 1
                      }}
                    >
                      {entity.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          openEditDialog(entity)
                        }}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(entity)
                        }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>


                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      minHeight: '2.5em',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {entity.description || 'No description provided'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Create Entity Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Entity</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Entity Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />


            <Box>
              <JsonEditor
                label=""
                value={jsonData}
                onChange={handleJsonChange}
                height="300px"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!name.trim()}
          >
            Create Entity
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Entity Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Entity</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Entity Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />

            <Box>
              <JsonEditor
                label=""
                value={jsonData}
                onChange={handleJsonChange}
                height="300px"
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={!name.trim()}
          >
            Update Entity
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />

      <ConfirmationDialog
        open={confirmation.open}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onCancel={closeConfirmation}
      />
    </>
  )
}

export function EntityAutocomplete({
  entities,
  selectedEntity,
  onEntitySelect,
  label,
  placeholder = "Select an entity...",
  loading = false
}: EntityAutocompleteProps) {
  return (
    <Autocomplete
      options={entities}
      getOptionLabel={(option) => option.name}
      value={selectedEntity}
      onChange={(_, newValue) => onEntitySelect(newValue)}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...otherProps } = props
        return (
          <li key={key} {...otherProps}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {option.name}
              </Typography>
              {option.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {option.description}
                </Typography>
              )}
            </Box>
          </li>
        )
      }}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.name}
            size="small"
          />
        ))
      }
      sx={{
        minWidth: 280,
        '& .MuiAutocomplete-popupIndicator': {
          color: 'primary.main'
        }
      }}
    />
  )
}