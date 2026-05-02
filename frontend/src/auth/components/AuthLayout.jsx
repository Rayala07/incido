import { Link, useLocation, Outlet } from 'react-router-dom'
import { motion } from 'motion/react'
import '../../app/app.css'

// ── Shared sub-components ─────────────────────────────────

const LogoBox = ({ light = false }) => (
  <div className={`inline-flex items-center justify-center w-20 h-8 border border-dashed rounded-[2px] shrink-0`} style={{
    borderColor: light ? 'rgba(232, 240, 255, 0.35)' : 'var(--border-col)'
  }}>
    <span className={`font-mono text-[9px] uppercase tracking-[0.1em]`} style={{
      color: light ? 'rgba(232, 240, 255, 0.50)' : 'var(--text-muted)'
    }}>
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
        className={`font-mono font-medium text-[0.7rem] uppercase tracking-[0.12em] pb-1 border-b-2 transition-colors duration-200 ${
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

const DecoPanelContent = ({ alignRight = false }) => (
  <div className={`flex flex-col h-full ${alignRight ? 'items-end text-right' : 'items-start text-left'}`}>
    <LogoBox light />

    {/* Tagline */}
    <div className={`flex-1 flex flex-col justify-center mt-8 ${alignRight ? 'items-end' : 'items-start'}`}>
      <motion.h1
        className="font-display font-semibold leading-[1.0] tracking-[-0.01em]"
        style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', maxWidth: 300, color: '#FFFFFF' }}
      >
        Built for scale.<br />Designed for<br />humans.
      </motion.h1>
      <motion.p
        className="font-mono font-normal uppercase leading-[1.8] mt-5"
        style={{ fontSize: '0.6rem', letterSpacing: '0.12em', color: 'rgba(232, 240, 255, 0.60)', maxWidth: 260 }}
      >
        Incident response infrastructure<br />for modern engineering teams.
      </motion.p>
    </div>

    {/* Stats */}
    <div className={`shrink-0 flex flex-col ${alignRight ? 'items-end' : 'items-start'}`}>
      {STATS.map((stat, idx) => (
        <div key={idx} className="w-full">
          <div className={`py-3 flex flex-col ${alignRight ? 'items-end' : 'items-start'}`}>
            <div className="font-display font-medium text-[2rem] leading-none" style={{ color: '#FFFFFF' }}>
              {stat.value}
            </div>
            <div className="font-mono font-normal text-[0.6rem] uppercase tracking-[0.12em] mt-1" style={{ color: 'rgba(232, 240, 255, 0.55)' }}>
              {stat.label}
            </div>
          </div>
          {idx < STATS.length - 1 && <DecoStripe />}
        </div>
      ))}
    </div>
  </div>
)

const DecoPanel = ({ compact = false, isRegister = false }) => {
  if (compact) {
    return (
      <div className="w-full flex items-center px-10 gap-12 relative overflow-hidden" style={{ height: 160, backgroundImage: "url('/auth-panel-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(160deg, rgba(0, 8, 32, 0.55) 0%, rgba(0, 5, 20, 0.40) 40%, rgba(0, 8, 32, 0.65) 100%)', pointerEvents: 'none' }} />
        <div className="grain-overlay" style={{ zIndex: 2, opacity: 0.15 }} />
        <p className="relative z-[3] font-display font-semibold leading-tight text-[1.125rem] max-w-[200px] tracking-[-0.02em]" style={{ color: '#FFFFFF' }}>
          Built for scale.<br />Designed for humans.
        </p>
        <div className="relative z-[3] flex gap-10 ml-auto">
          {STATS.slice(0, 2).map((s, i) => (
            <div key={i}>
              <div className="font-display font-medium text-[2rem] leading-none" style={{ color: '#FFFFFF' }}>{s.value}</div>
              <div className="font-mono font-normal text-[0.6rem] uppercase tracking-[0.12em] mt-1" style={{ color: 'rgba(232, 240, 255, 0.55)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ backgroundImage: "url('/auth-panel-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(160deg, rgba(0, 8, 32, 0.55) 0%, rgba(0, 5, 20, 0.40) 40%, rgba(0, 8, 32, 0.65) 100%)', pointerEvents: 'none' }} />
      <div className="grain-overlay" style={{ zIndex: 2, opacity: 0.15 }} />

      {/* Cross-fading container wrapper */}
      <div className="absolute inset-10 z-[3]">
        
        {/* Left-aligned state (Sign In) */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{ opacity: isRegister ? 0 : 1, pointerEvents: isRegister ? 'none' : 'auto' }}
        >
          <DecoPanelContent alignRight={false} />
        </div>

        {/* Right-aligned state (Register) */}
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{ opacity: isRegister ? 1 : 0, pointerEvents: isRegister ? 'auto' : 'none' }}
        >
          <DecoPanelContent alignRight={true} />
        </div>

      </div>
    </div>
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

const AuthLayout = () => {
  const { pathname } = useLocation()
  const isRegister = pathname === '/register'

  return (
    // h-screen + overflow-hidden = hard viewport boundary, no page scroll
    <div className={`auth-wrapper h-screen overflow-hidden flex flex-col lg:flex-row bg-[var(--bg-base)] ${isRegister ? 'swapped' : ''}`}>
      <style>{`
        @media (min-width: 1024px) {
          .auth-wrapper {
            position: relative;
          }
          .slide-panel {
            transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
          }
          .auth-wrapper.swapped .slide-panel-left {
            transform: translateX(calc(100vw - 100%));
          }
          .auth-wrapper.swapped .slide-panel-right {
            transform: translateX(calc(-100vw + 100%));
          }
        }
      `}</style>

      <div className="slide-panel slide-panel-left hidden lg:block shrink-0 h-full relative z-20" style={{ width: '45%' }}>
        <DecoPanel isRegister={isRegister} />
      </div>

      {/* Right / main column — fills remaining width, full height */}
      <div className="slide-panel slide-panel-right flex flex-1 flex-col h-full overflow-hidden bg-[var(--bg-base)] relative z-10">

        {/* Mobile: 4px cyan accent bar — shrink-0 so it never collapses */}
        <div className="lg:hidden shrink-0" style={{ background: 'linear-gradient(90deg, #010818 0%, #1A3FD4 40%, #00C4C8 65%, #010818 100%)', height: '3px' }} />

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
          <div className="min-h-full flex items-center justify-center px-5 py-4">
            <motion.div
              className={[
                'w-full bg-[var(--bg-card)]',
                'py-7 px-5',
                'md:max-w-[480px] md:border md:border-[var(--border-col)]',
                'md:shadow-[0_4px_32px_rgba(10,44,196,0.10)] dark:md:shadow-[0_4px_40px_rgba(1,8,24,0.70)]',
                'md:px-10 md:py-6',
                'transition-all duration-300',
                'hover:rounded-xl hover:border-accent',
                'focus-within:rounded-xl focus-within:border-accent',
              ].join(' ')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default AuthLayout
