'use client'

// Keeps the current page visible in the sidebar. The sidebar list scrolls on
// its own (styles/theme.css), so when the page changes, scroll the active item
// into the list's view if it is outside it. Mounted once in pages/_layout.tsx.
import { useEffect } from 'react'

export function SidebarFollow() {
  useEffect(() => {
    let nav: HTMLElement | null = null
    const follow = () => {
      nav = document.querySelector<HTMLElement>('[data-v-sidebar-container] > nav[data-v-sidebar]')
      const item = nav?.querySelector<HTMLElement>('[data-v-sidebar-item][data-active]')
      if (!nav || !item) return
      const top = item.offsetTop
      const visible = top >= nav.scrollTop + 8 && top + item.offsetHeight <= nav.scrollTop + nav.clientHeight - 40
      if (!visible) nav.scrollTop = Math.max(0, top - nav.clientHeight / 3)
    }
    follow()
    // Vocs moves data-active on client-side navigation; follow it.
    const observer = new MutationObserver(follow)
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['data-active'] })
    return () => observer.disconnect()
  }, [])
  return null
}

export default SidebarFollow
