import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hook/useAuth.js"

/**
 * AuthSuccess Component
 *
 * This page is shown AFTER Google OAuth completes.
 *
 * What happens here:
 * 1. Backend redirects to: /auth-success?token=JWT&role=admin
 * 2. This component extracts token and role from URL
 * 3. Stores token in localStorage
 * 4. Decodes JWT to get user info
 * 5. Redirects to appropriate dashboard based on role:
 *    - Admin → /admin-dashboard
 *    - Member → /dashboard
 *    - Default → /dashboard
 *
 * Why we need this page:
 * → Token needs to be extracted from URL (not safe as-is)
 * → localStorage stores it securely
 * → Then redirect to appropriate dashboard
 * → If token is invalid, show error
 */

export default function AuthSuccess() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      // Step 1: Extract query parameters from URL
      const params = new URLSearchParams(window.location.search)
      const token = params.get("token")
      const role = params.get("role")

      // Step 2: Validate token exists
      if (!token) {
        setError("Authentication failed: No token received")
        setLoading(false)
        return
      }

      // Step 3: Store token in localStorage
      // This token will be used in all subsequent API requests
      // (see authService.js for how it's attached to requests)
      localStorage.setItem("token", token)

      // Step 4: Store role in localStorage for quick access
      if (role) {
        localStorage.setItem("userRole", role)
      }

      // Step 5: Decode JWT to extract user info (optional but useful)
      // JWT format: header.payload.signature
      // We only need the payload (middle part)
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]))
        localStorage.setItem("userId", decoded.id)
        console.log("✓ User authenticated:", decoded)
      } catch (decodeError) {
        console.warn("Could not decode token, continuing anyway")
      }

      // Step 6: Redirect to appropriate dashboard
      if (role === "admin") {
        // Admin gets special admin dashboard
        navigate("/admin-dashboard")
      } else {
        // Members and others go to regular dashboard
        navigate("/dashboard")
      }

      setLoading(false)
    } catch (err) {
      console.error("Auth success error:", err)
      setError(err.message)
      setLoading(false)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="auth-success-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>Logging you in...</h2>
          <p>Setting up your account</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-success-page">
        <div className="error-container">
          <h2>⚠️ Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/auth")}>Back to Login</button>
        </div>
      </div>
    )
  }

  // This shouldn't render as we redirect above, but just in case
  return null
}
