import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { Pos } from '../data/court'

interface Options {
  draggable: boolean
  onDrag?: (id: string, pos: Pos) => void
  onSelect?: (id: string | null) => void
  selectedId?: string | null
  /** Converts a pointer event to court coordinates, or null if off the floor. */
  toCourt: (e: PointerEvent<SVGGElement>) => Pos | null
}

/** Hover, focus, tap-to-pin and drag handling shared by both court views. */
export function usePlayerInteraction({ draggable, onDrag, onSelect, selectedId, toCourt }: Options) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const movedRef = useRef(false)

  function handlersFor(id: string) {
    const endDrag = (e: PointerEvent<SVGGElement>) => {
      if (dragId === null) return
      e.currentTarget.releasePointerCapture(e.pointerId)
      setDragId(null)
    }
    return {
      onPointerEnter: () => setHoverId(id),
      onPointerLeave: () => setHoverId((h) => (h === id ? null : h)),
      onPointerDown: (e: PointerEvent<SVGGElement>) => {
        if (!draggable) return
        e.currentTarget.setPointerCapture(e.pointerId)
        movedRef.current = false
        setDragId(id)
      },
      onPointerMove: (e: PointerEvent<SVGGElement>) => {
        if (dragId !== id) return
        const pos = toCourt(e)
        if (pos) {
          movedRef.current = true
          onDrag?.(id, pos)
        }
      },
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClick: () => {
        if (movedRef.current) {
          movedRef.current = false
          return
        }
        onSelect?.(selectedId === id ? null : id)
      },
      onFocus: () => setHoverId(id),
      onBlur: () => setHoverId((h) => (h === id ? null : h)),
      onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
        if (e.key === 'Escape') onSelect?.(null)
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(selectedId === id ? null : id)
        }
      },
    }
  }

  return { hoverId, dragId, handlersFor }
}
