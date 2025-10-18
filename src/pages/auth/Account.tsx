import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, signOut } from "../../services/auth";
import { supa } from "../../services/supa";

export default function Account() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setName(user?.full_name ?? "");
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supa
        .from("profiles")
        .upsert({ id: user.id, full_name: name });
      if (error) throw error;
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container max-w-xl mx-auto">
          <div className="card p-6 text-center">Loading...</div>
        </div>
      </section>
    );
  }

  if (!user) {
    navigate("/auth/login");
    return null;
  }

  return (
    <section className="section">
      <div className="container max-w-xl mx-auto">
        <h1 className="text-3xl font-bold">My Account</h1>

        <div className="card p-6 mt-6 space-y-4">
          <div>
            <div className="text-sm text-slate-500">Email</div>
            <div className="font-medium">{user.email}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Role</div>
            <div className="font-medium capitalize">{user.role}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {message && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg text-sm">
              {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              className="btn"
              onClick={save}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn-outline" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>

        {user.role === "instructor" && (
          <div className="mt-6 card p-6">
            <h2 className="text-xl font-semibold">Instructor Tools</h2>
            <p className="mt-2 text-slate-600">
              Manage your courses and lessons
            </p>
            <a href="/instructor/dashboard" className="btn mt-4 inline-block">
              Go to Instructor Dashboard
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
