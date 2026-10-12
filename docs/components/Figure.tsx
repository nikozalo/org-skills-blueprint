'use client'

// A framed figure for inline SVG diagrams. The canvas is a button: click it (or
// press Enter or Space) to open the same drawing in a full-window lightbox;
// click anywhere or press Escape to close.
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <figure className="site-figure">
      <button
        type="button"
        className="site-figure__canvas"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Enlarge figure: ${caption}`}
        title="Click to enlarge"
      >
        {children}
      </button>
      <figcaption className="site-figure__caption">{caption}</figcaption>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <div className="site-lightbox" role="dialog" aria-modal="true" aria-label={caption} onClick={() => setOpen(false)}>
              <div className="site-lightbox__inner">{children}</div>
              <p className="site-lightbox__caption">{caption}</p>
            </div>,
            document.body,
          )
        : null}
    </figure>
  )
}

export default Figure
