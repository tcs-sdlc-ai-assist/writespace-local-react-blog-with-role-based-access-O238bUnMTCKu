/**
 * PublicNavbar.jsx - Public-facing navigation bar for WriteSpace Blog
 *
 * Navbar component for the public landing page. Shows WriteSpace logo linking to '/'.
 * For guests: displays 'Login' and 'Get Started' buttons.
 * For authenticated users: shows avatar chip with display name and dashboard button
 * (Admin → /admin, Viewer → /blogs).
 * Sticky, white background with shadow and border. Responsive with Tailwind.
 *
 * User Stories: SCRUM-10762, SCRUM-10760
 */

import { Link } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { getAvatar } from './avatar';

/**
 * Public navigation bar component.
 * Renders a sticky top navbar with logo, and either guest buttons or
 * authenticated user chip with dashboard link based on session state.
 *
 * @returns {JSX.Element} The public navbar element.
 */
export function PublicNavbar() {
  const session = getSession();
  const isLoggedIn =
    session !== null &&
    typeof session.username === 'string' &&
    session.username.length > 0;

  /**
   * Determine the dashboard path based on user role.
   * Admin → /admin, Viewer → /blogs.
   * @returns {string} The dashboard route path.
   */
  function getDashboardPath() {
    if (session && session.role === 'admin') {
      return '/admin';
    }
    return '/blogs';
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            WriteSpace
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Avatar chip with display name */}
                <div className="flex items-center gap-2">
                  {getAvatar(session.role)}
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {session.displayName || session.username}
                  </span>
                </div>

                {/* Dashboard button */}
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                {/* Login button */}
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                >
                  Login
                </Link>

                {/* Get Started button */}
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}