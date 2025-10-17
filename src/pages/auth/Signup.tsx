import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "../../services/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
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
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold">Check Your Email</h2>
            <p className="mt-2 text-slate-600">
              We sent a confirmation link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Click the link to verify your account and start learning.
            </p>
            <Link to="/auth/login" className="btn mt-4">
              Go to Login
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
          <h1 className="text-2xl font-bold text-center">Create Account</h1>
          <p className="mt-2 text-center text-slate-600">
            Start your learning journey
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
                minLength={6}
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                At least 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
                required
              />
            </div>

            <button type="submit" className="btn w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
