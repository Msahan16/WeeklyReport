import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route element={<PrivateRoute />}>
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/reports/new" element={<ReportForm />} />
            <Route path="/reports/:id/edit" element={<ReportForm />} />
          </Route>
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