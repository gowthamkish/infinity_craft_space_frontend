import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RouteLoader } from './Loader';

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) return <RouteLoader />;

  return user ? children : <Navigate to="/login" />;
}
