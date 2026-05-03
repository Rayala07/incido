/\*\*

- ============================================
- BACKEND AUTHENTICATION SETUP GUIDE
- ============================================
-
- This explains the role-based Google OAuth
- implementation for the backend team.
  \*/

// ============================================
// WHAT WAS CHANGED
// ============================================

/\*
3 files were modified:

1. src/app.js
   - Added express-session import
   - Added session middleware BEFORE passport.initialize()
   - Sessions store user role during OAuth flow

2. src/routes/auth.routes.js
   - Modified /google route to accept role query param
   - Stores role in req.session for use in callback

3. src/controllers/auth.controller.js
   - Modified googleCallback to read role from session
   - New users created with the role from session
   - Includes logging for debugging
   - Redirects with token AND role in URL
     \*/

// ============================================
// INSTALLATION
// ============================================

/\*
Install required dependency:
npm install express-session

That's it! No other dependencies needed.
\*/

// ============================================
// HOW IT WORKS (BACKEND FLOW)
// ============================================

/\*
REQUEST: Frontend calls /api/auth/google?role=member
┌─────────────────────────────────────────────────┐
│ Backend: /google route handler │
├─────────────────────────────────────────────────┤
│ 1. Extract role from query params (default: member)
│ 2. Store in session: req.session.userRole = role
│ 3. Call passport.authenticate("google", ...)
│ 4. Redirect to Google OAuth consent screen
└─────────────────────────────────────────────────┘

↓ User grants permission on Google

REQUEST: Google redirects to /api/auth/google/callback
┌─────────────────────────────────────────────────┐
│ Backend: googleCallback handler │
├─────────────────────────────────────────────────┤
│ 1. req.user contains: email, id, displayName │
│ 2. Read role from session: req.session.userRole │
│ 3. Check if user exists in MongoDB │
│ 4. If new user: │
│ - Create with role from session │
│ - Log success │
│ 5. If existing user: │
│ - Just log them in (keep existing role) │
│ - Log message │
│ 6. Generate JWT token │
│ 7. Set cookie with token │
│ 8. Redirect to: │
│ /auth-success?token=JWT&role=member │
└─────────────────────────────────────────────────┘

↓ Frontend receives redirect

Frontend: /auth-success

- Extracts token and role from URL
- Stores in localStorage
- Redirects to appropriate dashboard
  \*/

// ============================================
// CODE WALKTHROUGH: KEY PARTS
// ============================================

/\*

1. SESSION MIDDLEWARE (app.js):

app.use(
session({
secret: "incident-rag-session-secret",
resave: false,
saveUninitialized: false,
cookie: {
secure: false, // false for localhost, true for HTTPS
maxAge: 24 _ 60 _ 60 \* 1000 // 24 hours
},
}),
);

WHY: Session persists across requests

- User calls /api/auth/google?role=admin
- Session stores role=admin
- Browser redirects to Google
- Google redirects back to /callback
- Session still has role=admin
- We use it to create user with correct role
  \*/

/\* 2. GOOGLE ROUTE (auth.routes.js):

authRoutes.get("/google", (req, res, next) => {
const role = req.query.role || "member"; // 1. Get role from URL
req.session.userRole = role; // 2. Store in session

passport.authenticate("google", {
scope: ["profile", "email"],
})(req, res, next); // 3. Start OAuth
});

HOW TO USE:

- Frontend: GET /api/auth/google?role=admin
- Frontend: GET /api/auth/google?role=member
- If no role param: defaults to "member"
  \*/

/\* 3. GOOGLE CALLBACK (auth.controller.js):

export const googleCallback = async (req, res) => {
const userRole = req.session.userRole || "member"; // 1. Read role from session
const email = emails[0].value;

let user = await userModel.findOne({ email });

if (!user) {
// 2. NEW USER: Create with role from session
user = await userModel.create({
username: displayName,
email,
role: userRole, // ← KEY: Assign role here
googleId: id,
usertype: "google",
isVerified: true,
});
}

// 3. Generate token (includes user ID + role)
const token = generateToken(user);

// 4. Redirect with token AND role
const redirectUrl = `${FRONTEND_URL}/auth-success?token=${token}&role=${user.role}`;
return res.redirect(redirectUrl);
};
\*/

// ============================================
// ENVIRONMENT VARIABLES
// ============================================

/\*
Add to .env (optional, all have defaults):

SESSION_SECRET=your-session-secret-key
(Default: "incident-rag-session-secret")
Tip: Use a strong random string in production

FRONTEND_URL=http://localhost:5173
(Already in your .env)

All other existing vars remain unchanged.
\*/

// ============================================
// TESTING THE BACKEND
// ============================================

/\*
Quick test without frontend:

1. Start backend: npm run dev

2. In browser, navigate to:
   http://localhost:3000/api/auth/google?role=admin

3. Should redirect to Google OAuth consent screen

4. Grant permission with a test Google account

5. Should redirect back to:
   http://localhost:5173/auth-success?token=...&role=admin

6. Check MongoDB for new user:
   db.users.findOne({ email: "your-test@gmail.com" })

   Should have:
   {
   \_id: ObjectId(...),
   email: "your-test@gmail.com",
   username: "Your Name",
   googleId: "...",
   role: "admin",
   usertype: "google",
   isVerified: true
   }

✓ Success!
\*/

// ============================================
// LOGGING & DEBUGGING
// ============================================

/\*
Console logs to check:

Backend logs to watch for:

1. Auth route called:
   (No log by default, add if needed)

2. Google callback success:
   "✓ New user created: user@example.com with role: admin"
   or
   "✓ Existing user logged in: user@example.com (role: member)"

3. Errors:
   "Error during Google login: ..."

To ADD MORE LOGGING, edit auth.controller.js:

export const googleCallback = async (req, res) => {
console.log(`[OAUTH] Session role: ${req.session.userRole}`);
console.log(`[OAUTH] Email: ${email}`);
console.log(`[OAUTH] User exists: ${!!user}`);
// ... rest of code
}
\*/

// ============================================
// COMMON ISSUES & FIXES
// ============================================

/\*
Issue: "req.session is undefined"
Fix: Make sure session middleware is added BEFORE routes
Check app.js: session middleware should be after express.json()
but BEFORE passport.initialize()

Issue: Role is always "member" even with ?role=admin
Fix: Check backend logs - is session being set?
Add console.log: console.log("Role from query:", req.query.role);

Issue: User created without role
Fix: Make sure googleCallback reads from session:
console.log("Role from session:", req.session.userRole);

Issue: Token not redirecting to frontend
Fix: Check FRONTEND_URL in .env
Make sure redirectUrl matches your actual frontend URL

Issue: Session persists after logout
Fix: This is okay - session just stores temp data
Real logout happens on frontend (token removal)

Issue: "express-session not found"
Fix: Install it:
npm install express-session
\*/

// ============================================
// SECURITY NOTES
// ============================================

/\*
Good practices implemented:

✓ Session uses secure cookies (httpOnly not needed here)
✓ JWT token expires in 1 hour
✓ Role is tied to user account (not just session)
✓ New users get default role, can be overridden via session
✓ Session is separate from persistent role

What you might want to add later:

- Rate limiting on /google route
- Audit logs for new users created
- Admin approval for certain roles
- Email verification for new users
- Only allow 1 admin per workspace
  \*/

// ============================================
// PRODUCTION CHECKLIST
// ============================================

/\*
Before going live:

☐ Set SESSION_SECRET to strong random string
☐ Set secure: true in session cookie (if using HTTPS)
☐ Add rate limiting to /google route
☐ Test role assignment with multiple users
☐ Test existing user login (shouldn't change role)
☐ Add audit logging
☐ Update TERMS_OF_SERVICE link
☐ Add email verification
\*/

export default {}; // This file is just documentation
