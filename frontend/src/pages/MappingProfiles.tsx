import { useEffect, useMemo, useRef, useState } from 'react'
import { AppBar, Box, Button, Card, CardContent, Chip, Divider, IconButton, List, ListItem, ListItemText, MenuItem, Paper, Stack, TextField, Toolbar, Typography, Container } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import BusinessIcon from '@mui/icons-material/Business'
import JsonPathTree from '../components/JsonPathTree'
import EntityManager, { EntityAutocomplete } from '../components/EntityManager'
import Notification from '../components/Notification'
import ConfirmationDialog from '../components/ConfirmationDialog'
import { api, entityApi, Entity } from '../api'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import MappingConnections from '../components/MappingConnections'

interface MappingPair {
  source_path: string
  target_path: string
  transform_expr?: string | null
  order_index?: number | null
}

interface Profile {
  id: number
  name: string
  description?: string | null
  source_entity: Entity
  target_entity: Entity
  pairs: (MappingPair & { id: number })[]
  source_json: string
  target_json: string
}

export default function MappingProfiles() {
  // Entity state
  const [sourceEntity, setSourceEntity] = useState<Entity | null>(null)
  const [targetEntity, setTargetEntity] = useState<Entity | null>(null)

  const [sourcePaths, setSourcePaths] = useState<string[]>([])
  const [targetPaths, setTargetPaths] = useState<string[]>([])
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [pairs, setPairs] = useState<MappingPair[]>([])

  const [name, setName] = useState('My Mapping')
  const [description, setDescription] = useState('')

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)

  // Entity state for autocomplete
  const [availableEntities, setAvailableEntities] = useState<Entity[]>([])
  const [loadingEntities, setLoadingEntities] = useState(false)

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

  async function parsePaths() {
    if (!sourceEntity || !targetEntity) {
      showNotification('Please select both source and target entities first', 'warning')
      return
    }

    try {
      const res = await api.post('/json/paths-by-entities', {
        source_entity_id: sourceEntity.id,
        target_entity_id: targetEntity.id
      })
      setSourcePaths(res.data.source_paths)
      setTargetPaths(res.data.target_paths)
    } catch (e: any) {
      console.error('parsePaths error:', e)
      const status = e?.response?.status
      if (status === 401) {
        showNotification('Authentication failed. Please log in again.', 'error')
        localStorage.removeItem('token')
        // Soft logout to avoid reload loops
        window.dispatchEvent(new Event('auth:logout'))
      } else {
        showNotification(e?.response?.data?.detail || 'Failed to parse JSON', 'error')
      }
    }
  }

  function addPair() {
    if (!selectedSource || !selectedTarget) return
    const exists = pairs.find(p => p.source_path === selectedSource && p.target_path === selectedTarget)
    if (exists) return
    setPairs([...pairs, { source_path: selectedSource, target_path: selectedTarget }])
    setSelectedSource(null)
    setSelectedTarget(null)
  }

  function removePair(index: number) {
    setPairs(pairs.filter((_, i) => i !== index))
  }

  async function saveProfile() {
    if (!sourceEntity || !targetEntity) {
      showNotification('Please select both source and target entities before saving', 'error')
      return
    }

    try {
      const payload = {
        name,
        description,
        source_entity_id: sourceEntity.id,
        target_entity_id: targetEntity.id,
        pairs
      }

      let res;
      if (selectedProfile) {
        // Update existing profile
        res = await api.put(`/mappings/${selectedProfile.id}`, payload)
        showNotification('Profile updated!', 'success')
      } else {
        // Create new profile
        res = await api.post('/mappings', payload)
        showNotification('New profile saved!', 'success')
      }

      await loadProfiles()
      // load saved profile pairs (with ids)
      const saved = res.data as Profile
      setPairs(saved.pairs)
      setSelectedProfile(saved) // Set as selected after save
    } catch (e: any) {
      showNotification(e?.response?.data?.detail || 'Save failed', 'error')
    }
  }

  async function loadProfiles() {
    setLoadingProfiles(true)
    try {
      const res = await api.get('/mappings')
      setProfiles(res.data)
    } catch (e: any) {
      // Don't show error for authentication failures
      if (e?.response?.status === 401) {
        // Token is invalid, soft logout to login
        localStorage.removeItem('token')
        window.dispatchEvent(new Event('auth:logout'))
      } else {
        showNotification('Failed to load profiles', 'error')
      }
    } finally {
      setLoadingProfiles(false)
    }
  }

  async function loadEntities() {
    setLoadingEntities(true)
    try {
      const res = await entityApi.list()
      setAvailableEntities(res.data)
    } catch (e) {
      // ignore
    } finally {
      setLoadingEntities(false)
    }
  }

  async function loadProfile(p: Profile) {
    setSelectedProfile(p)
    setName(p.name)
    setDescription(p.description || '')
    setSourceEntity(p.source_entity)
    setTargetEntity(p.target_entity)
    setPairs(p.pairs)
    await parsePaths()
  }

  function newProfile() {
    setSelectedProfile(null)
    setName('My Mapping')
    setDescription('')
    setSourceEntity(null)
    setTargetEntity(null)
    setPairs([])
    setSelectedSource(null)
    setSelectedTarget(null)
    setSourcePaths([])
    setTargetPaths([])
  }

  // Clear paths when entities change
  useEffect(() => {
    if (sourceEntity || targetEntity) {
      setSelectedSource(null)
      setSelectedTarget(null)
      setPairs([])
    }
  }, [sourceEntity, targetEntity])

  async function deleteProfile(p: Profile) {
    showConfirmation(
      'Delete Profile',
      `Are you sure you want to delete the profile "${p.name}"? This action cannot be undone.`,
      async () => {
        try {
          await api.delete(`/mappings/${p.id}`)
          await loadProfiles()
          showNotification('Profile deleted successfully', 'success')
        } catch (e: any) {
          showNotification(e?.response?.data?.detail || 'Delete failed', 'error')
        }
      }
    )
  }

  useEffect(() => {
    // Only load profiles if user is authenticated
    if (localStorage.getItem('token')) {
      loadProfiles()
      loadEntities()
    }
  }, [])

  // Automatically parse paths when both entities are selected
  useEffect(() => {
    if (sourceEntity && targetEntity && sourcePaths.length === 0 && targetPaths.length === 0) {
      parsePaths()
    }
  }, [sourceEntity, targetEntity])

  const filteredSource = useMemo(() => sourcePaths, [sourcePaths])
  const filteredTarget = useMemo(() => targetPaths, [targetPaths])
  const containerRef = useRef<HTMLDivElement | null>(null)

  function addPairFromPaths(sourcePath: string, targetPath: string) {
    const exists = pairs.find(p => p.source_path === sourcePath && p.target_path === targetPath)
    if (exists) return
    setPairs(prev => [...prev, { source_path: sourcePath, target_path: targetPath }])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over) return
    const a = active.data.current as any
    const b = over.data.current as any
    if (!a || !b) return

    if (a.treeType === 'source' && b.treeType === 'target') {
      addPairFromPaths(a.path, b.path)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  return (
    <>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          🔗 Mapping Profiles
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            color: 'text.secondary',
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Create mapping profiles by selecting source and target entities, then defining field mappings between them.
        </Typography>

        {/* Entity Selection */}
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🎯 Select Entities
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <EntityAutocomplete
              entities={availableEntities}
              selectedEntity={sourceEntity}
              onEntitySelect={setSourceEntity}
              label="Source Entity"
              placeholder="Select source entity..."
              loading={loadingEntities}
            />
            <EntityAutocomplete
              entities={availableEntities}
              selectedEntity={targetEntity}
              onEntitySelect={setTargetEntity}
              label="Target Entity"
              placeholder="Select target entity..."
              loading={loadingEntities}
            />
          </Stack>
        </Paper>

        {/* JSON Preview (for selected entities) */}
        {(sourceEntity || targetEntity) && (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 4 }}>
            {sourceEntity && (
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  📊 Source JSON ({sourceEntity.name})
                </Typography>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <pre style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {sourceEntity.json_data}
                  </pre>
                </Paper>
              </Box>
            )}

            {targetEntity && (
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  🎯 Target JSON ({targetEntity.name})
                </Typography>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <pre style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}>
                    {targetEntity.json_data}
                  </pre>
                </Paper>
              </Box>
            )}
          </Stack>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveProfile}
            size="large"
            disabled={!sourceEntity || !targetEntity}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(45deg, #4caf50 30%, #388e3c 90%)',
              boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #388e3c 30%, #2e7d32 90%)',
                boxShadow: '0 6px 10px 2px rgba(76, 175, 80, .3)',
              },
            }}
          >
            {selectedProfile ? '💾 Update Profile' : '💾 Save Profile'}
          </Button>
        </Box>

        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
          <Box sx={{ position: 'relative', mb: 4 }} ref={containerRef}>
          <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              flex: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: 'success.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🎯 Source Paths
            </Typography>
            <JsonPathTree
              paths={filteredSource}
              selectedPath={selectedSource}
              onPathSelect={setSelectedSource}
              title="Select source path"
              enableDrag
              treeType="source"
            />
            {selectedSource && (
              <Chip
                label={selectedSource}
                sx={{
                  mt: 2,
                  bgcolor: 'success.light',
                  color: 'success.contrastText'
                }}
              />
            )}
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 3,
              flex: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: 'info.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🎯 Target Paths
            </Typography>
            <JsonPathTree
              paths={filteredTarget}
              selectedPath={selectedTarget}
              onPathSelect={setSelectedTarget}
              title="Select target path"
              enableDrop
              treeType="target"
            />
            {selectedTarget && (
              <Chip
                label={selectedTarget}
                sx={{
                  mt: 2,
                  bgcolor: 'info.light',
                  color: 'info.contrastText'
                }}
              />
            )}
          </Paper>

          <Paper
            elevation={2}
            sx={{
              p: 3,
              width: { xs: '100%', xl: 450 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              🔗 Field Mappings
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 3 }}>
              <Button
                variant="contained"
                onClick={addPair}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                ➕ Add Mapping
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderOpenIcon />}
                onClick={loadProfiles}
                disabled={loadingProfiles}
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Refresh Profiles
              </Button>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Current Mappings ({pairs.length})
            </Typography>

            {pairs.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No mappings yet. Select source and target paths above, then click "Add Mapping".
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                {pairs.map((p, idx) => (
                  <ListItem
                    key={`${p.source_path}->${p.target_path}-${idx}`}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => removePair(idx)}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'error.contrastText',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {p.source_path} <span style={{ color: '#666' }}>→</span> {p.target_path}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          </Stack>
          <MappingConnections pairs={pairs} containerRef={containerRef} />
          </Box>
        </DndContext>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📝 Profile Details
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={newProfile}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              🆕 New Profile
            </Button>
          </Box>

          {selectedProfile && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.contrastText' }}>
                Currently Editing: {selectedProfile.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'primary.contrastText', opacity: 0.9 }}>
                {selectedProfile.description || 'No description'}
              </Typography>
            </Box>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Profile Name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            <TextField
              label="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Stack>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            📁 Saved Profiles
          </Typography>

          {profiles.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No saved profiles yet. Create a mapping and save it to see profiles here.
            </Typography>
          ) : (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} useFlexGap flexWrap="wrap">
              {profiles.map(p => (
                <Card
                  key={p.id}
                  elevation={selectedProfile?.id === p.id ? 4 : 1}
                  sx={{
                    minWidth: 280,
                    maxWidth: 320,
                    borderRadius: 2,
                    border: '2px solid',
                    borderColor: selectedProfile?.id === p.id ? 'primary.main' : 'divider',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {p.name}
                      {selectedProfile?.id === p.id && (
                        <Chip
                          label="Active"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.7rem',
                            bgcolor: 'primary.dark',
                            color: 'primary.contrastText'
                          }}
                        />
                      )}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        minHeight: '2.5em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {p.description || 'No description provided'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      Source: {p.source_entity.name} → Target: {p.target_entity.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      {p.pairs.length} mapping{p.pairs.length !== 1 ? 's' : ''}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => loadProfile(p)}
                        fullWidth
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Load
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => deleteProfile(p)}
                        sx={{
                          borderRadius: 1,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>

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
