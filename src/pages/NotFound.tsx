import { Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            Page Not Found
          </h2>
          <p className="text-brand-text-muted mb-8">
            The page you're looking for doesn't exist in our Elevate Learn2Earn
            Workforce ecosystem.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-brand-info text-white py-3 px-6 rounded-lg hover:bg-brand-info-hover transition-colors flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Hub
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-white text-brand-text border border-brand-border-dark py-3 px-6 rounded-lg hover:bg-brand-surface transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>

        <div className="mt-8 text-sm text-brand-text-light">
          <p>
            Need help? Visit our{' '}
            <Link
              to="/connect"
              className="text-brand-info hover:text-brand-info"
            >
              Connect
            </Link>{' '}
            community for support.
          </p>
        </div>
      </div>
    </div>
  );
}
