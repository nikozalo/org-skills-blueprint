// Inline SVG diagrams for the guides. Colours come from CSS (styles/site.css, the .fig-*
// classes), so each drawing follows light and dark mode. Wrap one in <Figure caption="...">
// to get the frame and click-to-enlarge.

type Step = { title: string; sub: string; accent?: boolean }

function Defs() {
  return (
    <defs>
      <marker id="fig-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 10 5 0 10z" className="fig-arrowhead" />
      </marker>
    </defs>
  )
}

/** A row of steps joined by arrows. Each box is as wide as its longest line, estimated from
 * the .fig-title (16px bold) and .fig-sub (12.5px) sizes, so a longer label widens its box
 * instead of running over the edge. */
function Chain({ steps, label }: { steps: Step[]; label: string }) {
  const gap = 28
  const widths = steps.map((s) => Math.max(140, Math.ceil(Math.max(s.title.length * 9, s.sub.length * 6.2)) + 32))
  const xs = widths.map((_, i) => 20 + widths.slice(0, i).reduce((sum, w) => sum + w + gap, 0))
  const total = xs[xs.length - 1] + widths[widths.length - 1] + 20
  return (
    <svg viewBox={`0 0 ${total} 130`} role="img" aria-label={label}>
      <Defs />
      {steps.map((s, i) => {
        const x = xs[i]
        const w = widths[i]
        return (
          <g key={s.title}>
            <rect x={x} y={30} width={w} height={70} rx={14} className={`fig-box${s.accent ? ' fig-box--accent' : ''}`} />
            <text x={x + w / 2} y={59} textAnchor="middle" className="fig-title">
              {s.title}
            </text>
            <text x={x + w / 2} y={81} textAnchor="middle" className="fig-sub">
              {s.sub}
            </text>
            {i < steps.length - 1 ? (
              <line x1={x + w} y1={65} x2={x + w + gap - 2} y2={65} className="fig-line" markerEnd="url(#fig-arrow)" />
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

/** Notice, contribute, review, everyone gets it. */
export function ContributeLoop() {
  return (
    <Chain
      label="The contribution loop"
      steps={[
        { title: 'Notice', sub: 'a miss, or a prompt you reuse' },
        { title: '/acme:contribute', sub: 'Claude drafts it', accent: true },
        { title: 'You read it', sub: 'nothing sent before' },
        { title: 'Owner reviews', sub: 'pull request or folder' },
        { title: 'Everyone gets it', sub: 'on the next update', accent: true },
      ]}
    />
  )
}
