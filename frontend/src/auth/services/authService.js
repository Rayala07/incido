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

const authService = { login, register, logout, getMe };

export default authService;
