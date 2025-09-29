/*
  Copyright (c) 2025 Elevate for Humanity
  Commercial License. No resale, sublicensing, or redistribution allowed.
  See LICENSE file for details.
*/
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link to="/privacy-policy" className="text-gray-400 hover:text-gray-500">
            Privacy
          </Link>
          <Link to="/terms" className="text-gray-400 hover:text-gray-500">
            Terms
          </Link>
          <Link to="/connect" className="text-gray-400 hover:text-gray-500">
            Contact
          </Link>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">
            &copy; 2025 Elevate for Humanity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}