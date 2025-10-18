import { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";
import ChatAssistant from "../components/ChatAssistant";

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="font-semibold text-brand-700">Elevate for Humanity</Link>
          <nav className="flex gap-6">
            {[
              { to: "/programs", label: "Programs" },
              { to: "/lms", label: "LMS" },
              { to: "/partners", label: "Partners" },
              { to: "/apply", label: "Apply" }
            ].map(i => (
              <NavLink key={i.to} to={i.to}
                className={({ isActive }) => `text-sm font-medium ${isActive ? "text-brand-700" : "text-slate-600 hover:text-slate-900"}`}>
                {i.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/apply" className="btn hidden sm:inline-flex">Apply Now</Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      
      {/* Chat Assistant */}
      <ChatAssistant />
      <footer className="mt-16 border-t">
        <div className="container py-10 text-sm text-slate-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>© {new Date().getFullYear()} Elevate for Humanity — Indianapolis, IN</div>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:underline">Privacy</a>
              <a href="/terms" className="hover:underline">Terms</a>
              <a href="/contact" className="hover:underline">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
