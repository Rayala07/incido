import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import '../../app/app.css'

// ── Shared sub-components ─────────────────────────────────

const LogoBox = ({ light = false }) => (
  <div className={`inline-flex items-center justify-center w-20 h-8 border border-dashed rounded-[2px] shrink-0 ${
    light ? 'border-white/20' : 'border-[var(--border-col)]'
  }`}>
    <span className={`font-mono text-[9px] uppercase tracking-[0.1em] ${
      light ? 'text-white/45' : 'text-[var(--text-muted)]'
    }`}>
      [Logo]
    </span>
  </div>
)

const TabLinks = () => {
  const { pathname } = useLocation()
  const tab = (to, label) => {
    const active = pathname === to
    return (
      <Link
        key={to}
        to={to}
        className={`font-mono text-[10px] uppercase tracking-[0.12em] pb-1 border-b-2 transition-colors duration-200 ${
          active
            ? 'text-[var(--text-primary)] border-accent'
            : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'
        }`}
      >
        {label}
      </Link>
    )
  }
  return (
    <>
      {tab('/login',    'Sign In')}
      {tab('/register', 'Register')}
    </>
  )
}

// ── Decorative panel ──────────────────────────────────────

const STATS = [
  { value: '<200ms', label: 'Avg. Response Time' },
  { value: '99.9%',  label: 'Uptime SLA'         },
  { value: '24/7',   label: 'Active Monitoring'   },
]

const DecoStripe = () => (
  <div className="h-px" style={{
    background: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(255,255,255,0.12) 3px, rgba(255,255,255,0.12) 4px)'
  }} />
)

const DecoPanel = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="deco-panel w-full flex items-center px-10 gap-12" style={{ height: 160 }}>
        <div className="grain-overlay" />
        <p className="relative z-10 font-display font-extrabold text-white leading-tight text-[1.125rem] max-w-[200px] tracking-[-0.02em]">
          Built for scale.<br />Designed for humans.
        </p>
        <div className="relative z-10 flex gap-10 ml-auto">
          {STATS.slice(0, 2).map((s, i) => (
            <div key={i}>
              <div className="font-display font-extrabold text-white text-xl leading-none tracking-[-0.02em]">{s.value}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/55 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="deco-panel h-full flex flex-col p-10"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grain-overlay" />

      <div className="relative z-10 flex flex-col h-full">
        <LogoBox light />

        {/* Tagline */}
        <div className="flex-1 flex flex-col justify-center mt-8">
          <motion.h1
            className="font-display font-extrabold text-white leading-[1.08] tracking-[-0.025em]"
            style={{ fontSize: '2.25rem', maxWidth: 300 }}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Built for scale.<br />Designed for<br />humans.
          </motion.h1>
          <motion.p
            className="font-mono uppercase leading-[1.8] mt-5"
            style={{ fontSize: 10, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', maxWidth: 260 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.5 }}
          >
            Incident response infrastructure<br />for modern engineering teams.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          className="shrink-0"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.5 }}
        >
          {STATS.map((stat, idx) => (
            <div key={idx}>
              <div className="py-3">
                <div className="font-display font-extrabold text-white text-2xl leading-none tracking-[-0.02em]">
                  {stat.value}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/55 mt-1">
                  {stat.label}
                </div>
              </div>
              {idx < STATS.length - 1 && <DecoStripe />}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── AuthLayout ────────────────────────────────────────────
// KEY LAYOUT RULES:
//  - Outer shell: h-screen overflow-hidden → page never scrolls
//  - All header bars: shrink-0 → fixed height, never squeezed
//  - Form scroll region: flex-1 min-h-0 overflow-y-auto →
//    only this region scrolls when content exceeds remaining height
//  - Inner centering wrapper: min-h-full flex items-center →
//    centers form when it fits; scrolls from top when it doesn't

const AuthLayout = ({ children }) => {
  return (
    // h-screen + overflow-hidden = hard viewport boundary, no page scroll
    <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-[var(--bg-base)]">

      {/* Left decorative column — desktop only, full height */}
      <div className="hidden lg:block shrink-0 h-full" style={{ width: '45%' }}>
        <DecoPanel />
      </div>

      {/* Right / main column — fills remaining width, full height */}
      <div className="flex flex-1 flex-col h-full overflow-hidden bg-[var(--bg-base)]">

        {/* Mobile: 4px cyan accent bar — shrink-0 so it never collapses */}
        <div className="lg:hidden h-1 bg-accent shrink-0" />

        {/* Nav bar — tablet & desktop, shrink-0 */}
        <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-[var(--border-col)] shrink-0">
          <LogoBox />
          <div className="flex items-center gap-6">
            <TabLinks />
          </div>
        </nav>
        <div className="hidden md:block stripe-divider shrink-0" />

        {/* Tablet atmospheric banner — shrink-0 */}
        <div className="hidden md:block lg:hidden shrink-0">
          <DecoPanel compact />
          <div className="stripe-divider" />
        </div>

        {/* Mobile header: logo + tabs — shrink-0 */}
        <div className="flex md:hidden flex-col items-center pt-6 shrink-0">
          <LogoBox />
          <div className="flex items-center justify-center gap-6 w-full mt-5 pb-3 border-b border-[var(--border-col)] px-5">
            <TabLinks />
          </div>
          <div className="stripe-divider w-full" />
        </div>

        {/* ── Scrollable form region ──────────────────────
            flex-1    → take all remaining height
            min-h-0   → allow it to shrink below content size (crucial!)
            overflow-y-auto → scroll only when content exceeds this area
        */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* min-h-full + flex items-center = center when fits, top-align when scrolling */}
          <div className="min-h-full flex items-center justify-center px-5 py-8">
            <motion.div
              className={[
                'w-full bg-[var(--bg-card)]',
                'py-7 px-5',
                'md:max-w-[480px] md:border md:border-[var(--border-col)]',
                'md:rounded-[2px] md:shadow-[0_4px_32px_rgba(0,0,0,0.06)]',
                'md:px-10 md:py-8',
              ].join(' ')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              {children}
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthLayout
