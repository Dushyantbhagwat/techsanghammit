import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Set this to true to bypass authentication
const DEVELOPMENT_MODE = true;

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user && !DEVELOPMENT_MODE) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}