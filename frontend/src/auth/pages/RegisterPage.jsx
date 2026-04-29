import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  RiEyeLine, RiEyeOffLine,
  RiMailLine, RiLockLine,
  RiUser3Line, RiShieldLine,
} from '@remixicon/react'
import { GoogleAuthButton } from '../components/GoogleAuthButton'

// ── Password strength logic ───────────────────────────────
const calcStrength = (pwd) => {
  if (!pwd) return 0
  let score = 0
  if (pwd.length >= 8)                               score++ // meets minimum length
  if (pwd.length >= 12)                              score++ // bonus: good length
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))       score++ // mixed case
  if (/[0-9]/.test(pwd))                             score++ // has digit
  if (/[^a-zA-Z0-9]/.test(pwd))                     score++ // any non-alphanumeric char
  return score // 0–5
}

const STRENGTH_META = [
  { label: 'Too short', color: '#EF4444' },
  { label: 'Weak',      color: '#F97316' },
  { label: 'Fair',      color: '#EAB308' },
  { label: 'Strong',    color: '#00C2D4' },
  { label: 'Strong',    color: '#00C2D4' },
  { label: 'Strong',    color: '#00C2D4' },
]

const StrengthBar = ({ password }) => {
  const score = useMemo(() => calcStrength(password), [password])
  const meta  = STRENGTH_META[score]

  if (!password) return null

  return (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* 5 segment bars */}
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map((seg) => (
          <div
            key={seg}
            className="h-[2px] flex-1 rounded-[2px] transition-all duration-400"
            style={{
              backgroundColor: seg <= score ? meta.color : 'var(--border-col)',
              transition: 'background-color 0.35s ease, width 0.35s ease',
            }}
          />
        ))}
      </div>
      <p
        className="font-mono text-[9px] uppercase tracking-[0.12em] transition-colors duration-300"
        style={{ color: meta.color }}
      >
        {meta.label}
      </p>
    </motion.div>
  )
}

// ── Reusable field wrapper ────────────────────────────────
const Field = ({ label, required, error, hint, children, delay = 0 }) => (
  <motion.div
    className="flex flex-col"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
  >
    <label className="flex items-center gap-1 font-mono font-normal text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)] mb-[7px] select-none">
      {label}
      {required && <span className="text-accent text-[11px] leading-none">*</span>}
    </label>

    {children}

    {hint && !error && (
      <p className="font-mono font-normal text-[0.65rem] tracking-[0.06em] text-[var(--text-muted)] mt-1 leading-[1.6]">
        {hint}
      </p>
    )}

    {error && (
      <motion.p
        className="font-mono font-normal text-[0.65rem] text-red-500 tracking-[0.1em] mt-1"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {error}
      </motion.p>
    )}
  </motion.div>
)

// ── Base input classes ────────────────────────────────────
const inputBase = (hasError) =>
  [
    'w-full h-10 px-4 bg-transparent',
    'border border-[var(--border-col)] rounded-[2px]',
    'text-[var(--text-primary)] font-sans font-normal text-[0.9rem]',
    'placeholder:text-[var(--text-muted)] placeholder:opacity-60',
    'outline-none transition-colors duration-200',
    'focus:border-accent',
    hasError ? 'border-red-500' : '',
  ].join(' ')

// ── Section separator ─────────────────────────────────────
const SectionLabel = ({ children, delay = 0 }) => (
  <motion.div
    className="flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.35 }}
  >
    <span className="opacity-50">—</span>
    {children}
    <span className="opacity-50">—</span>
  </motion.div>
)

// ── RegisterPage ──────────────────────────────────────────
const RegisterPage = () => {
  const [form, setForm] = useState({
    username: '',
    email:    '',
    password: '',
    role:     'responder',
  })
  const [errors, setErrors]   = useState({})
  const [showPwd, setShowPwd] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Client-side validation mirrors backend registerValidator
  const validate = () => {
    const errs = {}
    if (!form.username)
      errs.username = 'Username is required'
    else if (form.username.trim().length < 3)
      errs.username = 'Username must be at least 3 characters'

    if (!form.email)
      errs.email = 'Email is required'
    else if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Enter a valid email address'

    if (!form.password)
      errs.password = 'Password is required'
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters'
    else if (!/[A-Z]/.test(form.password))
      errs.password = 'Password must contain at least one uppercase letter'
    else if (!/[a-z]/.test(form.password))
      errs.password = 'Password must contain at least one lowercase letter'
    else if (!/\d/.test(form.password))
      errs.password = 'Password must contain at least one number'
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
      errs.password = 'Password must contain at least one special character'

    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    // Placeholder — wire up to auth service later
    console.log('[Register] submit payload:', form)
  }

  return (
    <>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-4"
      >
        <p className="font-mono font-normal text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2">
          — New account
        </p>
        <h2
          className="font-display font-semibold text-[var(--text-primary)] leading-[1.05] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          Join Incido.<br />Start responding.
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="w-full"
      >
        <GoogleAuthButton onClick={() => {
          // TODO: wire Google OAuth handler
        }} />
        
        {/* OR Divider */}
        <div className="flex items-center gap-3 my-3">
          <hr className="flex-1 border-t border-[var(--border-col)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            or
          </span>
          <hr className="flex-1 border-t border-[var(--border-col)]" />
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

        {/* ── Section: Account Info ──────────────────────── */}
        <SectionLabel delay={0.06}>Account Info</SectionLabel>

        {/* Username */}
        <Field
          label="Username"
          required
          error={errors.username}
          hint="Min. 3 characters"
          delay={0.1}
        >
          <div className="relative">
            <RiUser3Line
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              placeholder="john_doe"
              value={form.username}
              onChange={set('username')}
              className={`${inputBase(!!errors.username)} pl-10`}
            />
          </div>
        </Field>

        {/* Email */}
        <Field label="Email Address" required error={errors.email} delay={0.16}>
          <div className="relative">
            <RiMailLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set('email')}
              className={`${inputBase(!!errors.email)} pl-10`}
            />
          </div>
        </Field>

        {/* ── Section: Security ─────────────────────────── */}
        <SectionLabel delay={0.2}>Security</SectionLabel>

        {/* Password */}
        <Field
          label="Password"
          required
          error={errors.password}
          delay={0.24}
        >
          <div className="relative">
            <RiLockLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              id="register-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              className={`${inputBase(!!errors.password)} pl-10 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-200 p-0 bg-transparent border-none cursor-pointer"
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
            </button>
          </div>
          <StrengthBar password={form.password} />
        </Field>

        {/* Role */}
        <Field
          label="Role"
          required={false}
          error={errors.role}
          hint='Defaults to "Responder" — select "Admin" only if intended.'
          delay={0.3}
        >
          <div className="relative">
            <RiShieldLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none z-10"
            />
            <select
              id="register-role"
              value={form.role}
              onChange={set('role')}
              className={[
                'auth-select',
                inputBase(false),
                'pl-10 cursor-pointer',
              ].join(' ')}
            >
              <option value="responder">Responder</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </Field>

        {/* Stripe divider */}
        <div className="stripe-divider rounded-[1px] my-1" />

        {/* Submit */}
        <motion.button
          id="register-submit"
          type="submit"
          className={[
            'w-full h-10 bg-accent text-[#0F0F0E]',
            'font-mono font-medium text-[0.75rem] uppercase tracking-[0.15em]',
            'rounded-[2px] border-none cursor-pointer',
            'transition-all duration-200',
            'hover:brightness-110 hover:-translate-y-px',
            'active:translate-y-0 active:brightness-95',
            'relative overflow-hidden',
          ].join(' ')}
          whileTap={{ scale: 0.985 }}
        >
          Create Account
        </motion.button>

        {/* Footer link */}
        <motion.p
          className="text-center font-mono font-normal text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)] mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent hover:underline transition-all duration-150"
          >
            Sign in
          </Link>
        </motion.p>
      </form>
    </>
  )
}

export default RegisterPage
