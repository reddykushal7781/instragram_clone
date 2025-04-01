import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import SpinLoader from '../components/Layouts/SpinLoader';

const PrivateRoute = ({ children }) => {
  const { loading, isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();

  if (loading) {
    return <SpinLoader />;
  }

  if (!isAuthenticated && !['/login', '/register'].includes(location.pathname)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;