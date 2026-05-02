import React from "react";

const IncidentMemoryPanel = ({ status, result }) => {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-card)] rounded-none">
      {/* TOP SECTION (flex-shrink: 0) */}
      <div className="flex justify-between items-center shrink-0 px-5 pt-5 pb-4">
        <span className="font-mono uppercase text-[10px] tracking-widest text-[var(--text-secondary)]">
          Incident Memory Scan
        </span>
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            status === "idle"
              ? "bg-[var(--border-col)]"
              : status === "loading"
              ? "bg-[#F59E0B] animate-pulse"
              : status === "found"
              ? "bg-[#EF4444]"
              : "bg-[#22C55E]"
          }`}
        />
      </div>
      
      <div className="border-b border-[var(--border-col)] w-full shrink-0" />

      {/* MIDDLE SECTION (flex: 1, overflow-y: auto) */}
      <div className="flex-1 flex flex-col relative overflow-y-auto px-5 py-4">
        {status === "idle" && (
          <div className="flex-1 flex flex-col items-center justify-center h-full gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--text-muted)] opacity-35"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            <p className="font-mono text-[11px] text-[var(--text-muted)] text-center max-w-[180px] leading-relaxed mx-auto">
              AI will scan for similar past incidents as you type...
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col p-4">
            <div className="flex flex-col gap-3">
              <div
                className="h-2.5 w-3/4 rounded-none animate-shimmer"
                style={{
                  backgroundImage: "linear-gradient(90deg, var(--border-col) 0%, rgba(26,63,212,0.15) 50%, var(--border-col) 100%)",
                }}
              />
              <div
                className="h-2.5 w-full rounded-none animate-shimmer"
                style={{
                  backgroundImage: "linear-gradient(90deg, var(--border-col) 0%, rgba(26,63,212,0.15) 50%, var(--border-col) 100%)",
                }}
              />
              <div
                className="h-2.5 w-1/2 rounded-none animate-shimmer"
                style={{
                  backgroundImage: "linear-gradient(90deg, var(--border-col) 0%, rgba(26,63,212,0.15) 50%, var(--border-col) 100%)",
                }}
              />
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)] animate-pulse mt-4">
              Scanning past incidents...
            </span>
          </div>
        )}

        {status === "found" && result && (
          <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/30 rounded-none p-4">
            <div className="flex items-center gap-2 mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#F59E0B]">
                Similar Incident Found
              </span>
            </div>
            
            <div className="border-b border-[#F59E0B]/20 w-full mb-3" />

            <div className="flex flex-col">
              <div className="mb-3">
                <span className="block font-mono text-[8px] uppercase tracking-widest text-[rgba(245,158,11,0.60)] mb-1">
                  Similar Incident
                </span>
                <span className="block font-sans text-[12px] text-[var(--text-primary)]">
                  {result.similarIncident}
                </span>
              </div>

              <div className="mb-3">
                <span className="block font-mono text-[8px] uppercase tracking-widest text-[rgba(245,158,11,0.60)] mb-1">
                  Root Cause
                </span>
                <span className="block font-sans text-[12px] text-[var(--text-primary)]">
                  {result.rootCause}
                </span>
              </div>

              <div className="mb-3">
                <span className="block font-mono text-[8px] uppercase tracking-widest text-[rgba(245,158,11,0.60)] mb-1">
                  Potential Fix
                </span>
                <span className="block font-sans text-[12px] text-[var(--text-primary)]">
                  {result.potentialFix}
                </span>
              </div>

              <div>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-[rgba(245,158,11,0.60)] mb-1">
                  Action Status
                </span>
                <div className="mt-1">
                  {result.actionItemStatus === "open" ? (
                    <span className="inline-block bg-[#EF4444]/10 border border-[#EF4444]/35 text-[#EF4444] font-mono text-[8px] uppercase px-2 py-0.5 rounded-none">
                      Open
                    </span>
                  ) : (
                    <span className="inline-block bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] font-mono text-[8px] uppercase px-2 py-0.5 rounded-none">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {status === "not-found" && (
          <div className="bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-none p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22C55E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#22C55E]">
                No Similar Incidents Found
              </span>
            </div>
            <p className="font-sans text-[11px] text-[var(--text-muted)] mt-1">
              This incident appears to be new.
            </p>
          </div>
        )}
      </div>

      {/* PANEL FOOTER (flex-shrink: 0, mt-auto) */}
      <div className="shrink-0 mt-auto px-5 pb-5 pt-3">
        <div className="h-[6px] bg-[var(--divider-stripe)] w-full mb-4" />
      </div>

    </div>
  );
};

export default IncidentMemoryPanel;
