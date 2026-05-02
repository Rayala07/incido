import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/shared/Navbar";
import SeveritySelector from "../components/SeveritySelector";
import IncidentMemoryPanel from "../components/IncidentMemoryPanel";
import { createIncidentSchema, emailSchema } from "../validation/incidentValidation";

const CreateIncidentPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impactedService, setImpactedService] = useState("");
  const [severity, setSeverity] = useState("");
  
  const [responders, setResponders] = useState([]);
  const [responderInput, setResponderInput] = useState("");
  const [responderError, setResponderError] = useState("");

  const [formErrors, setFormErrors] = useState({});

  const [scanStatus, setScanStatus] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const debounceRef = useRef(null);

  const mockResult = {
    similarIncident: "Database timeout causing API failures — Q3 2024",
    rootCause: "Connection pool exhaustion under high write load",
    potentialFix: "Increase pool size to 50, add circuit breaker on DB writes",
    actionItemStatus: "open",
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    if (!title.trim() && !impactedService.trim()) {
      setScanStatus("idle");
      setScanResult(null);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setScanStatus("loading");

      setTimeout(() => {
        const triggerFound = (title + impactedService).toLowerCase().includes("db") || 
                             (title + impactedService).toLowerCase().includes("database");

        if (triggerFound) {
          setScanStatus("found");
          setScanResult(mockResult);
        } else {
          setScanStatus("not-found");
          setScanResult(null);
        }
      }, 1000); 
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [title, impactedService]);

  const handleDevToggle = (status) => {
    setScanStatus(status);
    if (status === "found") {
      setScanResult(mockResult);
    } else {
      setScanResult(null);
    }
  };

  const handleResponderKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = responderInput.trim().replace(",", "");
      
      if (!email) return;

      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        setResponderError(emailValidation.error.issues[0].message);
        return;
      }

      setResponderError("");
      if (responders.length < 5 && !responders.includes(email)) {
        setResponders(prev => [...prev, email]);
        setResponderInput("");
      } else if (responders.includes(email)) {
        setResponderError("Email already added");
      }
    }
  };

  const removeResponder = (idx) => {
    setResponders(responders.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const formData = {
      title,
      description,
      impactedService,
      severity,
      responders
    };

    const validationResult = createIncidentSchema.safeParse(formData);

    if (!validationResult.success) {
      const fieldErrors = {};
      validationResult.error.issues.forEach(issue => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});
    
    // TODO: POST /api/incidents
    console.log("Validated Form Data:", formData);
  };

  // Helper to render field errors
  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <span className="block mt-0.5 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-[#EF4444] leading-none">
        {error}
      </span>
    );
  };

  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden flex flex-col bg-[var(--bg-base)]">
      <Navbar />
      
      <div className="h-[6px] bg-[var(--divider-stripe)] w-full shrink-0" />

      {/* DEV TOGGLE STRIP */}
      <div className="w-full bg-[var(--bg-card)] border-b border-[var(--border-col)] px-4 py-1.5 flex items-center shrink-0">
        <span className="font-mono text-[9px] uppercase text-[var(--text-muted)] mr-3">
          DEV / PANEL STATE:
        </span>
        <div className="flex gap-4 items-center">
          {["idle", "loading", "found", "not-found"].map((status) => (
            <button 
              key={status}
              type="button"
              onClick={() => handleDevToggle(status)} 
              className={`font-mono text-[9px] uppercase transition-colors duration-150 cursor-pointer ${scanStatus === status ? "text-[var(--accent)] underline underline-offset-2" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >
              {status.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* TWO-COLUMN AREA */}
      <div className="flex-1 overflow-hidden flex flex-row w-full h-full">
        
        {/* LEFT COLUMN: FORM — outer is overflow-hidden so the pinned footer always stays visible */}
        <div className="flex-[0_0_65%] h-full overflow-hidden bg-[var(--bg-base)] border-r border-[var(--border-col)] flex flex-col">

          {/* SCROLLABLE FORM BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide px-7 pt-6 pb-2 flex flex-col">

            <h2 className="font-display font-bold text-xl text-[var(--text-primary)] tracking-[-0.01em] mb-5 shrink-0">
              Incident Details
            </h2>

            {/* FIELD B: TITLE */}
            <div className="w-full mb-4 shrink-0">
              <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                TITLE <span className="text-[#EF4444] ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) setFormErrors({...formErrors, title: null});
                }}
                placeholder="Brief descriptive title..."
                className={`w-full bg-[var(--bg-base)] border ${formErrors.title ? "border-[#EF4444]" : "border-[var(--border-col)]"} rounded-none px-3 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 h-9`}
              />
              <FieldError error={formErrors.title} />
            </div>

            {/* FIELD C: DESCRIPTION */}
            <div className="w-full mb-4 shrink-0">
              <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                DESCRIPTION <span className="text-[#EF4444] ml-0.5">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (formErrors.description) setFormErrors({...formErrors, description: null});
                }}
                placeholder="Detailed description..."
                rows={3}
                className={`w-full bg-[var(--bg-base)] border ${formErrors.description ? "border-[#EF4444]" : "border-[var(--border-col)]"} rounded-none px-3 py-2.5 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 resize-none`}
              />
              <FieldError error={formErrors.description} />
            </div>

            {/* FIELD D: IMPACTED SERVICE + SEVERITY ROW */}
            <div className="flex flex-row items-start gap-5 w-full mb-4 shrink-0">
              
              {/* D-LEFT: IMPACTED SERVICE (~60%) */}
              <div className="flex-[0_0_60%]">
                <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                  IMPACTED SERVICE <span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  value={impactedService}
                  onChange={(e) => {
                    setImpactedService(e.target.value);
                    if (formErrors.impactedService) setFormErrors({...formErrors, impactedService: null});
                  }}
                  placeholder="e.g. auth-service, payment-api"
                  className={`w-full bg-[var(--bg-base)] border ${formErrors.impactedService ? "border-[#EF4444]" : "border-[var(--border-col)]"} rounded-none px-3 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 h-9`}
                />
                <FieldError error={formErrors.impactedService} />
              </div>
              
              {/* D-RIGHT: SEVERITY (~40% minus gap) */}
              <div className="flex-1">
                <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                  SEVERITY <span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <div className="flex flex-col gap-1">
                  <SeveritySelector 
                    value={severity} 
                    onChange={(val) => {
                      setSeverity(val);
                      if (formErrors.severity) setFormErrors({...formErrors, severity: null});
                    }} 
                  />
                </div>
                <FieldError error={formErrors.severity} />
              </div>

            </div>

            {/* FIELD E: ASSIGN RESPONDERS */}
            <div className="w-full shrink-0">
              <div className="flex justify-between items-baseline mb-1.5">
                <label className="block font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                  ASSIGN RESPONDERS <span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <span className="font-mono text-[0.55rem] text-[var(--text-muted)] opacity-60">
                  Upto 5 only
                </span>
              </div>
              
              <input
                type="text"
                value={responderInput}
                onChange={(e) => {
                  setResponderInput(e.target.value);
                  if (responderError) setResponderError("");
                }}
                onKeyDown={handleResponderKeyDown}
                placeholder={responders.length >= 5 ? "Maximum 5 responders reached" : "Enter email and press Enter or , to add"}
                disabled={responders.length >= 5}
                className={`w-full h-9 bg-[var(--bg-base)] border ${responderError ? "border-[#EF4444]" : "border-[var(--border-col)]"} rounded-none px-3 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
              />
              <FieldError error={responderError} />
              <FieldError error={formErrors.responders} />
              
              {responders.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  {responders.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-[rgba(26,63,212,0.08)] border border-[rgba(26,63,212,0.22)] px-3 py-1.5 rounded-none">
                      <span className="font-sans text-[0.75rem] text-[var(--text-secondary)]">
                        {r}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => removeResponder(i)} 
                        className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[#EF4444] transition-colors duration-150 cursor-pointer border-none bg-transparent pl-3"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>{/* END SCROLLABLE FORM BODY */}

          {/* PINNED FOOTER — always anchored to the bottom, never scrolls away */}
          <div className="shrink-0 bg-[var(--bg-base)]">
            <div className="h-[6px] bg-[var(--divider-stripe)] w-full" />
            <div className="flex justify-end px-7 py-3">
              <button
                onClick={handleSubmit}
                className="h-9 bg-accent text-[var(--accent-text)] px-7 rounded-none cursor-pointer font-mono text-[0.72rem] uppercase tracking-[0.15em] font-medium border-none transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0"
              >
                CREATE INCIDENT
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI PANEL */}
        <div className="flex-[0_0_35%] h-full overflow-y-auto bg-[var(--bg-card)] flex flex-col">
          <IncidentMemoryPanel 
            status={scanStatus} 
            result={scanResult} 
          />
        </div>

      </div>
    </div>
  );
};

export default CreateIncidentPage;
