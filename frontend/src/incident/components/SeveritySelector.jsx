const SeveritySelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* SEV-1 / CRITICAL */}
      <label
        className={[
          "relative flex items-center justify-between w-full py-2 px-3 cursor-pointer transition-all duration-150 rounded-none",
          value === "sev1"
            ? "bg-[#EF4444]/10 border border-[#EF4444] text-[#EF4444]"
            : "bg-transparent border border-[var(--border-col)] text-[var(--text-muted)] hover:bg-[#EF4444]/5",
        ].join(" ")}
        role="radio"
        aria-checked={value === "sev1"}
      >
        <input
          type="radio"
          name="severity"
          value="sev1"
          checked={value === "sev1"}
          onChange={() => onChange("sev1")}
          className="sr-only"
        />
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              value === "sev1" ? "bg-[#EF4444]" : "bg-[var(--border-col)]"
            }`}
          />
          <div className="flex flex-col justify-center">
            <span className={`font-mono font-medium text-[9px] uppercase tracking-widest leading-none mb-0.5 ${value === "sev1" ? "text-[#EF4444]" : "text-[var(--text-muted)]"}`}>
              SEV-1
            </span>
            <span className={`font-mono font-normal text-[8px] leading-none opacity-75 capitalize ${value === "sev1" ? "text-[#EF4444]" : "text-[var(--text-muted)]"}`}>
              Critical
            </span>
          </div>
        </div>
      </label>

      {/* SEV-2 / MODERATE */}
      <label
        className={[
          "relative flex items-center justify-between w-full py-2 px-3 cursor-pointer transition-all duration-150 rounded-none",
          value === "sev2"
            ? "bg-[#F59E0B]/10 border border-[#F59E0B] text-[#F59E0B]"
            : "bg-transparent border border-[var(--border-col)] text-[var(--text-muted)] hover:bg-[#F59E0B]/5",
        ].join(" ")}
        role="radio"
        aria-checked={value === "sev2"}
      >
        <input
          type="radio"
          name="severity"
          value="sev2"
          checked={value === "sev2"}
          onChange={() => onChange("sev2")}
          className="sr-only"
        />
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              value === "sev2" ? "bg-[#F59E0B]" : "bg-[var(--border-col)]"
            }`}
          />
          <div className="flex flex-col justify-center">
            <span className={`font-mono font-medium text-[9px] uppercase tracking-widest leading-none mb-0.5 ${value === "sev2" ? "text-[#F59E0B]" : "text-[var(--text-muted)]"}`}>
              SEV-2
            </span>
            <span className={`font-mono font-normal text-[8px] leading-none opacity-75 capitalize ${value === "sev2" ? "text-[#F59E0B]" : "text-[var(--text-muted)]"}`}>
              Moderate
            </span>
          </div>
        </div>
      </label>

      {/* SEV-3 / LOW */}
      <label
        className={[
          "relative flex items-center justify-between w-full py-2 px-3 cursor-pointer transition-all duration-150 rounded-none",
          value === "sev3"
            ? "bg-[#64748B]/12 border border-[#64748B] text-[#94A3B8]"
            : "bg-transparent border border-[var(--border-col)] text-[var(--text-muted)] hover:bg-[#64748B]/5",
        ].join(" ")}
        role="radio"
        aria-checked={value === "sev3"}
      >
        <input
          type="radio"
          name="severity"
          value="sev3"
          checked={value === "sev3"}
          onChange={() => onChange("sev3")}
          className="sr-only"
        />
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              value === "sev3" ? "bg-[#64748B]" : "bg-[var(--border-col)]"
            }`}
          />
          <div className="flex flex-col justify-center">
            <span className={`font-mono font-medium text-[9px] uppercase tracking-widest leading-none mb-0.5 ${value === "sev3" ? "text-[#94A3B8]" : "text-[var(--text-muted)]"}`}>
              SEV-3
            </span>
            <span className={`font-mono font-normal text-[8px] leading-none opacity-75 capitalize ${value === "sev3" ? "text-[#94A3B8]" : "text-[var(--text-muted)]"}`}>
              Low
            </span>
          </div>
        </div>
      </label>
    </div>
  );
};

export default SeveritySelector;
