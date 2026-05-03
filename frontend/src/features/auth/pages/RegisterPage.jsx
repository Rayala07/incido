import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiLockLine,
  RiUser3Line,
  RiShieldLine,
  RiAlertLine,
  RiMailCheckLine,
} from "@remixicon/react";
import { GoogleAuthButton } from "../components/GoogleAuthButton";
import useAuth from "../hooks/useAuth";

// ── Password strength logic ───────────────────────────────
const calcStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8)                             score++;
  if (pwd.length >= 12)                            score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd))     score++;
  if (/[0-9]/.test(pwd))                           score++;
  if (/[^a-zA-Z0-9]/.test(pwd))                   score++;
  return score; // 0–5
};

const STRENGTH_META = [
  { label: "Too short", color: "#EF4444" },
  { label: "Weak",      color: "#F97316" },
  { label: "Fair",      color: "#EAB308" },
  { label: "Strong",    color: "#00C2D4" },
  { label: "Strong",    color: "#00C2D4" },
  { label: "Strong",    color: "#00C2D4" },
];

const StrengthBar = ({ password }) => {
  const score = useMemo(() => calcStrength(password), [password]);
  const meta  = STRENGTH_META[score];

  if (!password) return null;

  return (
    <motion.div
      className="mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4, 5].map((seg) => (
          <div
            key={seg}
            className="h-[2px] flex-1 rounded-[2px]"
            style={{
              backgroundColor: seg <= score ? meta.color : "var(--border-col)",
              transition: "background-color 0.35s ease",
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
  );
};

// ── Reusable field wrapper ────────────────────────────────
const Field = ({ label, required, error, hint, children, delay = 0 }) => (
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

    {hint && !error && (
      <p className="font-mono font-normal text-[0.58rem] tracking-[0.05em] text-[var(--text-muted)] mt-0.5 leading-none opacity-70">
        {hint}
      </p>
    )}

    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key={error}
          className="font-mono font-normal text-[0.58rem] text-red-500 tracking-[0.08em] mt-0.5 leading-none"
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.15 }}>
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </motion.div>
);

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
  ].join(" ");

// ── Section separator ─────────────────────────────────────
const SectionLabel = ({ children, delay = 0 }) => (
  <motion.div
    className="flex items-center justify-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--text-secondary)] opacity-70"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.7 }}
    transition={{ delay, duration: 0.35 }}
  >
    <span className="opacity-50">—</span>
    {children}
    <span className="opacity-50">—</span>
  </motion.div>
);

// ── Post-registration success screen ─────────────────────
const SuccessScreen = ({ email }) => (
  <motion.div
    className="flex flex-col items-center text-center gap-4 py-4"
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="flex items-center justify-center w-14 h-14 rounded-full border border-accent/30 bg-accent/10">
      <RiMailCheckLine size={28} className="text-accent" />
    </div>
    <div>
      <h3
        className="font-display font-semibold text-[var(--text-primary)] leading-[1.1]"
        style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
      >
        Check your inbox.
      </h3>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)] mt-3 leading-[1.8]">
        A verification link has been sent to<br />
        <span className="text-[var(--text-primary)]">{email}</span>.<br />
        Click it to activate your account.
      </p>
    </div>
    <div className="stripe-divider w-full rounded-[1px]" />
    <p className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
      Already verified?{" "}
      <Link
        to="/login"
        className="text-accent hover:underline transition-all duration-150"
      >
        Sign in
      </Link>
    </p>
  </motion.div>
);

// ── RegisterPage ──────────────────────────────────────────
const RegisterPage = () => {
  const { register, isLoading, error, dismissError } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email:    "",
    password: "",
    role:     "responder",
  });
  const [localErrors, setLocalErrors] = useState({});
  const [showPwd, setShowPwd]         = useState(false);
  const [registered, setRegistered]   = useState(false); // flip to show success screen

  // Clear API-level error when user edits any field
  useEffect(() => {
    if (error) dismissError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.username, form.email, form.password]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Client-side validation mirrors backend registerValidator
  const validate = () => {
    const errs = {};
    if (!form.username)
      errs.username = "Username is required";
    else if (form.username.trim().length < 3)
      errs.username = "Username must be at least 3 characters";

    if (!form.email)
      errs.email = "Email is required";
    else if (!/^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = "Enter a valid email address";

    if (!form.password)
      errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(form.password))
      errs.password = "Password must contain at least one uppercase letter";
    else if (!/[a-z]/.test(form.password))
      errs.password = "Password must contain at least one lowercase letter";
    else if (!/\d/.test(form.password))
      errs.password = "Password must contain at least one number";
    else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password))
      errs.password = "Password must contain at least one special character";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setLocalErrors(errs);
      return;
    }
    setLocalErrors({});
    const result = await register({
      username: form.username,
      email:    form.email,
      password: form.password,
      role:     form.role,
    });
    if (result.success) {
      setRegistered(true);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google?role=${form.role}`;
  };

  // ── Success screen ──────────────────────────────────────
  if (registered) {
    return <SuccessScreen email={form.email} />;
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
          — New account
        </p>
        <h2
          className="font-display font-semibold text-[var(--text-primary)] leading-[1.05] tracking-[-0.01em]"
          style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
        >
          Join Incido.<br />Start responding.
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
        {error && (
          <motion.div
            className="flex items-start gap-2 px-3 py-2 mb-2 bg-red-500/10 border border-red-500/30 rounded-[2px]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RiAlertLine size={14} className="text-red-400 shrink-0 mt-px" />
            <p className="font-mono text-[0.65rem] text-red-400 tracking-[0.06em] leading-[1.6]">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1.5">
        {/* ── Section: Account Info ──────────────────────── */}
        <SectionLabel delay={0.06}>Account Info</SectionLabel>

        {/* Username */}
        <Field
          label="Username"
          required
          error={localErrors.username}
          hint="Min. 3 characters"
          delay={0.1}
        >
          <div className="relative">
            <RiUser3Line
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              placeholder="john_doe"
              value={form.username}
              onChange={set("username")}
              disabled={isLoading}
              className={`${inputBase(!!localErrors.username)} pl-10`}
            />
          </div>
        </Field>

        {/* Email */}
        <Field
          label="Email Address"
          required
          error={localErrors.email}
          delay={0.16}
        >
          <div className="relative">
            <RiMailLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            <input
              id="register-email"
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

        {/* ── Section: Security ─────────────────────────── */}
        <SectionLabel delay={0.2}>Security</SectionLabel>

        {/* Password */}
        <Field
          label="Password"
          required
          error={localErrors.password}
          delay={0.24}
        >
          <div className="relative">
            <RiLockLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none"
            />
            <input
              id="register-password"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
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
          <StrengthBar password={form.password} />
        </Field>

        {/* Role */}
        <Field
          label="Role"
          required={false}
          error={localErrors.role}
          hint='Defaults to "Responder" — select "Admin" only if intended.'
          delay={0.3}
        >
          <div className="relative">
            <RiShieldLine
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none z-10"
            />
            <select
              id="register-role"
              value={form.role}
              onChange={set("role")}
              disabled={isLoading}
              className={[
                "auth-select",
                inputBase(false),
                "pl-10 cursor-pointer",
              ].join(" ")}
            >
              <option value="responder">Responder</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </Field>

        {/* Stripe divider */}
        <div className="stripe-divider rounded-[1px] my-0.5" />

        {/* Submit */}
        <motion.button
          id="register-submit"
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
          {isLoading ? "Creating account…" : "Create Account"}
        </motion.button>

        {/* Footer link */}
        <motion.p
          className="text-center font-mono font-normal text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-muted)] mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent hover:underline transition-all duration-150"
          >
            Sign in
          </Link>
        </motion.p>
      </form>
    </>
  );
};

export default RegisterPage;
