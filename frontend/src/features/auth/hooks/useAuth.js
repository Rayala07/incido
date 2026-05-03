import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import {
  authRequest,
  authSuccess,
  authFailure,
  sessionResolved,
  clearAuth,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
  selectSessionChecked,
  selectIsAdmin,
} from "../store/authSlice";

/**
 * useAuth — single source of truth for all authentication actions.
 *
 * Principles:
 *  - All async actions follow the same request → success | failure lifecycle.
 *  - Network errors and backend error messages are both normalised to a
 *    plain string before being stored in state — no raw Axios objects leak out.
 *  - useCallback on every action prevents unnecessary re-renders in consumers.
 *  - No side-effects live outside the hook; components stay declarative.
 *  - redirects are opt-in via the `redirectTo` argument, not hard-coded,
 *    so the hook stays reusable in different route contexts.
 */
const useAuth = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  // ── Selectors ──────────────────────────────────────────────
  const user            = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status          = useSelector(selectAuthStatus);
  const error           = useSelector(selectAuthError);
  const sessionChecked  = useSelector(selectSessionChecked);
  const isAdmin         = useSelector(selectIsAdmin);
  const isLoading       = status === "loading";

  // ── Normalise any thrown error to a human-readable string ──
  const extractMessage = (err) => {
    // Backend validation errors array (express-validator)
    if (err?.response?.data?.errors?.[0]?.msg) {
      return err.response.data.errors[0].msg;
    }
    // Backend plain message
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }
    // Network-level (no response at all)
    if (err?.message) return err.message;
    return "An unexpected error occurred. Please try again.";
  };

  // ── login ──────────────────────────────────────────────────
  const login = useCallback(
    async ({ email, password }, { redirectTo = "/dashboard" } = {}) => {
      dispatch(authRequest());
      try {
        const data = await authService.login({ email, password });
        dispatch(authSuccess(data.user));
        navigate(redirectTo, { replace: true });
      } catch (err) {
        dispatch(authFailure(extractMessage(err)));
      }
    },
    [dispatch, navigate],
  );

  // ── register ───────────────────────────────────────────────
  // On success we do NOT redirect — user must verify email first.
  // Returns { success: boolean } so the form can switch to a success view.
  const register = useCallback(
    async ({ username, email, password, role }) => {
      dispatch(authRequest());
      try {
        const data = await authService.register({ username, email, password, role });
        // Registration succeeded but user is NOT logged in yet (unverified).
        // We clear any loading/error state without setting a user.
        dispatch(sessionResolved());
        return { success: true, message: data.message };
      } catch (err) {
        const message = extractMessage(err);
        dispatch(authFailure(message));
        return { success: false, message };
      }
    },
    [dispatch],
  );

  // ── logout ─────────────────────────────────────────────────
  const logout = useCallback(
    async ({ redirectTo = "/login" } = {}) => {
      dispatch(authRequest());
      try {
        await authService.logout();
      } catch {
        // Even if the network call fails, clear client state — the cookie
        // will expire on its own and the user should not stay "logged in".
      } finally {
        dispatch(clearAuth());
        navigate(redirectTo, { replace: true });
      }
    },
    [dispatch, navigate],
  );

  // ── getMe (session rehydration) ────────────────────────────
  // Called once on app mount. Resolves sessionChecked regardless of outcome.
  const getMe = useCallback(async () => {
    dispatch(authRequest());
    try {
      const data = await authService.getMe();
      dispatch(authSuccess(data.user));
    } catch (err) {
      // 401 → no active session; this is normal for guests.
      // Any other error → also treat as no session to be safe.
      dispatch(sessionResolved());
    }
  }, [dispatch]);

  // ── dismissError ───────────────────────────────────────────
  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    sessionChecked,
    status,
    // Actions
    login,
    register,
    logout,
    getMe,
    dismissError,
  };
};

export default useAuth;
