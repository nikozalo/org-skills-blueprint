'use client'

// Click any image in a page's content to see it full size. Mounted once for the
// whole site in pages/_layout.tsx, so plain Markdown images (![alt](/path.png))
// get it without any extra markup. Images inside a link keep the link, and an
// image with the class "site-no-zoom" is left alone. Escape or a click closes it.
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Shown = { src: string; alt: string }

export function ImageLightbox() {
  const [shown, setShown] = useState<Shown | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!(target instanceof HTMLImageElement)) return
      if (!target.closest('[data-v-content]')) return
      if (target.closest('a') || target.classList.contains('site-no-zoom')) return
      e.preventDefault()
      setShown({ src: target.currentSrc || target.src, alt: target.alt })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!shown) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShown(null)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [shown])

  if (!shown || typeof document === 'undefined') return null
  return createPortal(
    <div className="site-lightbox" role="dialog" aria-modal="true" aria-label={shown.alt || 'Image'} onClick={() => setShown(null)}>
      <div className="site-lightbox__inner">
        <img src={shown.src} alt={shown.alt} />
      </div>
      {shown.alt ? <p className="site-lightbox__caption">{shown.alt}</p> : null}
    </div>,
    document.body,
  )
}

export default ImageLightbox
