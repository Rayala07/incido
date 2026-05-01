import useAuth from "../../auth/hook/useAuth";

/**
 * DashboardPage — Phase 1 placeholder.
 * Will be fleshed out in Phase 3 with sidebar, summary cards, and activity feed.
 */
const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-muted)] mb-2">
          — Dashboard
        </p>
        <h1
          className="font-display font-semibold text-[var(--text-primary)] leading-[1.05]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          Welcome back,<br />
          {user?.username ?? "—"}.
        </h1>
        <p className="font-mono text-[0.65rem] text-[var(--text-muted)] mt-3 uppercase tracking-[0.1em]">
          Role: <span className="text-accent">{user?.role}</span>
          &nbsp;·&nbsp;
          {user?.email}
        </p>
      </div>

      <button
        onClick={() => logout()}
        disabled={isLoading}
        className={[
          "h-10 px-8 font-mono font-medium text-[0.75rem] uppercase tracking-[0.15em]",
          "border border-[var(--border-col)] rounded-[2px]",
          "text-[var(--text-primary)] bg-transparent",
          "transition-all duration-200 cursor-pointer",
          "hover:border-accent hover:text-accent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {isLoading ? "Signing out…" : "Sign Out"}
      </button>
    </div>
  );
};

export default DashboardPage;
