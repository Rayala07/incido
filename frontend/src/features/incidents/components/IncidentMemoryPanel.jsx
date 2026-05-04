import React from "react";
import { Link } from "react-router-dom";

// ── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const SeverityPip = ({ severity }) => {
  const colors = {
    low:      "bg-blue-400",
    medium:   "bg-amber-400",
    high:     "bg-orange-400",
    critical: "bg-red-500",
  };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-[3px] ${colors[severity] || "bg-gray-400"}`}
    />
  );
};

const ConfidenceBadge = ({ confidence }) => {
  const map = {
    high:   "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/5",
    medium: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/5",
    low:    "text-[var(--text-muted)] border-[var(--border-col)] bg-transparent",
  };
  return (
    <span
      className={`font-mono text-[8px] uppercase tracking-widest border px-1.5 py-0.5 ${map[confidence] || map.low}`}
    >
      {confidence} confidence
    </span>
  );
};

// ── Panel ─────────────────────────────────────────────────────────────────────

const IncidentMemoryPanel = ({ status, result }) => {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-none">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center shrink-0 px-5 pt-5 pb-4">
        <span className="font-mono uppercase text-[10px] tracking-widest text-[var(--text-secondary)]">
          AI Scan — Past Incidents
        </span>
        <div
          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            status === "idle"
              ? "bg-[var(--border-col)]"
              : status === "loading"
              ? "bg-[#F59E0B] animate-pulse"
              : status === "found"
              ? "bg-[#EF4444] animate-pulse"
              : "bg-[#22C55E]"
          }`}
        />
      </div>

      <div className="border-b border-[var(--border-col)] w-full shrink-0" />

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative overflow-y-auto scrollbar-hide px-5 py-4">

        {/* IDLE */}
        {status === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
            <p className="font-mono text-[10px] text-[var(--text-muted)] text-center max-w-[200px] leading-relaxed mx-auto uppercase tracking-wider">
              Type a title or description to scan for similar past incidents
            </p>
          </div>
        )}

        {/* LOADING */}
        {status === "loading" && (
          <div className="flex flex-col gap-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div
                  className={`h-2 rounded-none animate-shimmer ${i === 0 ? "w-3/4" : i === 1 ? "w-full" : "w-1/2"}`}
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, var(--border-col) 0%, rgba(26,63,212,0.15) 50%, var(--border-col) 100%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            ))}
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] animate-pulse mt-3">
              Scanning RAG memory...
            </span>
          </div>
        )}

        {/* FOUND — Real API response */}
        {status === "found" && result && (
          <div className="flex flex-col gap-5">

            {/* ── Summary row: match count + confidence ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse shrink-0" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#EF4444]">
                  {result.matchCount} similar incident{result.matchCount !== 1 ? "s" : ""} found
                </span>
              </div>
              <ConfidenceBadge confidence={result.confidence} />
            </div>

            {/* ── Recurring warning ── */}
            {result.recurring && result.recurringMessage && (
              <div className="flex items-start gap-2 bg-[#F59E0B]/5 border border-[#F59E0B]/25 px-3 py-2.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                  viewBox="0 0 24 24" fill="none" stroke="#F59E0B"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 mt-[2px]"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" /><path d="M12 17h.01" />
                </svg>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#F59E0B] leading-relaxed">
                  {result.recurringMessage} — this is a recurring pattern
                </span>
              </div>
            )}

            {/* ── Insight ── */}
            {result.insight && (
              <div>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                  Pattern Insight
                </span>
                <p className="font-sans text-[11px] text-[var(--text-primary)] leading-relaxed">
                  {result.insight}
                </p>
              </div>
            )}

            {/* ── Divider ── */}
            <div className="border-b border-[var(--border-col)] w-full" />

            {/* ── Matched incidents list ── */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-muted)]">
                Matched Incidents
              </span>
              {result.results.map((item) => (
                <Link
                  key={item.incidentId}
                  to={`/incidents/${item.incidentId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-1.5 bg-[var(--bg-base)] border border-[var(--border-col)] px-3 py-2.5 hover:border-[var(--accent)] transition-colors duration-150"
                >
                  {/* Title + severity */}
                  <div className="flex items-start gap-2">
                    <SeverityPip severity={item.severity} />
                    <span className="font-sans text-[12px] font-medium text-[var(--text-primary)] group-hover:text-accent transition-colors leading-snug">
                      {item.title}
                    </span>
                  </div>

                  {/* Meta row: project · status · time */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.projectName && (
                      <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-muted)]">
                        {item.projectName}
                      </span>
                    )}
                    <span className="font-mono text-[8px] text-[var(--border-col)]">·</span>
                    <span
                      className={`font-mono text-[8px] uppercase tracking-widest ${
                        item.status === "resolved" ? "text-[#22C55E]" : "text-[#EF4444]"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="font-mono text-[8px] text-[var(--border-col)]">·</span>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--text-muted)]">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>

                  {/* Similarity label + AI reason */}
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[var(--accent)] shrink-0">
                      {item.similarityLabel}
                    </span>
                    {item.reason && item.reason !== item.similarityLabel && (
                      <>
                        <span className="font-mono text-[8px] text-[var(--border-col)]">—</span>
                        <span className="font-sans text-[10px] text-[var(--text-muted)] leading-snug">
                          {item.reason}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* ── Suggested fixes ── */}
            {result.suggestedFixes && result.suggestedFixes.length > 0 && (
              <div>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-[var(--text-muted)] mb-2">
                  Suggested Fixes from History
                </span>
                <ul className="flex flex-col gap-1.5">
                  {result.suggestedFixes.map((fix, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-[8px] text-[var(--accent)] shrink-0 mt-[2px]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-sans text-[11px] text-[var(--text-primary)] leading-snug">
                        {fix}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

        {/* NOT FOUND — new pattern */}
        {status === "not-found" && (
          <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-none p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                viewBox="0 0 24 24" fill="none" stroke="#22C55E"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#22C55E]">
                No Similar Incidents Found
              </span>
            </div>
            <p className="font-sans text-[11px] text-[var(--text-muted)] mt-1 leading-relaxed">
              This appears to be a new pattern. Document it carefully — your incident report will help future teams.
            </p>
          </div>
        )}

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 mt-auto px-5 pb-5 pt-3">
        <div className="h-[6px] bg-[var(--divider-stripe)] w-full mb-4" />
      </div>

    </div>
  );
};

export default IncidentMemoryPanel;
