import { useState, useEffect } from "react"
import GoogleAuthButton from "../components/GoogleAuthButton.jsx"
import AuthLayout from "../components/AuthLayout.jsx"
import "../styles/auth.css"

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

/**
 * AuthPage Component
 *
 * This page handles two authentication scenarios:
 * 1. User comes with invite link (e.g., ?role=admin)
 *    → Role is locked, skip selection
 *    → Show "Sign in with Google" button
 *
 * 2. User comes without invite link
 *    → Show role selection (Admin / Member)
 *    → User selects role
 *    → Then "Sign in with Google"
 *
 * Flow:
 * User selects/gets role → Click "Continue with Google"
 * → Redirected to: /api/auth/google?role={selectedRole}
 * → Google OAuth flow
 * → Backend callback stores role in session
 * → Backend creates user with that role (if new)
 * → Redirect to /auth-success with token + role
 */

export default function AuthPage() {
  // Track which role is selected
  const [role, setRole] = useState("responder")

  // Check if this user came via invite link
  const [roleFromInvite, setRoleFromInvite] = useState(null)

  // On component load: check URL for invite link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const inviteRole = params.get("role")

    // If invite link has a role, lock it in (don't allow selection)
    if (inviteRole && ["admin", "responder", "leader"].includes(inviteRole)) {
      setRoleFromInvite(inviteRole)
      setRole(inviteRole)
    }
  }, [])

  // Handle role selection (only if no invite link)
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole)
  }

  // When user clicks "Continue with Google"
  const handleGoogleLogin = () => {
    // Build the auth URL with the selected role as query param
    // Backend's /api/auth/google route will extract this
    const authUrl = `${backendBaseUrl}/api/auth/google?role=${role}`
    window.location.href = authUrl
  }

  return (
    <AuthLayout>
      <div className="auth-page">
        <h2>Join Incident Response</h2>

        {/* Show role selection ONLY if no invite link */}
        {!roleFromInvite && (
          <div className="role-selection">
            <p className="subtitle">Select your role:</p>

            <div className="role-buttons">
              {/* Admin Button */}
              <button
                className={`role-btn ${role === "admin" ? "active" : ""}`}
                onClick={() => handleRoleSelect("admin")}
                title="Admin: Full access to all incidents and settings"
              >
                <span className="role-icon">👑</span>
                <span className="role-name">Admin</span>
                <span className="role-desc">Full access</span>
              </button>

              {/* Responder Button */}
              <button
                className={`role-btn ${role === "responder" ? "active" : ""}`}
                onClick={() => handleRoleSelect("responder")}
                title="Responder: Can view and create incidents"
              >
                <span className="role-icon">👤</span>
                <span className="role-name">Responder</span>
                <span className="role-desc">Standard access</span>
              </button>
            </div>
          </div>
        )}

        {/* Show what role is selected (useful for invite link scenario) */}
        {roleFromInvite && (
          <div className="role-info">
            <p>
              ✓ Signing up as: <strong>{roleFromInvite.toUpperCase()}</strong>
            </p>
            <p className="hint">This role was sent via invite link</p>
          </div>
        )}

        {/* Google Login Button */}
        <div className="login-section">
          <GoogleAuthButton
            onClick={handleGoogleLogin}
            text={`Continue with Google as ${role}`}
          />
        </div>

        {/* Info text */}
        <p className="footer-text">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </AuthLayout>
  )
}
