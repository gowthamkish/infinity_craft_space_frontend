import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RouteLoader } from './Loader';
import AdminErrorBoundary from './AdminErrorBoundary';

export default function AdminRoute({ children }) {
  const { user, loading } = useSelector(state => state.auth);

  if (loading) return <RouteLoader />;

  if (!user || !user.isAdmin) return <Navigate to="/login" />;

  return <AdminErrorBoundary>{children}</AdminErrorBoundary>;
}
