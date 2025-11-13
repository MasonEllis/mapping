import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

interface MappingPairLike {
  source_path: string
  target_path: string
}

interface MappingConnectionsProps {
  pairs: MappingPairLike[]
  containerRef: React.RefObject<HTMLElement>
}

interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
}

export default function MappingConnections({ pairs, containerRef }: MappingConnectionsProps) {
  const [lines, setLines] = useState<Line[]>([])

  const compute = () => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()

    const newLines: Line[] = []
    for (const p of pairs) {
      const srcId = `map-node-source-${encodeURIComponent(p.source_path)}`
      const tgtId = `map-node-target-${encodeURIComponent(p.target_path)}`
      const srcEl = document.getElementById(srcId)
      const tgtEl = document.getElementById(tgtId)
      if (!srcEl || !tgtEl) continue
      const srcRect = srcEl.getBoundingClientRect()
      const tgtRect = tgtEl.getBoundingClientRect()

      const x1 = srcRect.right - containerRect.left
      const y1 = srcRect.top + srcRect.height / 2 - containerRect.top
      const x2 = tgtRect.left - containerRect.left
      const y2 = tgtRect.top + tgtRect.height / 2 - containerRect.top

      newLines.push({ x1, y1, x2, y2 })
    }
    setLines(newLines)
  }

  useLayoutEffect(() => {
    compute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs])

  useEffect(() => {
    const handler = () => requestAnimationFrame(compute)
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    const container = containerRef.current
    const mo = new MutationObserver(handler)
    if (container) {
      mo.observe(container, { subtree: true, childList: true, attributes: true })
    }
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
      mo.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!containerRef.current) return null

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      {lines.map((l, idx) => {
        // Draw a smooth cubic curve between points
        const dx = Math.max(40, Math.abs(l.x2 - l.x1) / 2)
        const path = `M ${l.x1} ${l.y1} C ${l.x1 + dx} ${l.y1}, ${l.x2 - dx} ${l.y2}, ${l.x2} ${l.y2}`
        return (
          <g key={idx}>
            <path d={path} stroke="#667eea" strokeWidth={2} fill="none" opacity={0.9} />
            <path d={path} stroke="#667eea" strokeWidth={6} fill="none" opacity={0.08} />
          </g>
        )
      })}
    </svg>
  )
}
