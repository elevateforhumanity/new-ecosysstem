import React from 'react'

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl h-16 px-4 flex items-center justify-between">
          <a href="/" className="font-semibold text-xl">
            Elevate for Humanity
          </a>
          <div className="hidden md:flex gap-6 items-center">
            <a href="/programs" className="hover:text-blue-600 transition-colors">
              Programs
            </a>
            <a href="/lms" className="hover:text-blue-600 transition-colors">
              LMS
            </a>
            <a href="/about" className="hover:text-blue-600 transition-colors">
              About
            </a>
            <a href="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </a>
            <a 
              href="/get-started" 
              className="px-4 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 py-8 border-t">
        <div className="text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Elevate for Humanity. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
