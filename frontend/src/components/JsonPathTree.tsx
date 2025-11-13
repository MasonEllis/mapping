import React, { useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Chip,
  IconButton
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RadioButtonChecked as RadioButtonCheckedIcon
} from '@mui/icons-material'
import { buildPathTree, getAllPathsFromTree } from './JsonEditor'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'

interface TreeNodeProps {
  name: string
  node: any
  path: string
  selectedPath: string | null
  onPathSelect: (path: string) => void
  level: number
  enableDrag?: boolean
  enableDrop?: boolean
  treeType?: 'source' | 'target'
}

function TreeNode({ name, node, path, selectedPath, onPathSelect, level, enableDrag, enableDrop, treeType }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2) // Auto-expand first two levels
  const hasChildren = Object.keys(node.children).length > 0
  const isSelected = selectedPath === path

  // DnD hooks only on leaves
  const draggable = enableDrag && node.isLeaf
  const droppable = enableDrop && node.isLeaf

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable(
    draggable ? { id: `${treeType}:${path}`, data: { treeType, path } } : { id: undefined as any }
  )
  const { setNodeRef: setDropRef, isOver } = useDroppable(
    droppable ? { id: `${treeType}:${path}`, data: { treeType, path } } : { id: undefined as any }
  )

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    }
    if (node.isLeaf) {
      onPathSelect(path)
    }
  }

  const refCallback = (el: HTMLElement | null) => {
    if (draggable) setDragRef(el)
    if (droppable) setDropRef(el)
  }

  return (
    <>
      <ListItem sx={{ pl: level * 2, py: 0.5 }}>
        <ListItemButton
          onClick={handleClick}
          ref={refCallback}
          {...(draggable ? { ...attributes, ...listeners } : {})}
          id={node.isLeaf && treeType ? `map-node-${treeType}-${encodeURIComponent(path)}` : undefined}
          sx={{
            py: 0.5,
            px: 1,
            borderRadius: 1,
            ...(isSelected && {
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.light',
              }
            }),
            ...(droppable && isOver && {
              outline: '2px dashed',
              outlineColor: 'primary.main',
              backgroundColor: 'action.hover',
            }),
            ...(draggable && isDragging && {
              opacity: 0.6,
            })
          }}
        >
          {hasChildren ? (
            <IconButton size="small" sx={{ mr: 1, p: 0.5 }}>
              {expanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          ) : (
            <>
              {draggable ? (
                <DragIndicatorIcon sx={{ mr: 1, fontSize: 16, color: 'text.disabled', cursor: 'grab' }} />
              ) : isSelected ? (
                <RadioButtonCheckedIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
              )}
            </>
          )}

          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: node.isLeaf ? 500 : 400,
                    color: isSelected ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  {name}
                </Typography>
                {node.isLeaf && (
                  <Chip
                    label="value"
                    size="small"
                    sx={{
                      ml: 1,
                      height: 16,
                      fontSize: '0.7rem',
                      bgcolor: isSelected ? 'primary.dark' : 'success.light',
                      color: isSelected ? 'primary.contrastText' : 'success.contrastText'
                    }}
                  />
                )}
              </Box>
            }
          />
        </ListItemButton>
      </ListItem>

      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {Object.keys(node.children).map(childName => (
              <TreeNode
                key={`${path}.${childName}`}
                name={childName}
                node={node.children[childName]}
                path={path ? `${path}.${childName}` : childName}
                selectedPath={selectedPath}
                onPathSelect={onPathSelect}
                level={level + 1}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

interface JsonPathTreeProps {
  paths: string[]
  selectedPath: string | null
  onPathSelect: (path: string) => void
  title: string
  enableDrag?: boolean
  enableDrop?: boolean
  treeType?: 'source' | 'target'
}

export default function JsonPathTree({ paths, selectedPath, onPathSelect, title, enableDrag, enableDrop, treeType }: JsonPathTreeProps) {
  const tree = buildPathTree(paths)

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
        {title}
      </Typography>
      <Box sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        maxHeight: 400,
        overflow: 'auto'
      }}>
        <List dense>
          {Object.keys(tree).length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No paths available. Parse JSON structures first.
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            Object.keys(tree).map(rootName => (
              <TreeNode
                key={rootName}
                name={rootName}
                node={tree[rootName]}
                path={rootName}
                selectedPath={selectedPath}
                onPathSelect={onPathSelect}
                level={0}
                enableDrag={enableDrag}
                enableDrop={enableDrop}
                treeType={treeType}
              />
            ))
          )}
        </List>
      </Box>
    </Box>
  )
}
