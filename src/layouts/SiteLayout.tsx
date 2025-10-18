import { PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ChatAssistant from '../components/ChatAssistant';

export default function SiteLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-brand-700">
                Elevate for Humanity
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {[
                { to: '/programs', label: 'Programs' },
                { to: '/lms', label: 'LMS' },
                { to: '/partners', label: 'Partners' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-brand-600 ${
                      isActive ? 'text-brand-700' : 'text-slate-700'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="text-sm font-medium text-slate-700 hover:text-brand-600 hidden sm:inline-flex"
              >
                Sign In
              </Link>
              <Link to="/apply" className="btn">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Chat Assistant */}
      <ChatAssistant />
      <footer className="mt-16 border-t">
        <div className="container py-10 text-sm text-slate-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              © {new Date().getFullYear()} Elevate for Humanity — Indianapolis,
              IN
            </div>
            <div className="flex gap-4">
              <a href="/privacy" className="hover:underline">
                Privacy
              </a>
              <a href="/terms" className="hover:underline">
                Terms
              </a>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
