import { createBrowserRouter, Navigate } from 'react-router-dom'
import Home         from './home/pages/Home'
import LoginPage    from './auth/pages/LoginPage'
import RegisterPage from './auth/pages/RegisterPage'
import AuthLayout   from './auth/components/AuthLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    // Catch-all → home
    path: '*',
    element: <Navigate to="/" replace />,
  },
])