import { defineConfig } from 'vocs/config'

// The Acme Skills docs (Vocs 2.x).
//
// Pages live under ./pages (srcDir '.'; Vocs 2 defaults to "src"). Global styles are
// pages/_root.css: the chrome in styles/theme.css (a glass sidebar with the search at its top,
// pages/_slots.tsx), the page pieces in styles/site.css. No top bar on desktop; phones keep a
// slim floating one with the search and the menu. AUTHORING.md, "The look", says where to
// change the colours.
//
// One sidebar for the whole site, in the three parts the home page cards name: Getting
// started, Skills, Contribute. The URL map is in AUTHORING.md.
const sidebar = [
  {
    text: 'Getting started',
    items: [
      { text: 'Start here', link: '/install' },
      { text: 'Manual install', link: '/install/manual' },
      { text: 'Tips for using Claude', link: '/claude' },
    ],
  },
  {
    text: 'Skills',
    items: [
      { text: 'Skills overview', link: '/skills' },
      { text: 'Setup', link: '/skills/acme/setup' },
      { text: 'Meeting notes', link: '/skills/acme/meeting-notes' },
      { text: 'Voice check', link: '/skills/acme-marketing/voice-check' },
    ],
  },
  {
    text: 'Contribute',
    items: [
      { text: 'How contributing works', link: '/contribute' },
      { text: 'Get GitHub access', link: '/contribute/github-access' },
      { text: 'For maintainers', link: '/contribute/maintainers' },
    ],
  },
]

export default defineConfig({
  title: 'Acme Skills',
  titleTemplate: '%s · Acme Skills',
  description: 'Install and use the Acme Claude skills: what each skill does, and how to fix or propose a skill.',
  srcDir: '.',
  iconUrl: '/icon.svg',
  // Must be config, not CSS: Vocs injects it inline on <html> and derives its accent ramp from it.
  // The rest of the palette is in styles/theme.css.
  accentColor: 'light-dark(#4338CA, #A5B4FC)',
  head: {
    link: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
      },
    ],
  },
  sidebar,
  socials: [{ icon: 'github', link: 'https://github.com/acme-org/acme-skills' }],
  editLink: {
    link: 'https://github.com/acme-org/acme-skills/edit/main/docs/pages/:path',
    text: 'Suggest a change to this page',
  },
})
