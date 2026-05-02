import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from './Spinner.jsx';

const ProtectedRoute = () => {
  const { user, booting } = useAuth();

  if (booting) return <Spinner fullScreen />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
