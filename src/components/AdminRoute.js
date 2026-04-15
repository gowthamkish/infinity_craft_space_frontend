import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RouteLoader } from './Loader';

export default function AdminRoute({ children }) {
  const { user, loading } = useSelector(state => state.auth);

  if (loading) return <RouteLoader />;

  return user && user.isAdmin ? children : <Navigate to="/login" />;
}
