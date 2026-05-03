import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  RiLoader4Line, 
  RiCheckDoubleLine, 
  RiSendPlane2Line, 
  RiShieldStarLine,
  RiTimeLine
} from "@remixicon/react";
import incidentService from "../services/incidentService";
import useAuth from "../../auth/hooks/useAuth";
import Navbar from "../../../shared/components/Navbar";

export default function IncidentDetailsPage() {
  const { projectId: routeProjectId, id } = useParams(); // wait, router path is /incidents/:id or /projects/:projectId/incidents/:id? 
  // We will mount this on /incidents/:id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [details, setDetails] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newMessage, setNewMessage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [closeError, setCloseError] = useState("");

  useEffect(() => {
    fetchIncidentData();
  }, [id]);

  const fetchIncidentData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch core incident
      const incRes = await incidentService.getIncident(id);
      if (!incRes.success) throw new Error(incRes.message || "Failed to load incident");
      const currentIncident = incRes.incident;
      setIncident(currentIncident);

      // 2. Always fetch timeline
      const timeRes = await incidentService.getTimeline(id);
      if (timeRes.success) {
        setTimeline(timeRes.timeline);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostTimeline = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const res = await incidentService.addTimelineEntry(id, {
        message: newMessage,
        type: "comment",
      });
      if (res.success) {
        setTimeline((prev) => [...prev, res.timelineEntry]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleCloseClick = () => {
    if (!confirmClose) {
      setConfirmClose(true);
      setCloseError("");
      
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => {
        setConfirmClose(false);
      }, 3000);
      return;
    }
    
    // Execute if already confirming
    executeCloseIncident();
  };

  const executeCloseIncident = async () => {
    setIsClosing(true);
    setConfirmClose(false);
    setCloseError("");
    try {
      const res = await incidentService.closeIncident(id);
      if (res.success) {
        // Switch to resolved state, the timeline will remain and lock
        setIncident((prev) => ({ ...prev, status: "resolved", resolvedAt: new Date() }));
      }
    } catch (err) {
      console.error("Failed to close incident", err);
      setCloseError(err?.response?.data?.message || "Failed to close incident.");
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <RiLoader4Line className="animate-spin text-[var(--accent)]" size={32} />
        </main>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-6 py-4 max-w-lg w-full text-center">
            <span className="font-mono text-[0.75rem] text-[#EF4444] uppercase tracking-widest">{error || "Incident not found"}</span>
          </div>
        </main>
      </div>
    );
  }

  const currentUserId = user?._id || user?.id;
  const isLeader = incident.leader?._id === currentUserId || incident.leader === currentUserId;

  return (
    <div className="h-screen bg-[var(--bg-base)] flex flex-col selection:bg-[var(--accent)] selection:text-[var(--accent-text)] overflow-hidden">
      <Navbar />
      
      <main className="flex-1 min-h-0 w-full flex flex-col md:flex-row border-t border-[var(--border-col)]">
        
        {/* ── LEFT PANE: INCIDENT CONTEXT ────────────────────────────────────────── */}
        <section className="w-full md:w-[45%] lg:w-[40%] flex flex-col border-b md:border-b-0 md:border-r border-[var(--border-col)] bg-[var(--bg-base)] overflow-y-auto scrollbar-hide">
          <div className="p-8 lg:p-12 border-b border-[var(--border-col)]">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider border ${
                incident.status === 'resolved' 
                  ? 'border-green-500/30 text-green-500 bg-green-500/10'
                  : 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-subtle)]'
              }`}>
                {incident.status}
              </span>
              <span className={`px-2 py-1 font-mono text-[0.65rem] uppercase tracking-wider border ${
                incident.severity === 'critical' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                incident.severity === 'high' ? 'border-orange-500/30 text-orange-500 bg-orange-500/10' :
                'border-[var(--border-col)] text-[var(--text-secondary)]'
              }`}>
                {incident.severity} Severity
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] leading-[1.1] tracking-tight mb-6">
              {incident.title}
            </h1>
            
            <div className="prose prose-invert max-w-none font-sans text-[0.95rem] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mb-10">
              {incident.description}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[var(--border-col)]">
              <div>
                <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Project</span>
                <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)]">{incident.projectId?.name || "Unknown"}</span>
              </div>
              <div>
                <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Reported By</span>
                <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)]">{incident.createdBy?.username || "System"}</span>
              </div>
              <div>
                <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Incident Leader</span>
                <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)] flex items-center gap-2">
                  <RiShieldStarLine size={14} className="text-[var(--accent)]" />
                  {incident.leader?.username || "Unassigned"}
                </span>
              </div>
              <div>
                <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Affected Services</span>
                <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)]">
                  {incident.affectedServices?.length > 0 ? incident.affectedServices.join(", ") : "None specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-8 lg:p-12 mt-auto">
            {incident.status !== "resolved" && isLeader ? (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCloseClick}
                  disabled={isClosing}
                  className={`w-full flex items-center justify-center gap-3 h-14 font-mono text-[0.8rem] uppercase tracking-widest font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirmClose 
                      ? "bg-[#EF4444] text-white hover:bg-red-600 scale-[1.02]" 
                      : "bg-[var(--accent)] text-[var(--accent-text)] hover:bg-opacity-90 active:scale-[0.98]"
                  }`}
                >
                  {isClosing ? <RiLoader4Line className="animate-spin" size={18} /> : <RiCheckDoubleLine size={18} />}
                  {isClosing ? "Generating Postmortem..." : confirmClose ? "Click Again To Confirm" : "Close Incident"}
                </button>
                {confirmClose && !isClosing && (
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#EF4444] text-center">
                    AI will immediately begin generating a postmortem. This cannot be undone.
                  </span>
                )}
                {closeError && (
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-[#EF4444] text-center">
                    {closeError}
                  </span>
                )}
              </div>
            ) : incident.status === "resolved" ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 mb-2">
                  <RiCheckDoubleLine className="text-green-400" />
                  <span className="font-mono text-[0.75rem] uppercase tracking-wider text-green-400">Incident Resolved</span>
                </div>
                <button
                  onClick={() => navigate(`/incidents/${id}/report`)}
                  className="w-full flex items-center justify-center gap-3 h-14 bg-[var(--bg-card)] border border-[var(--border-col)] hover:border-[var(--accent)] text-[var(--text-primary)] font-mono text-[0.8rem] uppercase tracking-widest font-bold transition-all duration-200"
                >
                  View Postmortem Report
                </button>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-[var(--border-col)] text-center">
                <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)]">Only the leader can close this incident</span>
              </div>
            )}
          </div>
        </section>

        {/* ── RIGHT PANE: TIMELINE / POSTMORTEM ──────────────────────────────────── */}
        <section className="w-full md:w-[55%] lg:w-[60%] flex flex-col bg-[var(--bg-card)] min-h-0">
          
          {/* TIMELINE VIEW */}
          <div className="flex-1 flex flex-col max-h-full">
            <div className="p-6 lg:px-10 border-b border-[var(--border-col)] bg-[var(--bg-card)] shrink-0 flex items-center gap-3">
              <RiTimeLine className="text-[var(--text-muted)]" size={20} />
              <h2 className="font-mono text-[0.8rem] uppercase tracking-widest text-[var(--text-primary)] font-bold">Timeline & Updates</h2>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 lg:p-10 flex flex-col gap-6">
                {timeline.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="font-mono text-[0.75rem] uppercase tracking-widest text-[var(--text-muted)]">No updates yet. Log the first finding below.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8 relative">
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[var(--border-col)] z-0" />
                    {timeline.map((entry, i) => (
                      <div key={entry._id || i} className="relative z-10 flex gap-6">
                        <div className="w-8 h-8 rounded-none bg-[var(--bg-base)] border border-[var(--border-col)] shrink-0 flex items-center justify-center text-[0.7rem] font-bold font-mono text-[var(--text-primary)] uppercase">
                          {(entry.createdBy?.username || "?").charAt(0)}
                        </div>
                        <div className="flex-1 bg-[var(--bg-base)] border border-[var(--border-col)] p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-sans font-bold text-[0.85rem] text-[var(--text-primary)]">
                              {entry.createdBy?.username || "Unknown"}
                            </span>
                            <span className="font-mono text-[0.65rem] text-[var(--text-muted)]">
                              {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="font-sans text-[0.9rem] text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                            {entry.message}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 lg:px-10 border-t border-[var(--border-col)] bg-[var(--bg-base)] shrink-0">
                {incident.status === 'resolved' ? (
                  <div className="p-6 text-center border border-[var(--border-col)] bg-[var(--bg-card)]">
                    <span className="font-mono text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)]">
                      Incident is resolved. Timeline is locked.
                    </span>
                  </div>
                ) : (
                  <>
                    <form onSubmit={handlePostTimeline} className="relative flex items-end">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Log an update, finding, or action taken..."
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-col)] text-[var(--text-primary)] font-sans text-[0.9rem] p-4 pr-14 resize-none min-h-[80px] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)] rounded-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostTimeline(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={isPosting || !newMessage.trim()}
                        className="absolute right-3 bottom-3 w-8 h-8 bg-[var(--accent)] text-[var(--accent-text)] flex items-center justify-center disabled:opacity-50 transition-transform active:scale-95"
                      >
                        {isPosting ? <RiLoader4Line className="animate-spin" size={16} /> : <RiSendPlane2Line size={16} />}
                      </button>
                    </form>
                    <p className="mt-2 font-mono text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider text-right">Press Enter to send, Shift+Enter for new line</p>
                  </>
                )}
              </div>
            </div>

        </section>
      </main>
    </div>
  );
}
