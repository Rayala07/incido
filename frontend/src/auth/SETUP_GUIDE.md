/\*\*

- ============================================
- FRONTEND AUTHENTICATION SETUP GUIDE
- ============================================
-
- This file explains how to integrate the new
- role-based Google OAuth flow with the frontend.
  \*/

// ============================================
// STEP 1: UPDATE routes.jsx
// ============================================

/\*
Replace/update your routes with:

```jsx
import AuthPage from "./auth/pages/AuthPage.jsx"
import AuthSuccess from "./auth/pages/AuthSuccess.jsx"
import LoginPage from "./auth/pages/LoginPage.jsx"
import RegisterPage from "./auth/pages/RegisterPage.jsx"
import DashboardPage from "./dashboard/pages/DashboardPage.jsx"
import AdminDashboard from "./admin/pages/AdminDashboard.jsx" // Create this if needed

const routes = [
  // Authentication routes
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/auth-success",
    element: <AuthSuccess />, // NEW: Post-OAuth redirect page
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Dashboard routes (role-based)
  {
    path: "/dashboard",
    element: <DashboardPage />, // Regular user dashboard
  },
  {
    path: "/admin-dashboard",
    element: <AdminDashboard />, // Admin-only dashboard
  },

  // ... other routes
]

export default routes
```

\*/

// ============================================
// STEP 2: ENVIRONMENT VARIABLES (.env.local)
// ============================================

/\*
Make sure your frontend .env has:

```
VITE_API_BASE_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

Used in:

- AuthPage.jsx: handleGoogleLogin()
- Any API calls to backend
  \*/

// ============================================
// STEP 3: HOW THE FLOW WORKS
// ============================================

/\*
SCENARIO 1: User signs up with role selection
─────────────────────────────────────────────

1. User visits: http://localhost:5173/auth
2. AuthPage shows: "Select Admin or Member"
3. User clicks: "Member"
4. User clicks: "Continue with Google"
5. AuthPage redirects to:
   http://localhost:3000/api/auth/google?role=member
   └─ ROLE PASSED HERE
6. Backend stores role in SESSION
7. Google OAuth flow happens
8. User grants permission
9. Google redirects to: /api/auth/google/callback
10. Backend:
    - Reads role from session
    - Checks if user exists
    - If new: Creates user WITH that role
    - Generates JWT token
    - Redirects to: http://localhost:5173/auth-success?token=JWT&role=member
11. AuthSuccess page:
    - Extracts token from URL
    - Stores in localStorage
    - Redirects to /dashboard (based on role)
12. ✓ User logged in!

SCENARIO 2: User signs up via invite link
─────────────────────────────────────────

1. Admin creates invite link:
   http://localhost:5173/auth?role=admin

2. User receives link and clicks it

3. AuthPage loads with role=admin in URL
   → Skips role selection (already has role)
   → Shows "Signing up as: ADMIN"

4. User clicks: "Continue with Google"

5. Same flow as Scenario 1, but role is locked to "admin"

6. User created with admin role

7. Redirected to /admin-dashboard
   \*/

// ============================================
// STEP 4: CREATING INVITE LINKS
// ============================================

/\*
Admin can manually create invite links by:

1. Going to: http://localhost:5173/auth?role=admin
2. Copying that URL
3. Sending to other admins

Or programmatically in your admin panel:

```jsx
function createInviteLink(role = "member") {
  const baseUrl = import.meta.env.VITE_FRONTEND_URL
  const link = `${baseUrl}/auth?role=${role}`
  return link
}
```

\*/

// ============================================
// STEP 5: IMPORTANT FILES TO UPDATE
// ============================================

/\*
Files that MAY need updates:

1. ✓ src/auth/pages/AuthPage.jsx (NEW)
   - Shows role selection
   - Handles Google login with role param

2. ✓ src/auth/pages/AuthSuccess.jsx (NEW)
   - Handles post-OAuth redirect
   - Stores token in localStorage
   - Redirects to dashboard

3. routes.jsx
   - Add /auth and /auth-success routes
   - Make sure /admin-dashboard exists

4. src/auth/services/authService.js
   - Update if needed to use new flow
   - Likely NO changes needed if using localStorage token

5. .env.local
   - Add VITE_API_BASE_URL if not present
     \*/

// ============================================
// STEP 6: TESTING THE FLOW
// ============================================

/\*
Test Checklist:

☐ Start backend: npm run dev (port 3000)
☐ Start frontend: npm run dev (port 5173)

☐ Test 1: Role Selection

1. Visit http://localhost:5173/auth
2. See role selection buttons
3. Click "Admin" or "Member"
4. Click "Continue with Google"
5. Should redirect to Google login

☐ Test 2: Invite Link

1. Visit http://localhost:5173/auth?role=admin
2. Should show "Signing up as: ADMIN" (no selection)
3. Click "Continue with Google"
4. Should redirect to Google login

☐ Test 3: Complete OAuth

1. After Google login
2. Should redirect to /auth-success
3. Should see "Logging you in..."
4. Should redirect to /dashboard (or /admin-dashboard)
5. Token should be in localStorage

☐ Test 4: Database Check

1. Check MongoDB
2. New user should have correct role:
   db.users.find({ email: "your-email@example.com" })
   // Check: role: "member" or "admin"
   \*/

// ============================================
// STEP 7: TROUBLESHOOTING
// ============================================

/\*
Issue: "Token is undefined" on auth-success
Fix: Check backend is correctly redirecting with token in URL
Logs: Check backend console for redirect URL

Issue: User created with wrong role
Fix: Check req.session.userRole is being set in /api/auth/google route
Logs: Add console.log in backend to verify

Issue: Redirect goes to /dashboard instead of /admin-dashboard
Fix: Check if role param is being passed to auth-success
Logs: console.log(role) in AuthSuccess.jsx

Issue: Token not persisting after page refresh
Fix: Check localStorage keys: - Token should be in localStorage.token - Role should be in localStorage.userRole - Check if localStorage is cleared by browser

Issue: Session middleware not working
Fix: Make sure express-session is installed:
npm install express-session

Issue: CORS errors
Fix: Verify credentials: true in cors options
Verify FRONTEND_URL in .env matches actual frontend URL
\*/

// ============================================
// STEP 8: BACKEND CHANGES SUMMARY
// ============================================

/\*
Backend Changes Made:

1. app.js
   - Added express-session middleware
   - Sessions now store role during OAuth

2. auth.routes.js
   - Updated /google route to capture role from query params
   - Stores role in req.session.userRole

3. auth.controller.js
   - Updated googleCallback to read role from session
   - New users created with correct role
   - Redirects with token AND role in URL

Environment Variables (add to .env if not present):

- SESSION_SECRET (optional, has default)

That's it! Rest of the system works as-is.
\*/

export default {}; // This file is just documentation
