import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectSessionChecked,
} from "./auth/store/authSlice";

import Home          from "./home/pages/Home";
import LoginPage     from "./auth/pages/LoginPage";
import RegisterPage  from "./auth/pages/RegisterPage";
import AuthLayout    from "./auth/components/AuthLayout";
import DashboardPage from "./dashboard/pages/DashboardPage";
import CreateIncidentPage from "./incident/pages/CreateIncidentPage";
import ProjectsPage from "./project/pages/ProjectsPage";
import ProjectDetailsPage from "./project/pages/ProjectDetailsPage";

// ── ProtectedRoute ─────────────────────────────────────────
// Blocks unauthenticated users. Waits for session check to
// resolve before redirecting — prevents a flash-to-login on
// hard refresh for authenticated users.
const ProtectedRoute = () => {
  const sessionChecked  = useSelector(selectSessionChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Session check not yet complete → render nothing (no flash)
  if (!sessionChecked) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── GuestRoute ─────────────────────────────────────────────
// Prevents already-authenticated users from accessing /login
// or /register. Waits for session check first.
const GuestRoute = () => {
  const sessionChecked  = useSelector(selectSessionChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!sessionChecked) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────
  {
    path: "/",
    element: <Home />,
  },

  // ── Guest-only (auth forms) ────────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login",    element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
    ],
  },

  // ── Protected (requires valid session) ────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/projects/:projectId", element: <ProjectDetailsPage /> },
      { path: "/incidents/create", element: <CreateIncidentPage /> },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);