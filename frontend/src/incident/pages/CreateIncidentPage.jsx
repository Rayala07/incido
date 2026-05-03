import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/shared/Navbar";
import SeveritySelector from "../components/SeveritySelector";
import IncidentMemoryPanel from "../components/IncidentMemoryPanel";
import { createIncidentSchema } from "../validation/incidentValidation";
import incidentService from "../services/incidentService";
import authService from "../../auth/services/authService";

const CreateIncidentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Silently capture project context passed via navigate(..., { state })
  const projectId   = location.state?.projectId   ?? null;
  const projectName = location.state?.projectName ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impactedService, setImpactedService] = useState("");
  const [severity, setSeverity] = useState("");
  
  // responders — each entry: { email, username }
  // Verification is done async on Enter/comma against the project membership endpoint.
  const [responders, setResponders] = useState([]);
  const [responderInput, setResponderInput] = useState("");
  const [responderError, setResponderError] = useState("");
  const [isVerifyingResponder, setIsVerifyingResponder] = useState(false);

  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [scanStatus, setScanStatus] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const debounceRef = useRef(null);

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
          setScanResult({
            similarIncident: "Database timeout causing API failures — Q3 2024",
            rootCause: "Connection pool exhaustion under high write load",
            potentialFix: "Increase pool size to 50, add circuit breaker on DB writes",
            actionItemStatus: "open",
          });
        } else {
          setScanStatus("not-found");
          setScanResult(null);
        }
      }, 1000); 
    }, 800);

    return () => clearTimeout(debounceRef.current);
  }, [title, impactedService]);

  /**
   * Async responder add.
   * On Enter or comma: validate format, then call the backend to confirm the
   * email belongs to a project member (any role). Only add to the list if valid.
   */
  const handleResponderKeyDown = async (e) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();

    const email = responderInput.trim().replace(",", "").toLowerCase();
    if (!email) return;

    // Basic format check first
    const { emailSchema } = await import("../validation/incidentValidation");
    const fmt = emailSchema.safeParse(email);
    if (!fmt.success) {
      setResponderError(fmt.error.issues[0].message);
      return;
    }

    if (responders.some((r) => r.email === email)) {
      setResponderError("This email is already in the responders list.");
      return;
    }

    if (responders.length >= 5) {
      setResponderError("Maximum 5 responders allowed.");
      return;
    }

    if (!projectId) {
      setResponderError("No project context — cannot verify membership.");
      return;
    }

    setResponderError("");
    setIsVerifyingResponder(true);

    try {
      const res = await authService.verifyResponderEmail(email, projectId);
      if (res.success) {
        setResponders((prev) => [
          ...prev,
          { email: res.user.email, username: res.user.username },
        ]);
        setResponderInput("");
      }
    } catch (err) {
      setResponderError(
        err.response?.data?.message || "Failed to verify this email."
      );
    } finally {
      setIsVerifyingResponder(false);
    }
  };

  const removeResponder = (email) => {
    setResponders((prev) => prev.filter((r) => r.email !== email));
  };

  /**
   * Handle the form submission to create an incident.
   */
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError("");
    
    const formData = {
      title,
      description,
      impactedService,
      severity,
      projectId,
      responders: responders.map((r) => r.email),
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

    if (!projectId) {
      setApiError("Project Context Missing. Cannot create incident without a project ID.");
      return;
    }

    setFormErrors({});
    
    try {
      setIsSubmitting(true);
      const affectedServices = impactedService ? [impactedService] : [];
      
      const data = await incidentService.createIncident({
        title,
        description,
        projectId,
        severity: severity || undefined,
        affectedServices,
        // Send the verified responder emails for the backend to resolve
        responderEmails: responders.map((r) => r.email),
      });

      if (data.success) {
        navigate(`/projects/${projectId}`);
      } else {
        setApiError(data.message || "Failed to create incident.");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "An unexpected error occurred.";
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* TWO-COLUMN AREA */}
      <div className="flex-1 overflow-hidden flex flex-row w-full h-full">
        
        {/* LEFT COLUMN: FORM — outer is overflow-hidden so the pinned footer always stays visible */}
        <div className="flex-[0_0_65%] h-full overflow-hidden bg-[var(--bg-base)] border-r border-[var(--border-col)] flex flex-col">

          {/* SCROLLABLE FORM BODY */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide px-7 pt-6 pb-2 flex flex-col">

            <h2 className="font-display font-bold text-xl text-[var(--text-primary)] tracking-[-0.01em] mb-1 shrink-0">
              Incident Details
            </h2>

            {/* Project context badge — visible only when navigated from a project */}
            {projectId && (
              <div className="flex items-center gap-2 mb-5 shrink-0">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Assigning to project:
                </span>
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--accent)] border border-[var(--accent)] bg-[var(--accent-subtle)] px-2 py-0.5 leading-none">
                  {projectName ?? projectId}
                </span>
              </div>
            )}
            {!projectId && <div className="mb-5" />}

            {/* Display API Errors */}
            {apiError && (
              <div className="w-full bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-3 py-2 mb-5 font-mono text-[0.65rem] text-[#EF4444] uppercase tracking-wider leading-relaxed">
                {apiError}
              </div>
            )}

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
                  ASSIGN RESPONDERS
                </label>
                <span className="font-mono text-[0.55rem] text-[var(--text-muted)] opacity-60">
                  Project members only · up to 5
                </span>
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  value={responderInput}
                  onChange={(e) => {
                    setResponderInput(e.target.value);
                    if (responderError) setResponderError("");
                  }}
                  onKeyDown={handleResponderKeyDown}
                  placeholder={
                    responders.length >= 5
                      ? "Maximum 5 responders reached"
                      : isVerifyingResponder
                      ? "Verifying..."
                      : "Enter email and press Enter to add"
                  }
                  disabled={responders.length >= 5 || isVerifyingResponder}
                  className={`w-full h-9 bg-[var(--bg-base)] border ${
                    responderError ? "border-[#EF4444]" : "border-[var(--border-col)]"
                  } rounded-none px-3 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed`}
                />
                {isVerifyingResponder && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.55rem] uppercase tracking-wider text-[var(--accent)]">
                    Checking...
                  </span>
                )}
              </div>
              <FieldError error={responderError} />
              <FieldError error={formErrors.responders} />
              
              {responders.length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  {responders.map((r) => (
                    <div
                      key={r.email}
                      className="flex items-center justify-between bg-[rgba(26,63,212,0.08)] border border-[rgba(26,63,212,0.22)] px-3 py-1.5 rounded-none"
                    >
                      <div className="flex flex-col">
                        <span className="font-sans text-[0.75rem] font-medium text-[var(--text-primary)] leading-none mb-0.5">
                          {r.username}
                        </span>
                        <span className="font-mono text-[0.58rem] text-[var(--text-muted)]">
                          {r.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeResponder(r.email)}
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
                disabled={isSubmitting}
                className="h-9 bg-accent text-[var(--accent-text)] px-7 rounded-none cursor-pointer font-mono text-[0.72rem] uppercase tracking-[0.15em] font-medium border-none transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? "CREATING..." : "CREATE INCIDENT"}
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
