// src/routes.js
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReports from './pages/MyReports';
import ReportForm from './pages/ReportForm';
import TeamDashboard from './pages/TeamDashboard';
import Projects from './pages/Projects';
import PrivateRoute from './components/PrivateRoute';
import Unauthorized from './pages/Unauthorized'; // optional, create a simple "Access Denied" page

// Helper to check if user has required role (used inside loaders/actions if needed)
// But we'll use the PrivateRoute component for protection.

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
  {
    path: '/',
    // Redirect to login or home based on auth state. We'll handle in App or use a root element.
    element: <Navigate to="/login" replace />,
  },
  // Protected routes – all require authentication
  {
    element: <PrivateRoute />, // wraps all children; checks if user is logged in
    children: [
      {
        path: '/my-reports',
        element: <MyReports />,
      },
      {
        path: '/reports/new',
        element: <ReportForm />,
      },
      {
        path: '/reports/:id/edit',
        element: <ReportForm />,
      },
    ],
  },
  // Manager-only routes
  {
    element: <PrivateRoute requiredRoles={['MANAGER']} />,
    children: [
      {
        path: '/dashboard',
        element: <TeamDashboard />,
      },
      {
        path: '/projects',
        element: <Projects />,
      },
    ],
  },
  // Catch-all 404
  {
    path: '*',
    element: <Navigate to="/login" replace />, // or a dedicated NotFound component
  },
]);

export default router;