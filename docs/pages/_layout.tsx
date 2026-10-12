import type { ReactNode } from 'react'
import { ImageLightbox } from '#components/ImageLightbox'
import { SidebarFollow } from '#components/SidebarFollow'

// Waku outer layout for every page. It wraps (does not replace) Vocs' own layout, so it is the
// place for site-wide client behaviour: here, click any image in a page to see it full size,
// and keep the current page in view in the sidebar.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ImageLightbox />
      <SidebarFollow />
    </>
  )
}
