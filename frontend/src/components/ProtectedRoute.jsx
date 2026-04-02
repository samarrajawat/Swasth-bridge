import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirectMap = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
    return <Navigate to={redirectMap[user?.role] || '/login'} replace />;
  }
  return children;
};

export default ProtectedRoute;
