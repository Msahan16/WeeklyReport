import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './context/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import MyReports from './pages/MyReports';
import ReportForm from './pages/ReportForm';
import TeamDashboard from './pages/TeamDashboard';
import Projects from './pages/Projects';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';
import Unauthorized from './pages/Unauthorized';

// Redirect root path based on user role
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'MANAGER'
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/my-reports" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Team member routes — report creation/editing (not for managers) */}
          <Route element={<PrivateRoute roles={['TEAM_MEMBER']} />}>
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/reports/new" element={<ReportForm />} />
            <Route path="/reports/:id/edit" element={<ReportForm />} />
          </Route>
          {/* Manager routes — view-only dashboard & projects */}
          <Route element={<PrivateRoute roles={['MANAGER']} />}>
            <Route path="/dashboard" element={<TeamDashboard />} />
            <Route path="/projects" element={<Projects />} />
          </Route>
        </Routes>
        <ChatWidget />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;