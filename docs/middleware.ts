// A shared-password gate for the docs, for hosting on Vercel without a paid plan's password
// protection. Vercel runs a root `middleware.ts` for any framework: set the Vercel project's
// Root Directory to `docs`, so this folder is the project root.
//
// Setup: add these Environment Variables in the Vercel project settings.
//   DOCS_PASSWORD  (required) the shared password. On Vercel without it, the site answers 503
//                  and serves nothing, so a missing variable never opens the site to everyone.
//                  Elsewhere (`bun run dev`, `bun run preview`, CI) the gate is off.
//   DOCS_SECRET    (optional) HMAC secret for the sign-in cookie. Defaults to DOCS_PASSWORD.
//                  Changing either signs everyone out.
//
// The password never goes in this repository. Once it is right, a signed cookie keeps the
// reader in for seven days; /__logout clears it. For public docs, delete this file.

export const config = {
  // Everything except Vercel's own internal routes.
  matcher: '/((?!_vercel).*)',
}

const COOKIE = 'docs_auth'
const MAX_AGE_SEC = 60 * 60 * 24 * 7 // 7 days
const ORG = 'Acme'
const TEAM = 'AI team'
const SITE = 'Acme Skills'
const HELP = 'No password? Ask in <strong>#acme-ai</strong> on Slack.'

// Served without the password: the sign-in page uses it. Nothing with content in it.
const PUBLIC = new Set(['/icon.svg'])

// ── crypto helpers (Web Crypto is global in the Vercel Edge runtime) ──────

async function hmacHex(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Compares without leaking how much of it matched.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

async function issueToken(secret: string): Promise<string> {
  const exp = String(Date.now() + MAX_AGE_SEC * 1000)
  return `${exp}.${await hmacHex(secret, exp)}`
}

async function verifyToken(secret: string, token: string | undefined): Promise<boolean> {
  if (!token) return false
  const dot = token.indexOf('.')
  if (dot < 0) return false
  const exp = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false
  return safeEqual(sig, await hmacHex(secret, exp))
}

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie')
  if (!header) return undefined
  for (const part of header.split(';')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim()
  }
  return undefined
}

// ── login page ────────────────────────────────────────────────────────────
// The home page hero (components/Hero.tsx and the .site-hero rules in styles/site.css) as a
// full-screen band, with the password form on a white tile. The art is redrawn here from the
// same orbits: change one, change the other.

const ORBITS: { radius: number; nodes: [deg: number, r: number, warm?: boolean][] }[] = [
  { radius: 150, nodes: [[20, 16], [200, 10]] },
  { radius: 245, nodes: [[70, 22], [190, 14, true], [310, 18]] },
  { radius: 345, nodes: [[0, 26], [95, 14], [160, 18, true], [250, 12]] },
  { radius: 445, nodes: [[40, 18], [140, 30], [220, 12], [300, 20, true]] },
]

function orbitSvgs(): string {
  return ORBITS.map(({ radius, nodes }, i) => {
    const circles = nodes
      .map(([deg, r, warm]) => {
        const t = (deg * Math.PI) / 180
        const cx = (radius * Math.cos(t)).toFixed(1)
        const cy = (-radius * Math.sin(t)).toFixed(1)
        return `<circle cx="${cx}" cy="${cy}" r="${r}" class="${warm ? 'node warm' : 'node'}"/>`
      })
      .join('')
    return `<svg class="orbit orbit-${i + 1}" viewBox="-500 -500 1000 1000" fill="currentColor">${circles}</svg>`
  }).join('')
}

const MARK = `<svg class="mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" stroke-width="5" opacity="0.55"/><circle cx="32" cy="14" r="7" fill="currentColor"/><circle cx="47.6" cy="41" r="7" fill="currentColor"/><circle cx="16.4" cy="41" r="7" fill="#FFB89A"/><circle cx="32" cy="32" r="5" fill="currentColor"/></svg>`

function loginPage(showError: boolean): Response {
  const error = showError ? '<p class="err" id="err" role="alert">That password is not right. Check it and try again.</p>' : ''
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>${SITE}</title>
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" />
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  html, body { min-height: 100%; margin: 0; }
  body {
    position: relative; isolation: isolate;
    min-height: 100vh; min-height: 100dvh;
    display: flex; align-items: center;
    padding: clamp(2.5rem, 7vw, 5rem) 0;
    color: #fff;
    background: linear-gradient(160deg, #312C8E 0%, #4338CA 46%, #7C5CE0 100%);
    font: 16px/1.55 "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  @media (prefers-color-scheme: dark) {
    body { background: linear-gradient(160deg, #1A1747 0%, #2A2482 50%, #4B3A9E 100%); }
  }
  body::before {
    content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: linear-gradient(90deg, rgba(18, 14, 60, 0.5) 0%, rgba(18, 14, 60, 0.22) 42%, rgba(18, 14, 60, 0) 70%);
  }
  /* The clip box keeps the art from widening the page on phones. */
  .band { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
  .art {
    position: absolute; top: 50%; right: -9rem;
    width: min(60rem, 112vh); aspect-ratio: 1;
    transform: translateY(-50%); pointer-events: none;
  }
  .art > * { position: absolute; inset: 0; width: 100%; height: 100%; }
  .glow {
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230, 229, 255, 0.24) 0%, rgba(230, 229, 255, 0.12) 22%, rgba(230, 229, 255, 0.05) 42%, rgba(230, 229, 255, 0) 62%);
  }
  .rings { color: #fff; opacity: 0.2; }
  .orbit { color: #fff; }
  .node { opacity: 0.32; }
  .node.warm { color: #FFB89A; opacity: 0.75; }
  @media (prefers-reduced-motion: no-preference) {
    .orbit-1 { animation: spin 70s linear infinite; }
    .orbit-2 { animation: spin 110s linear infinite reverse; }
    .orbit-3 { animation: spin 160s linear infinite; }
    .orbit-4 { animation: spin 240s linear infinite reverse; }
    .glow { animation: breathe 10s ease-in-out infinite alternate; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes breathe {
    from { opacity: 0.7; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1.05); }
  }

  main {
    position: relative; z-index: 2; width: 100%; max-width: 68rem;
    margin: 0 auto; padding-inline: clamp(16px, 4vw, 40px);
  }
  .brand { display: flex; align-items: center; gap: 1.1rem; }
  .name {
    display: inline-flex; align-items: center; gap: 0.7rem;
    font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1;
  }
  .mark {
    width: 2.6rem; height: 2.6rem; padding: 0.3rem; border-radius: 11px;
    background: #fff; color: #4338CA; box-shadow: 0 6px 16px -6px rgba(18, 14, 60, 0.55);
  }
  .team {
    padding: 0.45rem 0 0.45rem 1.1rem;
    border-left: 1px solid rgba(255, 255, 255, 0.45);
    font-size: 1.08rem; font-weight: 600; line-height: 1.2;
  }
  h1 {
    margin: clamp(2.5rem, 8vw, 5rem) 0 1.1rem; max-width: 11ch;
    font-size: clamp(2.75rem, 8vw, 4.75rem); font-weight: 800;
    line-height: 1; letter-spacing: -0.04em; text-wrap: balance;
  }
  .lede {
    max-width: 34rem; margin: 0; color: #E6E5FF;
    font-size: clamp(1.1rem, 2vw, 1.28rem); text-wrap: pretty;
  }

  form {
    max-width: 26rem; margin-top: clamp(2rem, 5vw, 3rem);
    padding: 1.3rem 1.3rem 1.4rem; border-radius: 16px;
    background: light-dark(#FFFFFF, #17163A); color: light-dark(#17163A, #EEEDFF);
    box-shadow: 0 20px 38px -16px rgba(18, 14, 60, 0.65), 0 3px 8px rgba(18, 14, 60, 0.16);
  }
  label { display: block; margin: 0 0 0.45rem; font-size: 0.95rem; font-weight: 700; }
  input {
    display: block; width: 100%; padding: 0.7rem 0.85rem;
    font: inherit; font-size: 1rem; color: inherit;
    background: light-dark(#F7F7FC, #0C0B1D);
    border: 1px solid light-dark(#C9CBF2, #34316B); border-radius: 10px; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus {
    border-color: light-dark(#4338CA, #A5B4FC);
    box-shadow: 0 0 0 3px light-dark(rgba(67, 56, 202, 0.2), rgba(165, 180, 252, 0.25));
  }
  input[aria-invalid="true"] { border-color: light-dark(#B42318, #FF8A80); }
  button {
    width: 100%; margin-top: 0.85rem; padding: 0.72rem 1rem;
    font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
    color: light-dark(#FFFFFF, #17163A); background: light-dark(#4338CA, #A5B4FC);
    border: 0; border-radius: 10px;
    transition: background-color 0.15s, transform 0.05s;
  }
  button:hover { background: light-dark(#372DB0, #BFCAFD); }
  button:active { transform: translateY(1px); }
  button:focus-visible { outline: 3px solid light-dark(#4338CA, #A5B4FC); outline-offset: 3px; }
  .err {
    margin: 0 0 0.9rem; padding: 0.6rem 0.75rem; border-radius: 8px;
    font-size: 0.92rem; line-height: 1.45;
    color: light-dark(#8A1C12, #FFB4AB);
    background: light-dark(#FDECEA, rgba(255, 138, 128, 0.12));
    border: 1px solid light-dark(#F5C2BC, rgba(255, 138, 128, 0.35));
  }
  .help { margin: 1.35rem 0 0; color: #E6E5FF; }
  .help strong { color: #fff; font-weight: 700; }

  @media (max-width: 620px) {
    body { align-items: flex-start; }
    .name { font-size: 1.35rem; }
    .mark { width: 2.2rem; height: 2.2rem; }
    .brand { gap: 0.8rem; }
    .team { padding-left: 0.8rem; font-size: 0.95rem; }
    .art { top: -6rem; right: -62vw; width: 150vw; transform: none; }
    .orbit { opacity: 0.45; }
  }
</style>
</head>
<body>
  <div class="band" aria-hidden="true">
    <div class="art">
      <div class="glow"></div>
      <svg class="rings" viewBox="-500 -500 1000 1000" fill="none" stroke="currentColor">
        <circle r="150" stroke-width="6" stroke-dasharray="1 18" stroke-linecap="round"/>
        <circle r="245" stroke-width="3"/>
        <circle r="345" stroke-width="6" stroke-dasharray="1 18" stroke-linecap="round"/>
        <circle r="445" stroke-width="3"/>
        <circle r="70" fill="currentColor" stroke="none" opacity="0.5"/>
        <circle r="34" fill="currentColor" stroke="none"/>
      </svg>
      ${orbitSvgs()}
    </div>
  </div>
  <main>
    <div class="brand">
      <span class="name">${MARK}${ORG}</span>
      <span class="team">${TEAM}</span>
    </div>
    <h1>${SITE}</h1>
    <p class="lede">These guides are for ${ORG} staff. Enter the password to open them.</p>
    <form method="POST">
      ${error}
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus required${
        showError ? ' aria-invalid="true" aria-describedby="err"' : ''
      } />
      <button type="submit">Open the guides</button>
    </form>
    <p class="help">${HELP}</p>
  </main>
</body>
</html>`
  return new Response(html, {
    status: 401,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  })
}

// ── middleware ──────────────────────────────────────────────────────────────

export default async function middleware(request: Request): Promise<Response | undefined> {
  const password = process.env.DOCS_PASSWORD

  // Fail closed: on Vercel, no password means nothing is served.
  if (!password && process.env.VERCEL) {
    return new Response(`The ${SITE} docs are not available: the site has no password set.`, {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  }
  if (!password) return undefined // gate off (local, CI)

  const url = new URL(request.url)
  if (PUBLIC.has(url.pathname)) return undefined
  const secret = process.env.DOCS_SECRET || password
  const cookieFlags = 'Path=/; HttpOnly; Secure; SameSite=Lax'

  // Sign out: clear the cookie and go home, which shows the gate again.
  if (url.pathname === '/__logout') {
    return new Response(null, {
      status: 302,
      headers: { location: '/', 'set-cookie': `${COOKIE}=; ${cookieFlags}; Max-Age=0`, 'cache-control': 'no-store' },
    })
  }

  // Signed in: serve the site untouched, POSTs included (the site's own server calls must
  // never be read as a login attempt).
  if (await verifyToken(secret, readCookie(request, COOKIE))) return undefined

  // The login form posts back to the page the reader asked for.
  if (request.method === 'POST') {
    let supplied = ''
    try {
      supplied = String((await request.formData()).get('password') ?? '')
    } catch {
      // Not a form post: fall through to the error page.
    }
    if (supplied && safeEqual(supplied, password)) {
      return new Response(null, {
        status: 303, // See Other: the browser asks again with GET, now with the cookie
        headers: {
          location: url.pathname + url.search,
          'set-cookie': `${COOKIE}=${await issueToken(secret)}; ${cookieFlags}; Max-Age=${MAX_AGE_SEC}`,
          'cache-control': 'no-store',
        },
      })
    }
    return loginPage(true)
  }

  return loginPage(false)
}
