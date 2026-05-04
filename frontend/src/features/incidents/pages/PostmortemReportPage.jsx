import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  RiArrowLeftLine, 
  RiLoader4Line
} from "@remixicon/react";
import incidentService from "../services/incidentService";

export default function PostmortemReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const incRes = await incidentService.getIncident(id);
      if (!incRes.success) throw new Error("Failed to load incident");
      setIncident(incRes.incident);

      const detRes = await incidentService.getIncidentDetails(id);
      if (detRes.success && detRes.details) {
        setDetails(detRes.details);
      } else {
        throw new Error("Postmortem details not found");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-[var(--text-muted)]" size={32} />
      </div>
    );
  }

  if (error || !incident || !details) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500 px-6 py-4 max-w-lg w-full text-center">
          <span className="font-mono text-[0.75rem] text-red-500 uppercase tracking-widest">{error || "Report not found"}</span>
        </div>
        <button
          onClick={() => navigate(`/incidents/${id}`)}
          className="mt-6 font-mono text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-col)] hover:text-[var(--text-primary)] transition-colors"
        >
          Return to Incident
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] selection:bg-[var(--accent)] selection:text-[var(--accent-text)] pb-24 font-sans">
      {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-col)] px-6 lg:px-12 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/incidents/${id}`)}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
        >
          <RiArrowLeftLine size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[0.7rem] uppercase tracking-widest mt-0.5">Back to Incident</span>
        </button>
        <div className="font-display font-bold tracking-widest uppercase text-sm text-[var(--text-muted)]">
          INCIDO
        </div>
      </div>

      {/* ── A4 DOCUMENT CONTAINER ───────────────────────────────────────── */}
      <main className="max-w-[850px] mx-auto bg-[var(--bg-card)] border border-[var(--border-col)] shadow-2xl mt-12 lg:mt-16 relative">
        <div className="px-8 py-12 md:px-16 md:py-20 flex flex-col">
        
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-[0.75rem] text-[var(--accent)] uppercase tracking-[0.2em] border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-3 py-1">
              AI POSTMORTEM
            </span>
          </div>
          
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] mb-8 text-[var(--text-primary)]">
            {incident.title}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-[var(--border-col)]">
            <div>
              <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Severity</span>
              <span className={`font-sans font-medium text-[0.9rem] capitalize ${
                incident.severity === 'critical' ? 'text-red-500' :
                incident.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
              }`}>{incident.severity}</span>
            </div>
            <div>
              <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Resolved At</span>
              <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)]">
                {incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}
              </span>
            </div>
            <div>
              <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Lead Responder</span>
              <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)]">{incident.leader?.username || "System"}</span>
            </div>
            <div>
              <span className="block font-mono text-[0.65rem] uppercase tracking-widest text-[var(--text-muted)] mb-2">Affected Services</span>
              <span className="font-sans font-medium text-[0.9rem] text-[var(--text-primary)]">
                {incident.affectedServices?.length > 0 ? incident.affectedServices.join(", ") : "None specified"}
              </span>
            </div>
          </div>
        </header>

        {/* ── REPORT BODY ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-12 lg:gap-16 mt-8">
          
          {/* SECTION 1: WHAT HAPPENED */}
          <section className="border-t border-[var(--border-col)] pt-8 lg:pt-12">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6">
              [ 01 ] &nbsp; What Happened
            </h2>
            <div className="font-sans text-[1rem] md:text-[1.1rem] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {details.whatHappened}
            </div>
          </section>

          {/* SECTION 2: WHY IT HAPPENED */}
          <section className="border-t border-[var(--border-col)] pt-8 lg:pt-12">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-red-500 mb-6">
              [ 02 ] &nbsp; Root Cause Analysis
            </h2>
            <div className="font-sans text-[1rem] md:text-[1.1rem] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {details.whyItHappened}
            </div>
          </section>

          {/* SECTION 3: HOW IT WAS FIXED */}
          <section className="border-t border-[var(--border-col)] pt-8 lg:pt-12">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-green-500 mb-6">
              [ 03 ] &nbsp; Immediate Resolution
            </h2>
            <div className="font-sans text-[1rem] md:text-[1.1rem] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {details.howItWasFixed}
            </div>
          </section>

          {/* SECTION 4: ACTION ITEMS */}
          {details.actionItems && details.actionItems.length > 0 && (
            <section className="border-t border-[var(--border-col)] pt-8 lg:pt-12">
              <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-amber-500 mb-8">
                [ 04 ] &nbsp; Preventative Action Items
              </h2>
              <div className="flex flex-col gap-3">
                {details.actionItems.map((item, idx) => (
                  <div key={idx} className="bg-[var(--bg-base)] border border-[var(--border-col)] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-[var(--accent)] transition-colors">
                    <div className="shrink-0 px-2 py-1 border border-[var(--border-col)] bg-[var(--accent-subtle)]">
                      <span className="font-mono text-[0.65rem] text-[var(--accent)] uppercase tracking-widest">ACT_{(idx + 1).toString().padStart(2, '0')}</span>
                    </div>
                    <p className="font-sans text-[0.95rem] md:text-[1.05rem] text-[var(--text-primary)] leading-relaxed">
                      {item.task}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="mt-24 pt-10 border-t border-[var(--border-col)] flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-8 h-8 bg-[var(--text-primary)] text-[var(--bg-base)] flex items-center justify-center rounded-sm rotate-45 mb-2">
            <span className="font-display font-bold text-lg -rotate-45 block leading-none select-none">/</span>
          </div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-[var(--text-muted)]">
            Synthesized & Analyzed by
          </p>
          <p className="font-display font-bold text-xl text-[var(--text-primary)] tracking-widest">
            INCIDO
          </p>
        </footer>

        </div>
      </main>
    </div>
  );
}
