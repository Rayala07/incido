import React, { useState, useEffect, useRef } from "react";
import { animate } from "motion";
import projectService from "../services/projectService";
import authService from "../../auth/services/authService";
import { emailSchema } from "../../../shared/utils/validation";

const AssignMembersModal = ({ isOpen, onClose, projectId, existingMembers = [], onAssignSuccess }) => {
  const [stagedMembers, setStagedMembers] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedRole, setSelectedRole] = useState("member");
  const [allUsers, setAllUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // 1. Entry Animation when modal opens
  useEffect(() => {
    if (isOpen) {
      // Entry animation
      if (backdropRef.current && modalRef.current) {
        animate(backdropRef.current, { opacity: [0, 1] }, { duration: 0.2 });
        animate(
          modalRef.current,
          { opacity: [0, 1], y: [10, 0], scale: [0.98, 1] },
          { duration: 0.3, easing: [0.16, 1, 0.3, 1] }
        );
      }
      
      // Set focus safely after animation completes
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 300);

      // Fetch all users for search
      authService.getAllUsers()
        .then(res => {
          if (res.success) {
            setAllUsers(res.users.filter(u => u.role !== 'admin'));
          }
        })
        .catch(err => console.error("Failed to fetch users", err));
    }
  }, [isOpen]);

  const handleClose = async () => {
    setIsAnimatingOut(true);
    
    if (backdropRef.current && modalRef.current) {
      const animPromises = [
        animate(backdropRef.current, { opacity: 0 }, { duration: 0.2 }).finished,
        animate(
          modalRef.current,
          { opacity: 0, y: 10, scale: 0.98 },
          { duration: 0.2 }
        ).finished
      ];
      await Promise.all(animPromises);
    }

    // Reset state
    setStagedMembers([]);
    setEmailInput("");
    setEmailError("");
    setSelectedRole("member");
    setApiError("");
    setIsAnimatingOut(false);
    onClose();
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

  if (!isOpen) return null;

  // Filter out emails that are already in the project natively
  const existingEmails = existingMembers.map(m => m.user.email?.toLowerCase());

  const filteredUsers = allUsers.filter(u => 
    !existingEmails.includes(u.email.toLowerCase()) &&
    !stagedMembers.some(m => m.email === u.email.toLowerCase()) &&
    (u.email.toLowerCase().includes(emailInput.trim().toLowerCase()) || 
     u.username.toLowerCase().includes(emailInput.trim().toLowerCase()))
  );

  // --- Actions ---

  const handleStageMember = async () => {
    const rawEmail = emailInput.trim().toLowerCase();
    if (!rawEmail) return;

    // Validate email format using zod
    const validation = emailSchema.safeParse(rawEmail);
    if (!validation.success) {
      setEmailError(validation.error.issues[0].message);
      return;
    }

    if (existingEmails.includes(rawEmail)) {
      setEmailError("User is already a member of this project.");
      return;
    }

    if (stagedMembers.some(m => m.email === rawEmail)) {
      setEmailError("Email is already in the staged list.");
      return;
    }

    try {
      setIsSubmitting(true);
      setEmailError("");
      
      // Verify email exists and is not an admin via backend
      const res = await authService.verifyAssignmentEmail(rawEmail);
      
      if (res.success) {
        setStagedMembers(prev => [...prev, { email: rawEmail, role: selectedRole }]);
        setEmailInput("");
        setSelectedRole("member"); // reset to default
      }
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to verify email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleStageMember();
      setShowDropdown(false);
    } else if (e.key === "Escape" && showDropdown) {
      e.stopPropagation();
      setShowDropdown(false);
    }
  };

  const handleRemoveStaged = (email) => {
    setStagedMembers(prev => prev.filter(m => m.email !== email));
  };

  const handleSubmit = async () => {
    if (stagedMembers.length === 0) {
      setApiError("Please add at least one member to assign.");
      return;
    }

    setApiError("");
    setIsSubmitting(true);

    try {
      const payloadMembers = stagedMembers.map(m => ({
        email: m.email,
        role: m.role
      }));

      const data = await projectService.addMembersToProject(projectId, payloadMembers);

      if (data.success) {
        onAssignSuccess();
        await handleClose();
      } else {
        setApiError(data.message || "Failed to assign members.");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center isolate">
      {/* Backdrop */}
      <div 
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={isSubmitting ? undefined : handleClose}
      />

      {/* Modal Container */}
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-[90%] max-w-md bg-[var(--bg-card)] border border-[var(--border-col)] flex flex-col shadow-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-col)] bg-[var(--bg-base)]">
          <h2 id="modal-title" className="font-display font-bold text-lg text-[var(--text-primary)] tracking-tight">
            Assign Members
          </h2>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150 cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-6">
          
          {/* API Error */}
          {apiError && (
            <div className="w-full bg-[rgba(239,68,68,0.08)] border border-[#EF4444] px-3 py-2 font-mono text-[0.65rem] text-[#EF4444] uppercase tracking-wider leading-relaxed">
              {apiError}
            </div>
          )}

          {/* Staged Members List */}
          {stagedMembers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                Staged for Assignment
              </span>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto scrollbar-hide">
                {stagedMembers.map(m => (
                  <div key={m.email} className="flex items-center justify-between bg-[var(--bg-base)] border border-[var(--border-col)] px-3 py-2">
                    <div className="flex flex-col">
                      <span className="font-sans text-[0.8rem] font-medium text-[var(--text-primary)] leading-none mb-1">
                        {m.email}
                      </span>
                      <span className="font-mono text-[0.55rem] uppercase tracking-widest text-[var(--accent)]">
                        {m.role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveStaged(m.email)}
                      className="text-[var(--text-muted)] hover:text-[#EF4444] transition-colors"
                      title="Remove"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selection Controls */}
          <div className="flex flex-col gap-4 bg-[var(--bg-base)] p-4 border border-[var(--border-col)]">
            <div className="w-full relative">
              <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                Search User
              </label>
              <input
                type="text"
                ref={firstFocusableRef}
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setShowDropdown(true);
                  if (emailError) setEmailError("");
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setShowDropdown(false)}
                onKeyDown={handleKeyDown}
                placeholder="Search by name or email..."
                className="w-full h-9 bg-[var(--bg-card)] border border-[var(--border-col)] px-3 font-sans text-[0.85rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-150 appearance-none rounded-none placeholder:text-[var(--text-muted)]"
              />
              {showDropdown && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-[var(--bg-card)] border border-[var(--border-col)] shadow-xl z-50">
                  {filteredUsers.map(u => (
                    <div 
                      key={u._id || u.email}
                      className="px-3 py-2 cursor-pointer hover:bg-[var(--bg-base)] flex flex-col border-b border-[var(--border-col)] last:border-b-0"
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur before onClick
                      onClick={() => {
                        setEmailInput(u.email);
                        setShowDropdown(false);
                      }}
                    >
                      <span className="font-sans text-[0.8rem] font-medium text-[var(--text-primary)]">{u.username}</span>
                      <span className="font-mono text-[0.6rem] text-[var(--text-muted)]">{u.email}</span>
                    </div>
                  ))}
                </div>
              )}
              {emailError && (
                <span className="block mt-1 font-mono text-[0.55rem] uppercase tracking-wider text-[#EF4444]">
                  {emailError}
                </span>
              )}
            </div>

            <div className="w-full">
              <label className="block mb-1.5 font-mono text-[0.6rem] uppercase tracking-widest text-[var(--text-secondary)]">
                Select Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-9 bg-[var(--bg-card)] border border-[var(--border-col)] px-3 font-sans text-[0.85rem] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors duration-150 appearance-none rounded-none"
              >
                <option value="member">Member</option>
                <option value="leader">Leader</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleStageMember}
              disabled={!emailInput.trim() || isSubmitting}
              className="mt-2 h-8 w-full bg-[var(--bg-card)] border border-[var(--border-col)] text-[var(--text-primary)] font-mono text-[0.65rem] uppercase tracking-wider hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && !stagedMembers.length && emailInput ? "Verifying..." : "Add to List"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-col)] bg-[var(--bg-base)] flex justify-end gap-3">
          <button 
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9 px-5 bg-transparent text-[var(--text-secondary)] font-mono text-[0.72rem] uppercase tracking-[0.15em] border border-transparent hover:border-[var(--border-col)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            ref={lastFocusableRef}
            onClick={handleSubmit}
            disabled={isSubmitting || stagedMembers.length === 0}
            className="h-9 px-6 bg-accent text-[var(--accent-text)] font-mono text-[0.72rem] font-medium uppercase tracking-[0.15em] border-none rounded-none cursor-pointer transition-all duration-200 hover:bg-[var(--accent-hover)] hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Saving..." : "Save Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMembersModal;
