import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { RiSunLine, RiMoonLine } from "@remixicon/react";

const LogoBox = () => (
  <div className="inline-flex items-center justify-center w-20 h-8 border border-dashed border-[var(--border-col)] rounded-[2px] shrink-0">
    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
      [Logo]
    </span>
  </div>
);

const Navbar = () => {
  const { pathname } = useLocation();
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from localStorage or document class
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLink = (to, label) => {
    // Exact match for dashboard/projects, or prefix match for sub-routes like /incidents/create
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

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 p-1 flex items-center justify-center cursor-pointer"
            aria-label="Toggle Theme"
          >
            {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </button>
          
          <Link
            to="/profile"
            className="font-mono font-medium text-[11px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            Profile
          </Link>
        </div>
      </div>

      {/* Stripe Divider */}
      <div className="w-full stripe-divider h-[6px]" />
    </div>
  );
};

export default Navbar;
