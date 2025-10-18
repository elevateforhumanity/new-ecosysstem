import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, signInWithMagicLink } from "../../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/lms");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <section className="section">
        <div className="container max-w-md mx-auto">
          <div className="card p-6 text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-semibold">Check Your Email</h2>
            <p className="mt-2 text-slate-600">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Click the link in the email to sign in.
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="btn-outline mt-4"
            >
              Back to Login
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container max-w-md mx-auto">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-center">Welcome Back!</h1>
          <p className="mt-2 text-center text-slate-600">
            Sign in to continue your learning journey
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
                placeholder="you@example.com"
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
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-full"
              disabled={loading}
            >
              {loading ? "Signing you in..." : "Sign In →"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleMagicLink}
              className="text-sm text-brand-600 hover:text-brand-700"
              disabled={loading}
            >
              Send magic link instead
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-slate-600">
            <Link to="/auth/forgot-password" className="hover:text-brand-600">
              Forgot password?
            </Link>
            {" · "}
            <Link to="/auth/signup" className="hover:text-brand-600">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
