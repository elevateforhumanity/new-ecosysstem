import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="section">
        <div className="container max-w-md mx-auto">
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-semibold">Check Your Email</h2>
            <p className="mt-2 text-slate-600">
              We sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Click the link to reset your password.
            </p>
            <Link to="/auth/login" className="btn mt-4">
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-md mx-auto">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="mt-2 text-center text-slate-600">
            Enter your email to receive a reset link
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
                required
              />
            </div>

            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-600">
            <Link to="/auth/login" className="hover:text-brand-600">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
