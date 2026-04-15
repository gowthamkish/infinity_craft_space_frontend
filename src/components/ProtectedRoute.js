import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

export default function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}