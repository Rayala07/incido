import { createSlice } from "@reduxjs/toolkit";

/**
 * Auth state shape:
 *   status: "idle" | "loading" | "succeeded" | "failed"
 *     - "idle"      → initial; getMe has not been called yet
 *     - "loading"   → an async auth operation is in-flight
 *     - "succeeded" → user is authenticated and data is fresh
 *     - "failed"    → last auth operation errored (user is null)
 *
 *   user: UserDTO | null
 *     { id, username, email, role, usertype, profile, isVerified, createdAt }
 *
 *   error: string | null
 *     Human-readable message from the last failed operation.
 *
 *   sessionChecked: boolean
 *     True once the initial getMe call has resolved (success or 401).
 *     Used by ProtectedRoute / GuestRoute to avoid flash-of-redirect
 *     before we know if the user has a valid cookie.
 */

const initialState = {
  user: null,
  status: "idle",        // "idle" | "loading" | "succeeded" | "failed"
  error: null,
  sessionChecked: false, // flip to true after first getMe resolves
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ── Async lifecycle: request ────────────────────────────
    authRequest(state) {
      state.status = "loading";
      state.error = null;
    },

    // ── Async lifecycle: success ────────────────────────────
    authSuccess(state, action) {
      state.user = action.payload;     // full UserDTO
      state.status = "succeeded";
      state.error = null;
      state.sessionChecked = true;
    },

    // ── Async lifecycle: failure ────────────────────────────
    authFailure(state, action) {
      state.user = null;
      state.status = "failed";
      state.error = action.payload;    // string message
      state.sessionChecked = true;
    },

    // ── Session check resolved (no active session) ──────────
    // Called when getMe returns 401 — user is a guest, that's fine.
    sessionResolved(state) {
      state.sessionChecked = true;
      state.status = "idle";
    },

    // ── Clear state on logout ───────────────────────────────
    clearAuth(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      // sessionChecked stays true — we know there's no session now
    },

    // ── Clear transient error (e.g. on modal close / route change) ──
    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  authRequest,
  authSuccess,
  authFailure,
  sessionResolved,
  clearAuth,
  clearError,
} = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────
export const selectUser           = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.status === "succeeded" && state.auth.user !== null;
export const selectAuthStatus     = (state) => state.auth.status;
export const selectAuthError      = (state) => state.auth.error;
export const selectSessionChecked = (state) => state.auth.sessionChecked;
export const selectIsAdmin        = (state) => state.auth.user?.role === "admin";

export default authSlice.reducer;
