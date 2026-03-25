/**
 * Footer.jsx - Landing page footer component for WriteSpace Blog
 *
 * Footer component for the landing page. Contains required links
 * (About, Privacy, Terms placeholder links) and copyright notice.
 * Styled with Tailwind dark background and light text.
 *
 * User Stories: SCRUM-10760
 */

import { Link } from 'react-router-dom';

/**
 * Footer component for the landing page.
 * Renders a dark-themed footer with placeholder links (About, Privacy, Terms)
 * and a copyright notice.
 *
 * @returns {JSX.Element} The footer element.
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo / Brand */}
          <Link
            to="/"
            className="text-lg font-bold text-white hover:text-indigo-400 transition-colors"
          >
            WriteSpace
          </Link>

          {/* Placeholder links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-6 border-t border-gray-700 pt-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} WriteSpace. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}