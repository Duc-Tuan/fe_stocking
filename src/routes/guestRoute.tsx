// src/routes/GuestRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { RootState } from '../store';

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
