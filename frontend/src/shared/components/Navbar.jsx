import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { RiSunLine, RiMoonLine, RiLogoutBoxLine } from "@remixicon/react";
import useAuth from "../../features/auth/hooks/useAuth";

const LogoBox = () => (
  <div className="inline-flex items-center justify-center w-20 h-8 border border-dashed border-[var(--border-col)] rounded-[2px] shrink-0">
    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
      [Logo]
    </span>
  </div>
);

/* ─── Avatar with initials + dropdown logout ─────────────── */
const UserAvatar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  return (
    <div ref={ref} className="relative">
      {/* Avatar circle */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-8 h-8 rounded-full bg-[var(--accent-subtle)] border border-[var(--accent)] flex items-center justify-center cursor-pointer transition-all hover:border-[var(--accent-hover)] focus:outline-none"
        aria-label="User menu"
        aria-expanded={open}
      >
        <span className="font-mono text-[0.65rem] font-bold text-[var(--accent)] select-none leading-none">
          {initials}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[var(--bg-card)] border border-[var(--border-col)] shadow-lg z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--border-col)]">
            <p className="font-sans font-medium text-[0.85rem] text-[var(--text-primary)] truncate">
              {user.username}
            </p>
            <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)] truncate mt-0.5">
              {user.email}
            </p>
            <span className="inline-block mt-1.5 font-mono text-[0.55rem] uppercase tracking-widest text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-1.5 py-0.5 leading-none">
              {user.role}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/5 transition-colors cursor-pointer"
          >
            <RiLogoutBoxLine size={14} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

/* ─── Navbar ─────────────────────────────────────────────── */
const Navbar = () => {
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from document class
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLink = (to, label) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        key={to}
        to={to}
        className={`font-mono font-medium text-[11px] uppercase tracking-wider pb-1 transition-colors duration-150 border-b-2 ${
          active
            ? "text-[var(--text-primary)] border-accent"
            : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="w-full flex flex-col shrink-0 z-50 relative">
      <div className="w-full h-12 bg-[var(--bg-card)] border-b border-[var(--border-col)] px-6 flex items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center">
          <LogoBox />
        </div>

        {/* Center: Nav links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 h-full pt-[3px]">
          {navLink("/dashboard", "Dashboard")}
          {navLink("/projects", "Projects")}
          {navLink("/incidents", "Incidents")}
        </div>

        {/* Right: Theme toggle + Avatar */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 p-1 flex items-center justify-center cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </button>

          <UserAvatar />
        </div>
      </div>

      {/* Stripe Divider */}
      <div className="w-full stripe-divider h-[6px]" />
    </div>
  );
};

export default Navbar;
