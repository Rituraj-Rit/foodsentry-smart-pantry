import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><span className="spinner" />Restoring your pantry…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
