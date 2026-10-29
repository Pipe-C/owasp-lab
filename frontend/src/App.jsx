import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import Search from './pages/Search.jsx';
import Webhooks from './pages/Webhooks.jsx';
import Profile from './pages/Profile.jsx';
import DiagnosticPanel from './pages/DiagnosticPanel.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/factura/:id" element={<RequireAuth><InvoiceDetail /></RequireAuth>} />
      <Route path="/buscar" element={<RequireAuth><Search /></RequireAuth>} />
      <Route path="/webhooks" element={<RequireAuth><Webhooks /></RequireAuth>} />
      <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/diagnostico" element={<RequireAuth><DiagnosticPanel /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
