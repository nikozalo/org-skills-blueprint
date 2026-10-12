// The home page hero: a gradient band with rings of nodes turning slowly behind the text, for
// skills going round the organization. Each ring turns at its own pace (styles/site.css), and
// stays still for readers who ask for reduced motion. Server component: no state, so no client
// JavaScript.

type Node = { deg: number; r: number; warm?: boolean }

// Each orbit: its radius, and the nodes on it (angle in degrees, node radius).
const ORBITS: { radius: number; nodes: Node[] }[] = [
  { radius: 150, nodes: [{ deg: 20, r: 16 }, { deg: 200, r: 10 }] },
  { radius: 245, nodes: [{ deg: 70, r: 22 }, { deg: 190, r: 14, warm: true }, { deg: 310, r: 18 }] },
  { radius: 345, nodes: [{ deg: 0, r: 26 }, { deg: 95, r: 14 }, { deg: 160, r: 18, warm: true }, { deg: 250, r: 12 }] },
  { radius: 445, nodes: [{ deg: 40, r: 18 }, { deg: 140, r: 30 }, { deg: 220, r: 12 }, { deg: 300, r: 20, warm: true }] },
]

function at(radius: number, deg: number) {
  const t = (deg * Math.PI) / 180
  return { cx: Number((radius * Math.cos(t)).toFixed(1)), cy: Number((-radius * Math.sin(t)).toFixed(1)) }
}

/** The mark: a ring with three nodes on it, one warm. Also public/icon.svg, on a tile. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="5" opacity="0.55" />
      <circle cx="32" cy="14" r="7" fill="currentColor" />
      <circle cx="47.6" cy="41" r="7" fill="currentColor" />
      <circle cx="16.4" cy="41" r="7" fill="#FFB89A" />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg className="site-choice__icon" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h12m0 0-5-5m5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Hero() {
  return (
    <header className="site-hero">
      <div className="site-hero__art" aria-hidden="true">
        <div className="site-hero__glow" />
        <svg className="site-hero__rings" viewBox="-500 -500 1000 1000" fill="none" stroke="currentColor">
          <circle r="150" strokeWidth="6" strokeDasharray="1 18" strokeLinecap="round" />
          <circle r="245" strokeWidth="3" />
          <circle r="345" strokeWidth="6" strokeDasharray="1 18" strokeLinecap="round" />
          <circle r="445" strokeWidth="3" />
          <circle r="70" fill="currentColor" stroke="none" opacity="0.5" />
          <circle r="34" fill="currentColor" stroke="none" />
        </svg>
        {ORBITS.map((orbit, i) => (
          <svg key={orbit.radius} className={`site-hero__orbit site-hero__orbit--${i + 1}`} viewBox="-500 -500 1000 1000">
            {orbit.nodes.map((n) => (
              <circle key={n.deg} {...at(orbit.radius, n.deg)} r={n.r} className={n.warm ? 'node node--warm' : 'node'} fill="currentColor" />
            ))}
          </svg>
        ))}
      </div>
      <div className="site-hero__inner">
        <div className="site-hero__brand">
          <span className="site-hero__name">
            <Mark className="site-hero__mark" />
            Acme
          </span>
          <span className="site-hero__team">AI team</span>
        </div>
        <h1 className="site-hero__title">Acme Skills</h1>
        <p className="site-hero__lede">
          Shared instructions that make Claude do Acme's work the same way for everyone. When a skill
          changes, everyone gets the update.
        </p>
        <nav className="site-hero__choose" aria-label="Start here">
          <a className="site-choice" href="/install">
            <span className="site-choice__name">Get started</span>
            <span className="site-choice__text">What Acme Skills are, how to get them in Cowork or Claude Code, and how to set up.</span>
            <Arrow />
          </a>
          <a className="site-choice" href="/skills">
            <span className="site-choice__name">Browse the skills</span>
            <span className="site-choice__text">Every skill and plugin: what it is for, how to run it, and what it never does.</span>
            <Arrow />
          </a>
        </nav>
        <p className="site-hero__also">
          Found something a skill gets wrong, or have one to share? <a href="/contribute">How to contribute</a>
        </p>
      </div>
    </header>
  )
}

export default Hero
