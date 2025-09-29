/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              Elevate for Humanity
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/programs" className="text-gray-500 hover:text-gray-900">
              Programs
            </Link>
            <Link to="/student-hub" className="text-gray-500 hover:text-gray-900">
              Students
            </Link>
            <Link to="/business-hub" className="text-gray-500 hover:text-gray-900">
              Business
            </Link>
            <Link to="/educator-hub" className="text-gray-500 hover:text-gray-900">
              Educators
            </Link>
            <Link to="/community-hub" className="text-gray-500 hover:text-gray-900">
              Community
            </Link>
            <Link to="/connect" className="text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}