import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectSessionChecked,
} from "../features/auth/store/authSlice";

import Home               from "../features/home/pages/Home";
import LoginPage          from "../features/auth/pages/LoginPage";
import RegisterPage       from "../features/auth/pages/RegisterPage";
import AuthLayout         from "../features/auth/components/AuthLayout";
import DashboardPage      from "../features/dashboard/pages/DashboardPage";
import CreateIncidentPage from "../features/incidents/pages/CreateIncidentPage";
import IncidentListPage   from "../features/incidents/pages/IncidentListPage";
import ProjectsPage       from "../features/projects/pages/ProjectsPage";
import ProjectDetailsPage from "../features/projects/pages/ProjectDetailsPage";
import IncidentDetailsPage from "../features/incidents/pages/IncidentDetailsPage";
import PostmortemReportPage from "../features/incidents/pages/PostmortemReportPage";

// ── ProtectedRoute ─────────────────────────────────────────
const ProtectedRoute = () => {
  const sessionChecked  = useSelector(selectSessionChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!sessionChecked) return null;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── GuestRoute ─────────────────────────────────────────────
const GuestRoute = () => {
  const sessionChecked  = useSelector(selectSessionChecked);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (!sessionChecked) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────
  { path: "/", element: <Home /> },

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
      { path: "/dashboard",                  element: <DashboardPage /> },
      { path: "/incidents",                  element: <IncidentListPage /> },
      { path: "/projects",                   element: <ProjectsPage /> },
      { path: "/projects/:projectId",        element: <ProjectDetailsPage /> },
      { path: "/incidents/create",           element: <CreateIncidentPage /> },
      { path: "/incidents/:id",              element: <IncidentDetailsPage /> },
      { path: "/incidents/:id/report",       element: <PostmortemReportPage /> },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────
  { path: "*", element: <Navigate to="/" replace /> },
]);
