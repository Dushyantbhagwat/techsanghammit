import { Navigate, useLocation } from 'react-router-dom';

// Static credentials check
const isAuthenticated = () => {
  const storedEmail = sessionStorage.getItem('userEmail');
  return storedEmail === 'dbit@gmail.com';
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}