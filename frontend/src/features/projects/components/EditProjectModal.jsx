import React, { useState, useEffect, useRef } from "react";
import { animate } from "motion";
import projectService from "../services/projectService";

/**
 * EditProjectModal
 *
 * Allows an Admin to update a project's name and description.
 * Both fields are pre-populated with the current project data so the admin
 * only needs to change what they want.
 *
 * Props:
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - project: { _id, name, description }   the current project data to pre-fill
 *  - onUpdateSuccess: (updatedProject) => void   called with the fresh project on save
 */
const EditProjectModal = ({ isOpen, onClose, project, onUpdateSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const nameInputRef = useRef(null);

  /* Tracks whether the modal was already open — prevents re-running the
     entry animation when `project` prop changes mid-open (which caused the flicker). */
  const wasOpen = useRef(false);

  /* Entry animation — only fires when isOpen transitions false → true */
  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      wasOpen.current = true;

      if (backdropRef.current && modalRef.current) {
        animate(backdropRef.current, { opacity: [0, 1] }, { duration: 0.2 });
        animate(
          modalRef.current,
          { opacity: [0, 1], y: [10, 0], scale: [0.98, 1] },
          { duration: 0.3, easing: [0.16, 1, 0.3, 1] }
        );
      }

      setTimeout(() => nameInputRef.current?.focus(), 300);
    }

    if (!isOpen) {
      wasOpen.current = false;
    }
  }, [isOpen]);

  /* Pre-fill inputs whenever the modal opens or project data refreshes.
     Deliberately NOT running animations here.
     Also resets isSubmitting as a safety net in case a prior session leaked state. */
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setNameError("");
      setApiError("");
      setIsSubmitting(false);
    }
  }, [isOpen, project]);


  /* --- Close: fire animation, reset all transient state, then close --- */
  const handleClose = (force = false) => {
    if (isSubmitting && !force) return;

    // Always reset submission state so the modal opens clean next time
    setIsSubmitting(false);
    setApiError("");

    if (backdropRef.current) {
      animate(backdropRef.current, { opacity: 0 }, { duration: 0.18 });
    }
    if (modalRef.current) {
      animate(
        modalRef.current,
        { opacity: 0, y: 10, scale: 0.98 },
        { duration: 0.18 }
      );
    }

    // Close after the animation finishes — never blocks
    setTimeout(() => onClose(), 200);
  };

  /* Escape key support */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  /* Client-side validation before hitting the backend */
  const validate = () => {
    if (!name.trim()) {
      setNameError("Project name is required.");
      return false;
    }
    if (name.trim().length < 3) {
      setNameError("Project name must be at least 3 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError("");
    setIsSubmitting(true);

    try {
      const res = await projectService.updateProject(project._id, {
        name: name.trim(),
        description: description.trim(),
      });

      if (res.success) {
        onUpdateSuccess(res.project);
        handleClose(true); // fire-and-forget — never awaited
      } else {
        setApiError(res.message || "Failed to update project.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message || "An unexpected error occurred."
      );
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={handleClose}
      />

      {/* Modal */}
      <form
        ref={modalRef}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="relative w-[90%] max-w-md bg-[var(--bg-card)] border border-[var(--border-col)] flex flex-col shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-col)] bg-[var(--bg-base)]">
          <h2
            id="edit-modal-title"
            className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight"
          >
            Edit Project
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          {/* API Error */}
          {apiError && (
            <div className="w-full bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-3 py-2 font-mono text-[0.65rem] text-[#EF4444] uppercase tracking-wider">
              {apiError}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-project-name"
              className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]"
            >
              Project Name
            </label>
            <input
              id="edit-project-name"
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              maxLength={100}
              className="w-full h-9 bg-[var(--bg-base)] border border-[var(--border-col)] px-3 font-sans text-[0.85rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors rounded-none"
            />
            {nameError && (
              <span className="font-mono text-[0.55rem] uppercase tracking-wider text-[#EF4444]">
                {nameError}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-project-desc"
              className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]"
            >
              Description <span className="normal-case tracking-normal text-[var(--text-muted)]">(optional)</span>
            </label>
            <textarea
              id="edit-project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-col)] px-3 py-2 font-sans text-[0.85rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors rounded-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-col)] bg-[var(--bg-base)] flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9 px-5 bg-transparent text-[var(--text-secondary)] font-mono text-[0.72rem] uppercase tracking-[0.15em] border border-transparent hover:border-[var(--border-col)] hover:text-[var(--text-primary)] transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-6 bg-accent text-[var(--accent-text)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] border-none rounded-none cursor-pointer transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProjectModal;
