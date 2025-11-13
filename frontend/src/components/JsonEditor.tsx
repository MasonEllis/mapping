import { Box, Typography } from '@mui/material'
import Editor from '@monaco-editor/react'
import { useTheme } from '@mui/material/styles'

export default function JsonEditor({ label, value, onChange, height = "400px" }: { label: string, value: string, onChange: (v: string) => void, height?: string }) {
  const theme = useTheme()

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        overflow: 'hidden',
        '& .monaco-editor': {
          paddingTop: theme.spacing(1),
        },
        '& .monaco-editor-background': {
          backgroundColor: theme.palette.background.paper + ' !important',
        }
      }}>
        <Editor
          height={height}
          language="json"
          value={value}
          onChange={(value) => onChange(value || '')}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </Box>
    </Box>
  )
}

// Utility function to convert flat paths to tree structure
export function buildPathTree(paths: string[]) {
  const tree: any = {}

  paths.forEach(path => {
    const parts = path.split(/\.|\[|\]/).filter(p => p !== '')
    let current = tree

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = { children: {}, isLeaf: false }
      }

      if (index === parts.length - 1) {
        current[part].isLeaf = true
      }

      current = current[part].children
    })
  })

  return tree
}

// Utility function to flatten tree back to paths for selection
export function getAllPathsFromTree(tree: any, prefix = ''): string[] {
  const paths: string[] = []

  Object.keys(tree).forEach(key => {
    const fullPath = prefix ? `${prefix}.${key}` : key
    const node = tree[key]

    if (node.isLeaf) {
      paths.push(fullPath)
    }

    if (Object.keys(node.children).length > 0) {
      paths.push(...getAllPathsFromTree(node.children, fullPath))
    }
  })

  return paths
}
