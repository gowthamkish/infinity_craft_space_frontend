import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const { user } = useSelector(state => state.auth);
  const token = useSelector(state => state.auth.token);
  debugger;
  return user && user.isAdmin && token ? children : <Navigate to="/login" />;
};
