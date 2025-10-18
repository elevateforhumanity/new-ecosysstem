import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, type User } from '../../services/auth';

type Props = {
  children: React.ReactNode;
  requireRole?: string;
};

export default function ProtectedRoute({ children, requireRole }: Props) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="section">
        <div className="container">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requireRole && user.role !== requireRole) {
    return (
      <div className="section">
        <div className="container">
          <div className="card p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600">
              Access Denied
            </h2>
            <p className="mt-2 text-slate-600">
              You don't have permission to access this page.
            </p>
            <a href="/lms" className="btn mt-4">
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
