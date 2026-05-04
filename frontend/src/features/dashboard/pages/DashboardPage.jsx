import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import incidentService from "../../incidents/services/incidentService";
import projectService from "../../projects/services/projectService";
import authService from "../../auth/services/authService";
import { RiArrowRightLine, RiLoader4Line } from "@remixicon/react";
import Navbar from "../../../shared/components/Navbar";

/* ─── Helpers ──────────────────────────────────────────────── */
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/**
 * Safely get the string ID from a user-like object.
 * Handles both Mongoose populated docs (_id) and our getMe response (id).
 */
const uid = (obj) => (obj?._id || obj?.id || "").toString();

/* ─── StatBox ──────────────────────────────────────────────── */
const StatBox = ({ label, count, sub, valueColor }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-col)] p-7 rounded-none flex flex-col justify-between h-[130px]">
    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
      {label}
    </span>
    <div>
      <div className={`text-4xl font-display font-bold ${valueColor}`}>{count}</div>
      <div className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] mt-1">{sub}</div>
    </div>
  </div>
);

/* ─── SeverityBadge ────────────────────────────────────────── */
const SeverityBadge = ({ severity }) => {
  const map = {
    low:      "bg-blue-500/10 text-blue-500 border-blue-500/20",
    medium:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high:     "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  const cls = map[severity] || map.medium;
  const num = severity === "critical" ? "1" : severity === "high" ? "2" : severity === "medium" ? "3" : "4";
  return (
    <span className={`px-2 py-0.5 text-[0.6rem] font-mono uppercase border rounded-[1px] ${cls}`}>
      SEV-{num}
    </span>
  );
};

/* ─── Section Header ───────────────────────────────────────── */
const SectionHeader = ({ title, action }) => (
  <div className="flex justify-between items-center pb-3 border-b border-[var(--border-col)] mb-6">
    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
      {title}
    </span>
    {action}
  </div>
);

/* ─── Empty State ──────────────────────────────────────────── */
const EmptyState = ({ message }) => (
  <div className="w-full py-16 flex items-center justify-center border border-dashed border-[var(--border-col)]">
    <span className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)]">
      {message}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   DashboardPage
═══════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { user } = useAuth();
  const platformRole = user?.role || "responder";
  const userId = uid(user); // "abc123" — works with both _id and id fields

  const [incidents, setIncidents] = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    document.body.classList.add("scrollbar-hide");
    return () => document.body.classList.remove("scrollbar-hide");
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [incRes, projRes] = await Promise.all([
          incidentService.getAllIncidents(),
          projectService.getAllProjects(),
        ]);
        setIncidents(incRes.incidents || []);
        setProjects(projRes.projects  || []);

        if (platformRole === "admin") {
          const usrRes = await authService.getAllUsers();
          setUsers(usrRes.users || []);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user, platformRole]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RiLoader4Line className="animate-spin text-[var(--text-muted)]" size={32} />
        </div>
      </div>
    );
  }

  /* ── Derive effective role ──
     Platform roles: "admin" | "responder"
     Display roles:  "admin" | "leader" | "responder"
     "leader" is determined by checking project membership
  */
  const isLeaderOfAny = projects.some(p =>
    p.members?.some(m => uid(m.user) === userId && m.role === "leader")
  );
  const role =
    platformRole === "admin" ? "admin" :
    isLeaderOfAny            ? "leader" :
                               "responder";

  /* ── Helper: is the current user involved in a given incident? ── */
  const isInvolvedIn = (inc) => {
    // Check if user is the leader of this incident
    if (uid(inc.leader) === userId) return true;
    // Check if user is a member of this incident
    if (inc.members?.some(m => uid(m) === userId)) return true;
    // Check if user created this incident
    if (uid(inc.createdBy) === userId) return true;
    return false;
  };

  /* ── Stats ──
     - Admin: counts ALL incidents (no scoping)
     - Leader: counts ALL incidents returned by API (already project-scoped by backend)
     - Responder: counts only incidents the user is directly involved in
     - Resolved count: NO time window — total resolved, not "this week"
  */
  let activeCount = 0;
  let resolvedCount = 0;
  let totalResMs = 0;

  incidents.forEach(inc => {
    const countThis = role === "responder" ? isInvolvedIn(inc) : true;
    if (!countThis) return;

    if (inc.status !== "resolved") {
      activeCount++;
    } else {
      resolvedCount++;
      const created  = new Date(inc.createdAt);
      const resolved = inc.resolvedAt ? new Date(inc.resolvedAt) : new Date(inc.updatedAt);
      totalResMs += resolved.getTime() - created.getTime();
    }
  });

  // MTTR = mean time to resolution (only if we have resolved incidents)
  const avgResMinutes = resolvedCount > 0 ? Math.round(totalResMs / resolvedCount / 60000) : 0;

  // Human-readable MTTR
  const mttrLabel = (() => {
    if (resolvedCount === 0) return "No data";
    if (avgResMinutes < 60) return `${avgResMinutes} min avg MTTR`;
    if (avgResMinutes < 1440) return `${Math.round(avgResMinutes / 60)} hr avg MTTR`;
    return `${Math.round(avgResMinutes / 1440)} day avg MTTR`;
  })();

  /* ── Active incidents list (for the card section) ── */
  const activeIncidentsList = incidents.filter(inc => {
    if (inc.status === "resolved") return false;
    if (role === "responder") return isInvolvedIn(inc);
    return true;
  });

  /* ── Role config ── */
  const config = {
    admin:     { banner: "ADMINISTRATIVE ACCESS — VIEWING GLOBAL NUMBERS ACROSS ALL TEAMS", activeTitle: "ACTIVE INCIDENTS", projTitle: "ALL PROJECTS" },
    leader:    { banner: "LEADER VIEW — SCOPED TO MANAGED PROJECTS",                        activeTitle: "ACTIVE INCIDENTS", projTitle: "PROJECTS YOU LEAD" },
    responder: { banner: "RESPONDER WORKSPACE — INDIVIDUAL SCOPE",                          activeTitle: "ASSIGNED TO ME",   projTitle: "MY PROJECTS" },
  };
  const ui = config[role] || config.responder;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 w-full px-6 md:px-12 lg:px-16 py-10 overflow-y-auto scrollbar-hide">
        <div className="w-full flex flex-col gap-10">

          {/* ── Page Header ── */}
          <div>
            <span className="block font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
              Dashboard
            </span>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight mb-2">
              Hello, {user?.username}
            </h1>
            <p className="font-sans text-[0.85rem] text-[var(--text-muted)]">
              {role.toUpperCase()} · {user?.email}
            </p>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatBox
              label="ACTIVE"
              count={activeCount}
              sub={role === "admin" ? "Global incidents" : role === "leader" ? "In your projects" : "Needs attention"}
              valueColor="text-red-500"
            />
            <StatBox
              label="RESOLVED"
              count={resolvedCount}
              sub={mttrLabel}
              valueColor="text-green-500"
            />
            {role === "admin" && (
              <StatBox
                label="USERS"
                count={users.length}
                sub={`Across ${projects.length} projects`}
                valueColor="text-[var(--accent)]"
              />
            )}
          </div>

          {/* ── Role Banner ── */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-col)] px-7 py-4 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              {ui.banner}
            </span>
          </div>

          {/* ── Active Incidents ── */}
          <div>
            <SectionHeader
              title={ui.activeTitle}
              action={
                <Link
                  to="/incidents"
                  className="font-mono text-[0.65rem] uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1.5 transition-colors"
                >
                  View All <RiArrowRightLine size={13} />
                </Link>
              }
            />
            <div className="flex flex-col gap-3">
              {activeIncidentsList.length === 0 ? (
                <EmptyState message="No active incidents detected." />
              ) : (
                activeIncidentsList.slice(0, 5).map(inc => (
                  <Link
                    key={inc._id}
                    to={`/incidents/${inc._id}`}
                    className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[var(--bg-card)] border border-[var(--border-col)] rounded-none hover:border-[var(--accent)] transition-colors gap-4 group"
                  >
                    <div className="flex items-center gap-4">
                      <SeverityBadge severity={inc.severity} />
                      <span className="font-sans font-medium text-[0.95rem] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {inc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 md:justify-end">
                      <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--text-muted)] hidden md:block">
                        {inc.projectId?.name}
                      </span>
                      <span className="font-mono text-[0.65rem] uppercase text-[var(--text-muted)]">
                        {timeAgo(inc.createdAt)}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[0.6rem] uppercase font-mono tracking-widest border rounded-[1px] ${
                        inc.status === "open"        ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        inc.status === "in-progress" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                       "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ── Projects ── */}
          <div>
            <SectionHeader
              title={ui.projTitle}
              action={
                role === "admin" && (
                  <Link
                    to="/projects"
                    className="font-mono text-[0.65rem] uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1.5 transition-colors"
                  >
                    Manage <RiArrowRightLine size={13} />
                  </Link>
                )
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState message="No projects registered." />
                </div>
              ) : (
                projects.slice(0, 6).map(proj => {
                  const projIncs  = incidents.filter(i => uid(i.projectId) === uid(proj));
                  const pActive   = projIncs.filter(i => i.status !== "resolved").length;
                  const pResolved = projIncs.filter(i => i.status === "resolved").length;
                  const leader    = proj.members?.find(m => m.role === "leader")?.user?.username || "—";

                  return (
                    <Link
                      key={proj._id}
                      to={`/projects/${proj._id}`}
                      className="group block p-7 bg-[var(--bg-card)] border border-[var(--border-col)] rounded-none hover:border-[var(--accent)] hover:shadow-[0_0_0_1px_var(--accent)] transition-all duration-200"
                    >
                      <h3 className="font-display font-bold text-xl text-[var(--text-primary)] group-hover:text-[var(--accent)] tracking-tight transition-colors mb-2">
                        {proj.name}
                      </h3>
                      <p className="font-sans text-[0.8rem] text-[var(--text-muted)] mb-5">
                        LDR: {leader} · {proj.members?.length || 0} members
                      </p>
                      <div className="flex items-center gap-4 font-mono text-[0.65rem] uppercase tracking-widest">
                        <span className="text-[var(--text-secondary)]">
                          <span className="text-red-500">{pActive}</span> Active
                        </span>
                        <span className="text-[var(--border-col)]">/</span>
                        <span className="text-[var(--text-secondary)]">
                          <span className="text-green-500">{pResolved}</span> Resolved
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Users (Admin only) ── */}
          {role === "admin" && (
            <div>
              <SectionHeader
                title="RECENT USERS"
                action={
                  <Link
                    to="#"
                    className="font-mono text-[0.65rem] uppercase tracking-widest text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1.5 transition-colors"
                  >
                    Manage <RiArrowRightLine size={13} />
                  </Link>
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.slice(0, 6).map(u => (
                  <div
                    key={u._id}
                    className="flex items-center justify-between p-5 bg-[var(--bg-card)] border border-[var(--border-col)] rounded-none hover:border-[var(--accent)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 flex items-center justify-center bg-[var(--accent-subtle)] border border-[var(--border-col)] font-mono text-[0.75rem] text-[var(--accent)] shrink-0">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)] leading-none mb-0.5">
                          {u.username}
                        </p>
                        <p className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[0.6rem] font-mono uppercase tracking-widest border rounded-[1px] ${
                      u.role === "admin" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                          "bg-blue-500/10 text-blue-500 border-blue-500/20"
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
