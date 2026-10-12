'use client'

// Vocs layout slots (virtual:vocs/slots reads this file).
//
// SidebarHeader: the search, at the top of the sidebar, under the logo. There
// is no top bar on desktop (styles/theme.css hides it), so this is where the
// search lives. Vocs does not export its Search component, so it is imported
// from the package's files; check the path when upgrading Vocs. The keyboard
// shortcut stays with the (hidden) top-bar instance, so Cmd+K still works and
// is not registered twice.
import { Search } from '../node_modules/vocs/dist/react/internal/Search.js'

export function SidebarHeader() {
  return (
    <div className="site-sidebar-search">
      <Search disableKeyboardShortcut />
    </div>
  )
}
