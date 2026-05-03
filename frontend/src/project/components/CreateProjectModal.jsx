import React, { useState, useEffect, useRef } from "react";
import { animate } from "motion";
import { createProjectSchema } from "../validation/projectValidation";
import projectService from "../services/projectService";

const CreateProjectModal = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const titleInputRef = useRef(null);

  // Focus trap refs
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Enter animation
      if (backdropRef.current) {
        animate(backdropRef.current, { opacity: [0, 1] }, { duration: 0.2, easing: "ease-out" });
      }
      if (modalRef.current) {
        animate(modalRef.current, {
          opacity: [0, 1],
          scale: [0.95, 1],
          y: [10, 0],
        }, {
          duration: 0.2,
          easing: "ease-out"
        });
      }
      
      // Auto-focus title
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 50);

      // Lock body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = async () => {
    if (isAnimatingOut) return;
    setIsAnimatingOut(true);

    const animPromises = [];

    if (modalRef.current) {
      animPromises.push(
        animate(modalRef.current, {
          opacity: [1, 0],
          scale: [1, 0.95],
          y: [0, 10],
        }, {
          duration: 0.15,
          easing: "ease-in"
        }).finished
      );
    }
    
    if (backdropRef.current) {
      animPromises.push(
        animate(backdropRef.current, { opacity: [1, 0] }, { duration: 0.2, easing: "ease-out" }).finished
      );
    }

    if (animPromises.length > 0) {
      await Promise.all(animPromises);
    }

    // Reset state back to default
    setTitle("");
    setDescription("");
    setErrors({});
    setApiError("");
    setIsAnimatingOut(false);
    onClose();
  };

  /**
   * Handle the form submission.
   * First validates the inputs locally using Zod, then sends the data to the backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    // 1. Validate form fields locally
    const result = createProjectSchema.safeParse({ title, description });
    
    if (!result.success) {
      const flatErrors = result.error.flatten().fieldErrors;
      const fieldErrors = {};
      if (flatErrors.title) fieldErrors.title = flatErrors.title[0];
      if (flatErrors.description) fieldErrors.description = flatErrors.description[0];
      
      setErrors(fieldErrors);
      return;
    }

    // 2. Call the backend API to create the project
    try {
      setIsSubmitting(true);
      const data = await projectService.createProject({
        name: title.trim(),
        description: description.trim(),
      });

      if (data.success) {
        // 3. If successful, notify the parent component and close the modal
        onCreate(data.project);
        await handleClose();
      } else {
        // Backend returned an error (e.g., project already exists)
        setApiError(data.message || "Failed to create project.");
      }
    } catch (err) {
      // 4. Handle unexpected errors (e.g., network issues, 403 Forbidden)
      const errorMsg = err.response?.data?.message || "An error occurred while creating the project.";
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isAnimatingOut) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAnimatingOut]);

  // Handle Focus Trap
  useEffect(() => {
    const handleFocusTrap = (e) => {
      if (e.key === "Tab" && isOpen) {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableRef.current) {
            e.preventDefault();
            lastFocusableRef.current?.focus();
          }
        } else {
          if (document.activeElement === lastFocusableRef.current) {
            e.preventDefault();
            firstFocusableRef.current?.focus();
          }
        }
      }
    };
    window.addEventListener("keydown", handleFocusTrap);
    return () => window.removeEventListener("keydown", handleFocusTrap);
  }, [isOpen]);

  if (!isOpen && !isAnimatingOut) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-md mx-4 bg-[var(--bg-card)] border border-[var(--border-col)] shadow-2xl flex flex-col pointer-events-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--border-col)]">
          <h2 id="modal-title" className="font-display font-bold text-xl text-[var(--text-primary)] tracking-tight">
            Create Project
          </h2>
          <button 
            type="button"
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[#EF4444] transition-colors duration-150 p-1 cursor-pointer bg-transparent border-none outline-none"
            aria-label="Close modal"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">
          
          {/* Display API-level errors (like 403 Forbidden) */}
          {apiError && (
            <div className="w-full bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-3 py-2 font-mono text-[0.65rem] text-[#EF4444] uppercase tracking-wider leading-relaxed">
              {apiError}
            </div>
          )}

          {/* Title Field */}
          <div className="w-full shrink-0">
            <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
              TITLE <span className="text-[#EF4444] ml-0.5">*</span>
            </label>
            <input
              ref={(el) => {
                titleInputRef.current = el;
                firstFocusableRef.current = el;
              }}
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              placeholder="Enter project title"
              className={`w-full bg-[var(--bg-base)] border ${errors.title ? "border-[#EF4444]" : "border-[var(--border-col)]"} rounded-none px-3 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 h-9`}
            />
            {errors.title && (
              <p className="font-mono text-[0.58rem] text-[#EF4444] mt-1 leading-none uppercase tracking-wider">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="w-full shrink-0">
            <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
              DESCRIPTION <span className="text-[#EF4444] ml-0.5">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              placeholder="Enter a short project description"
              rows={4}
              className={`w-full bg-[var(--bg-base)] border ${errors.description ? "border-[#EF4444]" : "border-[var(--border-col)]"} rounded-none px-3 py-2.5 font-sans text-[0.85rem] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] placeholder:opacity-60 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_rgba(26,63,212,0.12)] transition-colors duration-150 resize-none`}
            />
            {errors.description && (
              <p className="font-mono text-[0.58rem] text-[#EF4444] mt-1 leading-none uppercase tracking-wider">
                {errors.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--bg-base)] border-t border-[var(--border-col)] flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-6 bg-transparent border border-[var(--border-col)] text-[var(--text-primary)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] rounded-none cursor-pointer transition-colors duration-200 hover:border-[var(--text-secondary)] hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-[rgba(255,255,255,0.02)]"
          >
            Cancel
          </button>
          <button
            type="button"
            ref={lastFocusableRef}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-9 px-6 bg-accent text-[var(--accent-text)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] border-none rounded-none cursor-pointer transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
