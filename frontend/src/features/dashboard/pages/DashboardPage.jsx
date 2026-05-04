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

/* ─── ActionItemCard ───────────────────────────────────────── */
const ActionItemCard = ({ item, onResolved }) => {
  const [confirmState, setConfirmState] = useState("idle"); // idle | confirming | resolving

  const handleResolveClick = () => {
    if (confirmState === "idle") {
      setConfirmState("confirming");
      setTimeout(() => {
        setConfirmState((prev) => (prev === "confirming" ? "idle" : prev));
      }, 5000);
    } else if (confirmState === "confirming") {
      resolveItem();
    }
  };

  const resolveItem = async () => {
    setConfirmState("resolving");
    try {
      const res = await incidentService.resolveActionItem(item.incidentId, item._id);
      if (res.success) {
        onResolved(item._id);
      } else {
        setConfirmState("idle");
      }
    } catch (error) {
      console.error("Failed to resolve action item:", error);
      setConfirmState("idle");
    }
  };

  // Mock IDs to match the reference UI style
  const shortActId = `ACT_${item._id.slice(-3).toUpperCase()}`;
  const shortIncId = `INC_${item.incidentId.slice(-3).toUpperCase()}`;

  // Severity specific colors for the left bar and badge
  const isCritical = item.incidentSeverity === "critical" || item.incidentSeverity === "high";
  const barColor = isCritical ? "bg-[#EF4444]" : "bg-[#EAB308]";
  const badgeColor = isCritical 
    ? "bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[rgba(239,68,68,0.3)]" 
    : "bg-[rgba(234,179,8,0.15)] text-[#EAB308] border-[rgba(234,179,8,0.3)]";

  return (
    <div className="relative bg-[var(--bg-card)] border border-[var(--border-col)] rounded-md flex flex-col group overflow-hidden">
      {/* Left thick colored bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${barColor}`} />

      <div className="p-4 pl-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
        
        {/* Left Content */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider border rounded-[3px] ${badgeColor}`}>
              {shortActId}
            </span>
            <h4 className="font-sans font-bold text-[1.05rem] text-[var(--text-primary)] leading-tight">
              {item.task}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Mock overdue/added */}
            <div className="flex items-center gap-1.5 text-[#EF4444] font-sans font-medium text-[0.75rem]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
              Overdue 14d
            </div>
            
            <span className="flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border-col)] rounded text-[var(--text-secondary)] font-sans text-[0.75rem]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              {item.projectName || "Platform"}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 border border-[var(--border-col)] rounded text-[var(--text-secondary)] font-sans text-[0.75rem]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {item.owner || "Unassigned"}
            </span>

            <span className={`px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider border rounded-[3px] ${badgeColor}`}>
              {item.incidentSeverity}
            </span>

            <span className="px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider border border-[var(--border-col)] bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)] text-[var(--text-primary)] rounded-[3px]">
              {item.status}
            </span>
          </div>
        </div>

        {/* Right Content (Button & Meta) */}
        <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
          <button
            onClick={handleResolveClick}
            disabled={confirmState === "resolving"}
            className={`px-4 py-1.5 border rounded-[4px] font-sans text-[0.85rem] font-medium flex items-center gap-2 transition-colors duration-200 ${
              confirmState === "confirming"
                ? "bg-[#22C55E] border-[#22C55E] text-white"
                : "bg-transparent border-[var(--border-col)] text-[var(--text-primary)] hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)]"
            } disabled:opacity-50`}
          >
            {confirmState === "idle" && (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Resolve
              </>
            )}
            {confirmState === "confirming" && "Click to Confirm"}
            {confirmState === "resolving" && "Resolving..."}
          </button>
          <span className="font-sans text-[0.7rem] text-[var(--text-muted)] text-right w-full">
            Added 14d ago
          </span>
        </div>
      </div>

      {/* Bottom Footer Row */}
      <div className="px-6 py-2.5 bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)] border-t border-[var(--border-col)]">
        <span className="font-mono text-[0.65rem] text-[var(--text-muted)]">
          From incident: <span className="font-mono text-[var(--text-secondary)]">{shortIncId} — {item.incidentTitle}</span> · Closed 14d ago
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DashboardPage
═══════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { user } = useAuth();
  const platformRole = user?.role || "responder";
  const userId = uid(user); // "abc123" — works with both _id and id fields

  const [incidents,    setIncidents]    = useState([]);
  const [projects,     setProjects]     = useState([]);
  const [users,        setUsers]        = useState([]);
  const [actionItems,  setActionItems]  = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    document.documentElement.classList.add("scrollbar-hide");
    return () => document.documentElement.classList.remove("scrollbar-hide");
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [incRes, projRes, actRes] = await Promise.all([
          incidentService.getAllIncidents(),
          projectService.getAllProjects(),
          incidentService.getActionItems(),
        ]);
        setIncidents(incRes.incidents    || []);
        setProjects(projRes.projects     || []);
        setActionItems(actRes.actionItems || []);

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
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
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
    admin:     { banner: "ADMINISTRATIVE ACCESS — VIEWING GLOBAL NUMBERS ACROSS ALL TEAMS", activeTitle: "ACTIVE INCIDENTS",   projTitle: "ALL PROJECTS",       actionTitle: "OPEN ACTION ITEMS — PLATFORM WIDE" },
    leader:    { banner: "LEADER VIEW — SCOPED TO MANAGED PROJECTS",                        activeTitle: "ACTIVE INCIDENTS",   projTitle: "PROJECTS YOU LEAD", actionTitle: "OPEN ACTION ITEMS — YOUR PROJECTS" },
    responder: { banner: "RESPONDER WORKSPACE — INDIVIDUAL SCOPE",                          activeTitle: "ASSIGNED TO ME",     projTitle: "MY PROJECTS",       actionTitle: "OPEN ACTION ITEMS — ASSIGNED TO ME" },
  };
  const ui = config[role] || config.responder;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full px-6 md:px-12 lg:px-16 py-10">
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

          {/* ── Open Action Items ── */}
          <div>
            <SectionHeader
              title={ui.actionTitle}
              action={
                actionItems.length > 0 && (
                  <span className="font-mono text-[0.6rem] uppercase tracking-widest text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5">
                    {actionItems.length} OPEN
                  </span>
                )
              }
            />
            {actionItems.length === 0 ? (
              <EmptyState message="No open action items — all clear." />
            ) : (
              <div className="flex flex-col gap-3">
                {actionItems.slice(0, 8).map((item) => (
                  <ActionItemCard 
                    key={item._id} 
                    item={item} 
                    onResolved={(id) => setActionItems(prev => prev.filter(a => a._id !== id))} 
                  />
                ))}
              </div>
            )}
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
