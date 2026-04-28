import { createBrowserRouter, Navigate } from 'react-router-dom'
import Home         from './home/pages/Home'
import LoginPage    from './auth/pages/LoginPage'
import RegisterPage from './auth/pages/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    // Catch-all → home
    path: '*',
    element: <Navigate to="/" replace />,
  },
])