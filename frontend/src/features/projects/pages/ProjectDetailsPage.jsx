import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import Navbar from "../../../shared/components/Navbar";
import projectService from "../services/projectService";
import incidentService from "../../incidents/services/incidentService";
import AssignMembersModal from "../components/AssignMembersModal";
import EditProjectModal from "../components/EditProjectModal";

// ── Helpers ───────────────────────────────────────────────────
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const SEVERITY_STYLES = {
  critical: "text-[#EF4444] border-[#EF4444] bg-[rgba(239,68,68,0.08)]",
  high:     "text-[#F97316] border-[#F97316] bg-[rgba(249,115,22,0.08)]",
  medium:   "text-[#EAB308] border-[#EAB308] bg-[rgba(234,179,8,0.08)]",
  low:      "text-[var(--text-muted)] border-[var(--border-col)] bg-transparent",
};

const STATUS_STYLES = {
  open:          "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-subtle)]",
  "in-progress": "text-[#F97316] border-[#F97316] bg-[rgba(249,115,22,0.08)]",
  resolved:      "text-[#22C55E] border-[#22C55E] bg-[rgba(34,197,94,0.08)]",
};

const Pill = ({ label, styleClass }) => (
  <span
    className={`font-mono text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 border ${styleClass} leading-none`}
  >
    {label}
  </span>
);

const StatBlock = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
      {label}
    </span>
    <span className="font-display font-bold text-2xl text-[var(--text-primary)] leading-none">
      {value}
    </span>
  </div>
);

// ── Page ──────────────────────────────────────────────────────
const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  /* confirmDelete = true shows the red confirm step; isDeletingProject = true shows loading */
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [deletingProjectError, setDeletingProjectError] = useState("");
  /* tracks which member's remove button is in-flight */
  const [removingMemberId, setRemovingMemberId] = useState(null);

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError("");

      const [projectRes, incidentsRes] = await Promise.all([
        projectService.getProjectById(projectId),
        incidentService.getAllIncidents()
      ]);

      if (projectRes.success) {
        setProject(projectRes.project);
      } else {
        setError(projectRes.message || "Failed to load project details.");
        if (showLoading) setIsLoading(false);
        return;
      }

      if (incidentsRes.success) {
        // Filter incidents for this specific project
        const projectIncidents = (incidentsRes.incidents || []).filter(
          (inc) => inc.projectId?._id === projectId || inc.projectId === projectId
        );
        setIncidents(projectIncidents);
      }

    } catch (err) {
      setError("An error occurred while loading project details.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  /**
   * Fetch project details and all incidents in parallel.
   */
  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  /**
   * Permanently delete the current project then redirect to the projects list.
   */
  const handleDeleteProject = async () => {
    setIsDeletingProject(true);
    setDeletingProjectError("");
    try {
      const res = await projectService.deleteProject(projectId);
      if (res.success) {
        navigate("/projects");
      } else {
        setDeletingProjectError(res.message || "Failed to delete project.");
        setIsDeletingProject(false);
      }
    } catch (err) {
      setDeletingProjectError(err.response?.data?.message || "An unexpected error occurred.");
      setIsDeletingProject(false);
    }
  };

  /**
   * Remove a single member from the project.
   * After a successful API call the backend returns the updated project,
   * so we update local state directly without a full refetch.
   */
  const handleRemoveMember = async (userId) => {
    setRemovingMemberId(userId);
    try {
      const res = await projectService.removeMember(projectId, userId);
      if (res.success) {
        setProject(res.project);
      }
    } catch (err) {
      // silently swallow - the member card will re-enable
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[100vw] h-[100vh] overflow-hidden flex flex-col bg-[var(--bg-base)]">
        <Navbar />
        <div className="flex-1 p-10 flex flex-col gap-6 animate-pulse">
          <div className="h-4 w-24 bg-[var(--border-col)]" />
          <div className="h-12 w-1/3 bg-[var(--border-col)]" />
          <div className="h-20 w-2/3 bg-[var(--border-col)]" />
          <div className="h-[6px] w-full bg-[var(--border-col)] mt-4" />
          <div className="flex gap-10 mt-4">
            <div className="h-16 w-32 bg-[var(--border-col)]" />
            <div className="h-16 w-32 bg-[var(--border-col)]" />
            <div className="h-16 w-32 bg-[var(--border-col)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-[100vw] h-[100vh] overflow-hidden flex flex-col bg-[var(--bg-base)]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-10">
          <div className="bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-6 py-4 flex flex-col items-center gap-3">
            <span className="font-mono text-[0.8rem] text-[#EF4444] uppercase tracking-widest">
              Error
            </span>
            <span className="font-sans text-[0.9rem] text-[var(--text-primary)]">
              {error || "Project not found."}
            </span>
            <button
              onClick={() => navigate("/projects")}
              className="mt-2 h-8 px-4 bg-transparent border border-[#EF4444] text-[#EF4444] font-mono text-[0.65rem] uppercase tracking-wider hover:bg-[#EF4444] hover:text-white transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const openCount     = incidents.filter((i) => i.status === "open").length;
  const activeCount   = incidents.filter((i) => i.status === "in-progress").length;
  const resolvedCount = incidents.filter((i) => i.status === "resolved").length;

  const currentUserId = user?._id || user?.id;
  const isProjectLeader = project.members?.some(
    (m) => m.user?._id === currentUserId && m.role === "leader"
  );
  const canCreateIncident = isAdmin || isProjectLeader;

  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden flex flex-col bg-[var(--bg-base)]">
      <Navbar />

      {/* ── Scrollable body ────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="px-6 md:px-12 lg:px-16 py-10 flex flex-col gap-10">

          {/* ── HEADER ROW ─────────────────────────────────── */}
          <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            <button
              onClick={() => navigate("/projects")}
              className="flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer bg-transparent border-none w-fit"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 1L3 6L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Projects
            </button>

            {/* Title + Main actions */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  — Project
                </p>
                <h1 className="font-display font-bold text-[clamp(1.8rem,3.5vw,2.8rem)] text-[var(--text-primary)] tracking-tight leading-[1.05]">
                  {project.name}
                </h1>
                <p className="font-sans text-[0.88rem] text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                  {project.description}
                </p>

                {/* Admin-only project management buttons */}
                {isAdmin && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => { setConfirmDelete(false); setIsEditModalOpen(true); }}
                      className="h-7 px-3 bg-[var(--bg-card)] border border-[var(--border-col)] text-[var(--text-muted)] font-mono text-[0.6rem] uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200"
                    >
                      Edit
                    </button>
                    {confirmDelete ? (
                      <div className="flex gap-1.5 items-center">
                        {deletingProjectError && (
                          <span className="font-mono text-[0.55rem] text-[#EF4444] uppercase tracking-wider">
                            {deletingProjectError}
                          </span>
                        )}
                        <button
                          onClick={() => setConfirmDelete(false)}
                          disabled={isDeletingProject}
                          className="h-7 px-3 bg-transparent border border-[var(--border-col)] text-[var(--text-muted)] font-mono text-[0.6rem] uppercase tracking-wider hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteProject}
                          disabled={isDeletingProject}
                          className="h-7 px-3 bg-[rgba(239,68,68,0.12)] border border-[#EF4444] text-[#EF4444] font-mono text-[0.6rem] uppercase tracking-wider hover:bg-[#EF4444] hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isDeletingProject ? "Deleting..." : "Confirm"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="h-7 px-3 bg-[rgba(239,68,68,0.08)] border border-[#EF4444] text-[#EF4444] font-mono text-[0.6rem] uppercase tracking-wider hover:bg-[#EF4444] hover:text-white transition-colors duration-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right-side action strip */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {canCreateIncident && (
                  <button
                    onClick={() =>
                      navigate("/incidents/create", {
                        state: {
                          projectId: project._id,
                          projectName: project.name,
                        },
                      })
                    }
                    className="h-9 px-6 bg-accent text-[var(--accent-text)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] border-none rounded-none cursor-pointer transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0"
                  >
                    + Create Incident
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── SUBTLE DIVIDER ─────────────────────────────── */}
          <div className="h-px w-full bg-[var(--border-col)] shrink-0" />

          {/* ── STATS + META ROW ───────────────────────────── */}
          <div className="flex flex-wrap items-start gap-10">
            <StatBlock label="Total Incidents" value={incidents.length} />
            <div className="w-px h-10 bg-[var(--border-col)] self-center" />
            <StatBlock label="Open" value={openCount} />
            <StatBlock label="In Progress" value={activeCount} />
            <StatBlock label="Resolved" value={resolvedCount} />
            <div className="w-px h-10 bg-[var(--border-col)] self-center" />
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Created
              </span>
              <span className="font-mono text-[0.78rem] text-[var(--text-primary)]">
                {formatDate(project.createdAt)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Created By
              </span>
              <span className="font-mono text-[0.78rem] text-[var(--text-primary)]">
                {project.createdBy?.username || "System"}
              </span>
            </div>
          </div>

          {/* ── MEMBERS ────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight">
                Members
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="h-7 px-3 bg-[var(--bg-card)] border border-[var(--border-col)] text-[var(--text-primary)] font-mono text-[0.65rem] uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors duration-200"
                >
                  + Assign Members
                </button>
              )}
            </div>
            
            {project.members?.length === 0 ? (
              <div className="px-4 py-8 border border-dashed border-[var(--border-col)] flex items-center justify-center">
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)]">
                  No members assigned yet
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
              {project.members?.filter(m => m.user != null).map((m) => (
                <div
                  key={m.user._id}
                  className="flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-col)] px-4 py-2.5"
                >
                  {/* Avatar initials */}
                  <div className="w-7 h-7 bg-[var(--accent-subtle)] border border-[var(--accent)] flex items-center justify-center shrink-0">
                    <span className="font-mono text-[0.6rem] uppercase text-[var(--accent)]">
                      {m.user.username?.slice(0, 2) || "??"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-[0.82rem] font-medium text-[var(--text-primary)] leading-none mb-0.5">
                      {m.user?.username || "Unknown"}
                    </span>
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      {m.role}
                    </span>
                  </div>
                  {/* Admin-only: remove member */}
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveMember(m.user._id)}
                      disabled={removingMemberId === m.user._id}
                      title="Remove member"
                      className="ml-2 text-[var(--text-muted)] hover:text-[#EF4444] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {removingMemberId === m.user._id ? (
                        <span className="font-mono text-[0.6rem]">...</span>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>

          {/* ── INCIDENTS LIST ──────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight">
                Active Incidents
              </h2>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {incidents.filter(i => i.status !== "resolved").length} active
              </span>
            </div>

            {/* Table */}
            <div className="w-full border border-[var(--border-col)] bg-[var(--bg-card)]">
              {/* Table head */}
              <div className="grid grid-cols-[1fr_100px_100px_120px] gap-4 px-5 py-2.5 border-b border-[var(--border-col)] bg-[var(--bg-base)]">
                {["Title", "Status", "Severity", "Created"].map((h) => (
                  <span
                    key={h}
                    className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {incidents.filter(i => i.status !== "resolved").length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                    No active incidents
                  </span>
                  <span className="font-sans text-[0.8rem] text-[var(--text-muted)]">
                    Click "+ Create Incident" to log a new one.
                  </span>
                </div>
              ) : (
                incidents.filter(i => i.status !== "resolved").map((incident, idx, arr) => (
                  <div
                    key={incident._id}
                    className={`group grid grid-cols-[1fr_100px_100px_120px] gap-4 items-center px-5 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-[var(--accent-subtle)] ${
                      idx !== arr.length - 1 ? "border-b border-[var(--border-col)]" : ""
                    }`}
                    onClick={() => navigate(`/incidents/${incident._id}`)}
                  >
                    {/* Title */}
                    <span className="font-sans text-[0.85rem] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-150 truncate">
                      {incident.title}
                    </span>

                    {/* Status */}
                    <div className="flex items-center">
                      <Pill
                        label={incident.status}
                        styleClass={STATUS_STYLES[incident.status] ?? ""}
                      />
                    </div>

                    {/* Severity */}
                    <div className="flex items-center">
                      <Pill
                        label={incident.severity}
                        styleClass={SEVERITY_STYLES[incident.severity] ?? ""}
                      />
                    </div>

                    {/* Date */}
                    <span className="font-mono text-[0.7rem] text-[var(--text-muted)] whitespace-nowrap">
                      {formatDate(incident.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── POSTMORTEM REPORTS ──────────────────────────── */}
          <div className="flex flex-col gap-4 mt-8">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight">
                Postmortem Reports
              </h2>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {incidents.filter(i => i.status === "resolved").length} total
              </span>
            </div>

            {/* Table */}
            <div className="w-full border border-[var(--border-col)] bg-[var(--bg-card)]">
              {/* Table head */}
              <div className="grid grid-cols-[1fr_100px_120px] gap-4 px-5 py-2.5 border-b border-[var(--border-col)] bg-[var(--bg-base)]">
                {["Incident Title", "Severity", "Resolved At"].map((h) => (
                  <span
                    key={h}
                    className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-muted)]"
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* Table rows */}
              {incidents.filter(i => i.status === "resolved").length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--text-muted)]">
                    No reports yet
                  </span>
                  <span className="font-sans text-[0.8rem] text-[var(--text-muted)]">
                    Reports are generated when an incident is resolved.
                  </span>
                </div>
              ) : (
                incidents.filter(i => i.status === "resolved").map((incident, idx, arr) => (
                  <div
                    key={incident._id}
                    className={`group grid grid-cols-[1fr_100px_120px] gap-4 items-center px-5 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-[var(--accent-subtle)] ${
                      idx !== arr.length - 1 ? "border-b border-[var(--border-col)]" : ""
                    }`}
                    onClick={() => navigate(`/incidents/${incident._id}/report`)}
                  >
                    {/* Title */}
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-sans text-[0.85rem] font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors duration-150 truncate">
                        {incident.title}
                      </span>
                    </div>

                    {/* Severity */}
                    <div className="flex items-center">
                      <Pill
                        label={incident.severity}
                        styleClass={SEVERITY_STYLES[incident.severity] ?? ""}
                      />
                    </div>

                    {/* Date */}
                    <span className="font-mono text-[0.7rem] text-[var(--text-muted)] whitespace-nowrap">
                      {incident.resolvedAt ? formatDate(incident.resolvedAt) : formatDate(incident.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
      
      {isAdmin && (
        <>
          <AssignMembersModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            projectId={project._id}
            existingMembers={project.members}
            onAssignSuccess={() => fetchData(false)}
          />
          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            project={project}
            onUpdateSuccess={(updated) => setProject(updated)}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
