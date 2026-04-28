import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine } from '@remixicon/react'
import AuthLayout from '../components/AuthLayout'

// ── Reusable field wrapper ────────────────────────────────
const Field = ({ label, required, error, children, delay = 0 }) => (
  <motion.div
    className="flex flex-col"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
  >
    {/* Label */}
    <label className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)] mb-[7px] select-none">
      {label}
      {required && <span className="text-accent text-[11px] leading-none">*</span>}
    </label>

    {children}

    {/* Error */}
    {error && (
      <motion.p
        className="font-mono text-[10px] text-red-500 tracking-[0.04em] mt-1.5"
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
    'w-full h-12 px-4 bg-transparent',
    'border border-[var(--border-col)] rounded-[2px]',
    'text-[var(--text-primary)] font-sans text-[0.9375rem]',
    'placeholder:text-[var(--text-muted)] placeholder:opacity-60',
    'outline-none transition-colors duration-200',
    'focus:border-accent',
    hasError ? 'border-red-500' : '',
  ].join(' ')

// ── LoginPage ─────────────────────────────────────────────
const LoginPage = () => {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [errors, setErrors]   = useState({})
  const [showPwd, setShowPwd] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Client-side validation mirrors the backend loginValidator
  const validate = () => {
    const errs = {}
    if (!form.email)
      errs.email = 'Email is required'
    else if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Enter a valid email address'
    if (!form.password)
      errs.password = 'Password is required'
    else if (form.password.length < 8)
      errs.password = 'Password must be at least 8 characters'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    // Placeholder — wire up to auth service later
    console.log('[Login] submit payload:', form)
  }

  return (
    <AuthLayout>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)] mb-2">
          — Welcome back
        </p>
        <h2 className="font-display font-extrabold text-[var(--text-primary)] text-[2rem] leading-[1.1] tracking-[-0.025em]">
          Sign in to<br />your account.
        </h2>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Email */}
        <Field label="Email Address" required error={errors.email} delay={0.08}>
          <div className="relative">
            <RiMailLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set('email')}
              className={`${inputBase(!!errors.email)} pl-10`}
            />
          </div>
        </Field>

        {/* Password */}
        <Field label="Password" required error={errors.password} delay={0.14}>
          <div className="relative">
            <RiLockLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete="current-password"
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
              {showPwd
                ? <RiEyeOffLine size={16} />
                : <RiEyeLine    size={16} />
              }
            </button>
          </div>
        </Field>

        {/* Stripe divider */}
        <div className="stripe-divider rounded-[1px] my-1" />

        {/* Submit */}
        <motion.button
          id="login-submit"
          type="submit"
          className={[
            'w-full h-12 bg-accent text-[#0F0F0E]',
            'font-sans font-semibold text-[0.8125rem] uppercase tracking-[0.08em]',
            'rounded-[2px] border-none cursor-pointer',
            'transition-all duration-200',
            'hover:brightness-110 hover:-translate-y-px',
            'active:translate-y-0 active:brightness-95',
            'relative overflow-hidden',
          ].join(' ')}
          whileTap={{ scale: 0.985 }}
        >
          Sign In
        </motion.button>

        {/* Footer link */}
        <motion.p
          className="text-center font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)] mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No account?{' '}
          <Link
            to="/register"
            className="text-accent hover:underline transition-all duration-150"
          >
            Register here
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  )
}

export default LoginPage
