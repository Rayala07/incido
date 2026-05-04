import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  RiLoader4Line,
  RiArrowRightLine,
  RiSearchLine,
  RiFilterLine,
  RiShieldFlashLine,
  RiCheckLine,
  RiAlertLine,
  RiTimeLine,
} from "@remixicon/react";
import incidentService from "../services/incidentService";
import useAuth from "../../auth/hooks/useAuth";
import Navbar from "../../../shared/components/Navbar";

/* ─── Helpers ──────────────────────────────────────────────────────── */
const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m || 1}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const fmtDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

/* ─── Static maps ─────────────────────────────────────────────────── */
const SEVERITY_CLASSES = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high:     "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium:   "bg-amber-500/10 text-amber-500 border-amber-500/20",
  low:      "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const STATUS_CLASSES = {
  open:        "bg-red-500/10 text-red-500 border-red-500/20",
  "in-progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  resolved:    "bg-green-500/10 text-green-500 border-green-500/20",
};

const STATUS_ICONS = {
  open:        <RiAlertLine size={11} />,
  "in-progress": <RiTimeLine size={11} />,
  resolved:    <RiCheckLine size={11} />,
};

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/* ─── StatusPill ─────────────────────────────────────────────────── */
const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[0.58rem] font-mono uppercase tracking-widest border rounded-[1px] ${
      STATUS_CLASSES[status] || STATUS_CLASSES.open
    }`}
  >
    {STATUS_ICONS[status]}
    {status}
  </span>
);

/* ─── SeverityBadge ──────────────────────────────────────────────── */
const SeverityBadge = ({ severity }) => {
  const SEV_NUM = { critical: "1", high: "2", medium: "3", low: "4" };
  return (
    <span
      className={`px-2 py-0.5 text-[0.58rem] font-mono uppercase border rounded-[1px] ${
        SEVERITY_CLASSES[severity] || SEVERITY_CLASSES.medium
      }`}
    >
      SEV-{SEV_NUM[severity] || "4"}
    </span>
  );
};

/* ─── Stat tile ──────────────────────────────────────────────────── */
const StatTile = ({ icon: Icon, label, count, colorClass }) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-col)] p-5 flex items-center gap-4">
    <div className={`p-2 rounded-none border ${colorClass} bg-current/5`}>
      <Icon size={16} className={colorClass.replace("border-", "text-").split(" ")[0]} />
    </div>
    <div>
      <p className="font-display font-bold text-2xl text-[var(--text-primary)] leading-none">
        {count}
      </p>
      <p className="font-mono text-[0.58rem] uppercase tracking-widest text-[var(--text-muted)] mt-0.5">
        {label}
      </p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   IncidentListPage
═══════════════════════════════════════════════════════════════════ */
const IncidentListPage = () => {
  const { user } = useAuth();
  const platformRole = user?.role || "responder";

  const [incidents, setIncidents] = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  /* ── Filters ── */
  const [search,      setSearch]      = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [sortBy,      setSortBy]      = useState("newest");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [incRes] = await Promise.all([
          incidentService.getAllIncidents(),
        ]);
        setIncidents(incRes.incidents || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load incidents.");
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  /* ── Derive effective role ── */
  const isLeaderOfAny = (projects) =>
    projects.some((p) =>
      p.members?.some((m) => m.user?._id === user?._id && m.role === "leader")
    );

  const effectiveRole =
    platformRole === "admin" ? "admin" : "responder"; // leader is UI-derived from project membership

  /* ── Stats ── */
  const totalCount    = incidents.length;
  const openCount     = incidents.filter((i) => i.status === "open").length;
  const inProgCount   = incidents.filter((i) => i.status === "in-progress").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  /* ── Filtered + sorted list ── */
  const displayed = useMemo(() => {
    let list = [...incidents];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.projectId?.name?.toLowerCase().includes(q) ||
          i.severity?.toLowerCase().includes(q) ||
          i.status?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all")   list = list.filter((i) => i.status === filterStatus);
    if (filterSeverity !== "all") list = list.filter((i) => i.severity === filterSeverity);

    list.sort((a, b) => {
      if (sortBy === "newest")   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "severity") return (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9);
      return 0;
    });

    return list;
  }, [incidents, search, filterStatus, filterSeverity, sortBy]);

  /* ── Role label for page header ── */
  const roleLabel =
    platformRole === "admin"
      ? "Viewing all incidents across every team and project."
      : "Viewing incidents you are assigned to or belong to your projects.";

  /* ── Loading ── */
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

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <Navbar />

      <main className="flex-1 w-full px-6 md:px-12 lg:px-16 py-10">
        <div className="w-full flex flex-col gap-8">

          {/* ── Page Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="block font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                Incidents
              </span>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-[var(--text-primary)] tracking-tight mb-1">
                Incident Tracker
              </h1>
              <p className="font-sans text-[0.85rem] text-[var(--text-muted)]">{roleLabel}</p>
            </div>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="bg-red-500/8 border border-red-500 px-5 py-3 font-mono text-[0.65rem] text-red-500 uppercase tracking-wider">
              {error}
            </div>
          )}

          {/* ── Stat Tiles ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile icon={RiShieldFlashLine} label="Total"       count={totalCount}    colorClass="border-[var(--accent)] text-[var(--accent)]" />
            <StatTile icon={RiAlertLine}       label="Open"        count={openCount}     colorClass="border-red-500 text-red-500" />
            <StatTile icon={RiTimeLine}        label="In Progress" count={inProgCount}   colorClass="border-amber-500 text-amber-500" />
            <StatTile icon={RiCheckLine}       label="Resolved"    count={resolvedCount} colorClass="border-green-500 text-green-500" />
          </div>

          {/* ── Filter Bar ── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <RiSearchLine
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, project, status..."
                className="w-full h-9 bg-[var(--bg-card)] border border-[var(--border-col)] pl-8 pr-3 font-sans text-[0.82rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.10)] transition-colors"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-muted)]">
              <RiFilterLine size={12} />
              {["all", "open", "in-progress", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                    filterStatus === s
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                      : "border-[var(--border-col)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  {s === "all" ? "All Status" : s}
                </button>
              ))}
            </div>

            {/* Severity filter */}
            <div className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-muted)]">
              {["all", "critical", "high", "medium", "low"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-2.5 py-1 border transition-colors cursor-pointer ${
                    filterSeverity === s
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]"
                      : "border-[var(--border-col)] text-[var(--text-muted)] hover:border-[var(--text-secondary)]"
                  }`}
                >
                  {s === "all" ? "All Sev" : s}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 bg-[var(--bg-card)] border border-[var(--border-col)] px-3 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] cursor-pointer transition-colors auth-select pr-8"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="severity">By Severity</option>
            </select>
          </div>

          {/* ── Table ── */}
          <div className="w-full">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-[var(--border-col)] mb-0">
              {["Title", "Project", "Status", "Severity", "Created", ""].map((col) => (
                <span key={col} className="font-mono text-[0.55rem] uppercase tracking-widest text-[var(--text-muted)]">
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {displayed.length === 0 ? (
              <div className="w-full py-20 flex flex-col items-center justify-center border border-dashed border-[var(--border-col)]">
                <RiShieldFlashLine size={28} className="text-[var(--border-col)] mb-3" />
                <span className="font-mono text-[0.72rem] uppercase tracking-widest text-[var(--text-muted)]">
                  {search || filterStatus !== "all" || filterSeverity !== "all"
                    ? "No incidents match your filters."
                    : "No incidents found."}
                </span>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--border-col)] border border-[var(--border-col)]">
                {displayed.map((inc) => (
                  <Link
                    key={inc._id}
                    to={`/incidents/${inc._id}`}
                    className="group hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 bg-[var(--bg-card)] hover:bg-[var(--accent-subtle)] hover:border-[var(--accent)] transition-colors items-center"
                  >
                    {/* Title */}
                    <div className="min-w-0">
                      <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate block">
                        {inc.title}
                      </span>
                      {inc.affectedServices?.length > 0 && (
                        <span className="font-mono text-[0.58rem] uppercase tracking-wider text-[var(--text-muted)] truncate block mt-0.5">
                          {inc.affectedServices.slice(0, 2).join(", ")}
                        </span>
                      )}
                    </div>
                    {/* Project */}
                    <span className="font-mono text-[0.65rem] uppercase tracking-wider text-[var(--text-secondary)] truncate">
                      {inc.projectId?.name || "—"}
                    </span>
                    {/* Status */}
                    <div><StatusPill status={inc.status} /></div>
                    {/* Severity */}
                    <div><SeverityBadge severity={inc.severity} /></div>
                    {/* Created */}
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--text-muted)]">
                      {timeAgo(inc.createdAt)}
                    </span>
                    {/* Arrow */}
                    <RiArrowRightLine
                      size={14}
                      className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                ))}

                {/* Mobile card rows */}
                {displayed.map((inc) => (
                  <Link
                    key={`m-${inc._id}`}
                    to={`/incidents/${inc._id}`}
                    className="group flex flex-col gap-3 px-5 py-4 bg-[var(--bg-card)] hover:bg-[var(--accent-subtle)] transition-colors md:hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug flex-1">
                        {inc.title}
                      </span>
                      <RiArrowRightLine size={14} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusPill status={inc.status} />
                      <SeverityBadge severity={inc.severity} />
                      {inc.projectId?.name && (
                        <span className="font-mono text-[0.58rem] uppercase tracking-wider text-[var(--text-muted)]">
                          {inc.projectId.name}
                        </span>
                      )}
                      <span className="font-mono text-[0.58rem] uppercase tracking-wider text-[var(--text-muted)] ml-auto">
                        {timeAgo(inc.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Count footer */}
            {displayed.length > 0 && (
              <div className="mt-3 flex justify-end">
                <span className="font-mono text-[0.58rem] uppercase tracking-widest text-[var(--text-muted)]">
                  Showing {displayed.length} of {totalCount} incidents
                </span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default IncidentListPage;
