import axiosInstance from "./axiosInstance";

/**
 * Auth service — all calls hit /api/auth/*
 *
 * Each function:
 *   - Returns the `data` object from the Axios response directly.
 *   - Lets Axios throw on non-2xx so callers / hooks handle errors uniformly.
 *   - Never swallows errors silently.
 */

// POST /api/auth/login
const login = async ({ email, password }) => {
  const { data } = await axiosInstance.post("/api/auth/login", {
    email,
    password,
  });
  return data; // { message, user: { id, username, email, role, usertype, isVerified } }
};

// POST /api/auth/register
const register = async ({ username, email, password, role }) => {
  const { data } = await axiosInstance.post("/api/auth/register", {
    username,
    email,
    password,
    role,
  });
  return data; // { message, success, user }
};

// POST /api/auth/logout
const logout = async () => {
  const { data } = await axiosInstance.post("/api/auth/logout");
  return data; // { message, success }
};

// GET /api/auth/me  (requires valid cookie)
const getMe = async () => {
  const { data } = await axiosInstance.get("/api/auth/me");
  return data; // { success, user }
};

// GET /api/auth/verify-assignment-email/:email
const verifyAssignmentEmail = async (email) => {
  const { data } = await axiosInstance.get(`/api/auth/verify-assignment-email/${encodeURIComponent(email)}`);
  return data;
};

// GET /api/auth/verify-responder-email/:email?projectId=<id>
// Checks: user exists + not admin + is a member of the given project
const verifyResponderEmail = async (email, projectId) => {
  const { data } = await axiosInstance.get(
    `/api/auth/verify-responder-email?email=${encodeURIComponent(email)}&projectId=${projectId}`
  );
  return data;
};

const authService = { login, register, logout, getMe, verifyAssignmentEmail, verifyResponderEmail };

export default authService;

