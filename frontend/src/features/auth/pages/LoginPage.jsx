import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import {
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiLockLine,
  RiAlertLine,
  RiCheckLine,
} from "@remixicon/react"
import { GoogleAuthButton } from "../components/GoogleAuthButton"
import useAuth from "../hooks/useAuth"

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

// ── Reusable field wrapper ────────────────────────────────
const Field = ({ label, required, error, children, delay = 0 }) => (
  <motion.div
    className="flex flex-col"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
  >
    <label className="flex items-center gap-1 font-mono font-normal text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-secondary)] mb-1 select-none">
      {label}
      {required && (
        <span className="text-accent text-[10px] leading-none">*</span>
      )}
    </label>

    {children}

    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key={error}
          className="font-mono font-normal text-[0.58rem] text-red-500 tracking-[0.08em] mt-0.5 leading-none"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
)

// ── Base input classes ────────────────────────────────────
const inputBase = (hasError) =>
  [
    "w-full h-9 px-3.5 bg-transparent",
    "border border-[var(--border-col)] rounded-[2px]",
    "text-[var(--text-primary)] font-sans font-normal text-[0.85rem]",
    "placeholder:text-[var(--text-muted)] placeholder:opacity-60",
    "outline-none transition-colors duration-200",
    "focus:border-accent focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    hasError ? "border-red-500" : "",
  ].join(" ")

// ── LoginPage ─────────────────────────────────────────────
const LoginPage = () => {
  const { login, isLoading, error, dismissError } = useAuth()

  const [form, setForm] = useState({ email: "", password: "" })
  const [localErrors, setLocalErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const isVerified = searchParams.get("verified") === "true"
  const urlError = searchParams.get("error")

  // Map URL errors to human-readable text
  const urlErrorMessage =
    urlError === "missing_email"
      ? "Verification link is invalid."
      : urlError === "user_not_found"
        ? "User not found for this verification link."
        : urlError === "server_error"
          ? "Server error during verification. Please try again."
          : urlError === "oauth_failed"
            ? "Google authentication failed. Please try again."
            : null

  // Clear API-level error when user starts typing again
  useEffect(() => {
    if (error) dismissError()
    if (urlError) {
      searchParams.delete("error")
      setSearchParams(searchParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email, form.password])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Client-side validation mirrors the backend loginValidator
  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = "Email is required"
    else if (
      !/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)
    )
      errs.email = "Enter a valid email address"
    if (!form.password) errs.password = "Password is required"
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setLocalErrors(errs)
      return
    }
    setLocalErrors({})
    await login({ email: form.email, password: form.password })
    // useAuth.login handles redirect on success and sets error on failure
  }

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth — response comes back via cookie
    window.location.href = `${backendBaseUrl}/api/auth/google`
  }

  return (
    <>
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-2"
      >
        <p className="font-mono font-normal text-[0.65rem] uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1">
          — Welcome back
        </p>
        <h2
          className="font-display font-semibold text-[var(--text-primary)] leading-[1.05] tracking-[-0.01em]"
          style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
        >
          Sign in to
          <br />
          your account.
        </h2>
      </motion.div>

      {/* Google */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="w-full"
      >
        <GoogleAuthButton onClick={handleGoogleLogin} disabled={isLoading} />

        {/* OR Divider */}
        <div className="flex items-center gap-3 my-2">
          <hr className="flex-1 border-t border-[var(--border-col)]" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            or
          </span>
          <hr className="flex-1 border-t border-[var(--border-col)]" />
        </div>
      </motion.div>

      {/* API-level error banner */}
      <AnimatePresence>
        {(error || urlErrorMessage) && (
          <motion.div
            className="flex items-start gap-2 px-3 py-2 mb-2 bg-red-500/10 border border-red-500/30 rounded-[2px]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RiAlertLine size={14} className="text-red-400 shrink-0 mt-px" />
            <p className="font-mono text-[0.65rem] text-red-400 tracking-[0.06em] leading-[1.6]">
              {error || urlErrorMessage}
            </p>
          </motion.div>
        )}

        {isVerified && (
          <motion.div
            className="flex items-start gap-2 px-3 py-2 mb-2 bg-[#00C2D4]/10 border border-[#00C2D4]/30 rounded-[2px]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RiCheckLine size={14} className="text-[#00C2D4] shrink-0 mt-px" />
            <p className="font-mono text-[0.65rem] text-[#00C2D4] tracking-[0.06em] leading-[1.6]">
              Email verified successfully! You can now sign in.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
        {/* Email */}
        <Field
          label="Email Address"
          required
          error={localErrors.email}
          delay={0.08}
        >
          <div className="relative">
            <RiMailLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set("email")}
              disabled={isLoading}
              className={`${inputBase(!!localErrors.email)} pl-10`}
            />
          </div>
        </Field>

        {/* Password */}
        <Field
          label="Password"
          required
          error={localErrors.password}
          delay={0.14}
        >
          <div className="relative">
            <RiLockLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            <input
              id="login-password"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              disabled={isLoading}
              className={`${inputBase(!!localErrors.password)} pl-10 pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              disabled={isLoading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-200 p-0 bg-transparent border-none cursor-pointer disabled:opacity-50"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
            </button>
          </div>
        </Field>

        {/* Stripe divider */}
        <div className="stripe-divider rounded-[1px] my-0.5" />

        {/* Submit */}
        <motion.button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className={[
            "w-full h-9 bg-accent text-[var(--accent-text)]",
            "font-mono font-medium text-[0.75rem] uppercase tracking-[0.15em]",
            "rounded-[2px] border-none cursor-pointer",
            "transition-all duration-200",
            "hover:bg-accent-hover hover:-translate-y-px",
            "focus:outline-2 focus:outline-accent focus:outline-offset-2",
            "active:bg-[#081FA8] active:translate-y-0",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0",
          ].join(" ")}
          whileTap={isLoading ? {} : { scale: 0.985 }}
        >
          {isLoading ? "Signing in…" : "Sign In"}
        </motion.button>

        {/* Footer link */}
        <motion.p
          className="text-center font-mono font-normal text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)] mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          No account?{" "}
          <Link
            to="/register"
            className="text-accent hover:underline transition-all duration-150"
          >
            Register here
          </Link>
        </motion.p>
      </form>
    </>
  )
}

export default LoginPage
