import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiLoader4Line,
  RiDownloadLine,
} from "@remixicon/react";
import incidentService from "../services/incidentService";

export default function PostmortemReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [incident, setIncident] = useState(null);
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await incidentService.downloadPostmortemPDF(id);
      const safeName = incident?.title
        ? incident.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
        : id;
      const filename = `postmortem-${safeName}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <RiLoader4Line className="animate-spin text-[var(--text-muted)]" size={32} />
      </div>
    );
  }

  /* ── Error ── */
  if (error || !incident || !details) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500 px-6 py-4 max-w-lg w-full text-center">
          <span className="font-mono text-[0.75rem] text-red-500 uppercase tracking-widest">{error || "Report not found"}</span>
        </div>
        <button
          onClick={() => navigate(`/incidents/${id}`)}
          className="mt-6 font-mono text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border-col)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          Return to Incident
        </button>
      </div>
    );
  }

  /* ── Helpers ── */
  const severityColor =
    incident.severity === "critical" ? "#dc2626" :
    incident.severity === "high" ? "#ea580c" :
    incident.severity === "medium" ? "#d97706" : "#2563eb";

  const resolvedDate = incident.resolvedAt
    ? new Date(incident.resolvedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

  const createdDate = new Date(incident.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">

      {/* ═══ TOP BAR ═══════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 bg-[var(--bg-card)] border-b border-[var(--border-col)] px-6 lg:px-10 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(`/incidents/${id}`)}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group cursor-pointer"
        >
          <RiArrowLeftLine size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[0.68rem] uppercase tracking-widest">Back to Incident</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2 border border-[var(--border-col)] text-[var(--text-secondary)] font-mono text-[0.65rem] uppercase tracking-widest hover:border-[var(--text-primary)] hover:text-[var(--text-primary)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isDownloading
            ? <RiLoader4Line size={14} className="animate-spin" />
            : <RiDownloadLine size={14} />}
          {isDownloading ? "Generating..." : "Download Report"}
        </button>
      </div>

      {/* ═══ VIEWER SHELL ══════════════════════════════════════════════ */}
      <div className="flex-1 flex justify-center py-10 lg:py-14 px-4">

        {/* ── PAPER DOCUMENT ────────────────────────────────────────── 
             Always white bg + dark text — this is a PDF-style document,
             independent of the app's light/dark mode.
        ──────────────────────────────────────────────────────────────── */}
        <div
          className="w-full max-w-[820px] border shadow-2xl"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#1f2937",
          }}
        >
          <div className="px-10 py-14 md:px-16 md:py-20">

            {/* ── DOCUMENT HEADER ── */}
            <header className="mb-16">
              {/* Badge */}
              <div
                className="inline-block px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] mb-8"
                style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: "#f3f4f6", color: "#059669", borderRadius: "2px" }}
              >
                AI Postmortem Report
              </div>

              {/* Title */}
              <h1
                className="text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-[1.15] mb-10"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#111827", letterSpacing: "-0.01em" }}
              >
                {incident.title}
              </h1>

              {/* Meta grid */}
              <div
                className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5 pt-6"
                style={{ borderTop: "1px solid #e5e7eb" }}
              >
                <div>
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>
                    Severity
                  </div>
                  <div className="text-[0.88rem] font-medium capitalize" style={{ fontFamily: "'DM Sans', sans-serif", color: severityColor }}>
                    {incident.severity}
                  </div>
                </div>
                <div>
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>
                    Created
                  </div>
                  <div className="text-[0.88rem] font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                    {createdDate}
                  </div>
                </div>
                <div>
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>
                    Resolved
                  </div>
                  <div className="text-[0.88rem] font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                    {resolvedDate}
                  </div>
                </div>
                <div>
                  <div className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>
                    Lead
                  </div>
                  <div className="text-[0.88rem] font-medium" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                    {incident.leader?.username || "System"}
                  </div>
                </div>
              </div>
            </header>

            {/* ── REPORT BODY ── */}
            <div className="flex flex-col gap-12">

              {/* Section 01 */}
              <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: "28px" }}>
                <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] mb-5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6b7280" }}>
                  [ 01 ] &nbsp; What Happened
                </h2>
                <div className="text-[0.95rem] md:text-[1.05rem] leading-[1.75] whitespace-pre-wrap" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                  {details.whatHappened}
                </div>
              </section>

              {/* Section 02 */}
              <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: "28px" }}>
                <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] mb-5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#dc2626" }}>
                  [ 02 ] &nbsp; Root Cause Analysis
                </h2>
                <div className="text-[0.95rem] md:text-[1.05rem] leading-[1.75] whitespace-pre-wrap" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                  {details.whyItHappened}
                </div>
              </section>

              {/* Section 03 */}
              <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: "28px" }}>
                <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] mb-5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#16a34a" }}>
                  [ 03 ] &nbsp; Immediate Resolution
                </h2>
                <div className="text-[0.95rem] md:text-[1.05rem] leading-[1.75] whitespace-pre-wrap" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                  {details.howItWasFixed}
                </div>
              </section>

              {/* Section 04 – Action Items */}
              {details.actionItems && details.actionItems.length > 0 && (
                <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: "28px" }}>
                  <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] mb-6" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#d97706" }}>
                    [ 04 ] &nbsp; Preventative Action Items
                  </h2>
                  <div className="flex flex-col gap-3">
                    {details.actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-5"
                        style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px" }}
                      >
                        <div
                          className="shrink-0 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em]"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", backgroundColor: "#f3f4f6", color: "#059669", border: "1px solid #e5e7eb", borderRadius: "2px" }}
                        >
                          ACT_{(idx + 1).toString().padStart(2, "0")}
                        </div>
                        <p className="text-[0.92rem] leading-[1.7]" style={{ fontFamily: "'DM Sans', sans-serif", color: "#374151" }}>
                          {item.task}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Affected Services */}
              {incident.affectedServices && incident.affectedServices.length > 0 && (
                <section style={{ borderTop: "1px solid #e5e7eb", paddingTop: "28px" }}>
                  <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] mb-5" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6b7280" }}>
                    Affected Services
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedServices.map((svc, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-[0.72rem] font-medium"
                        style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: "2px" }}
                      >
                        {svc}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── DOCUMENT FOOTER ── */}
            <footer className="mt-20 pt-6 text-center" style={{ borderTop: "1px solid #e5e7eb" }}>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em]" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9ca3af" }}>
                Analyzed &amp; Synthesized by INCIDO-AI
              </p>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
}
