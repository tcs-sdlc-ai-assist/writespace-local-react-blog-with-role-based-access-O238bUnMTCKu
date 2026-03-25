/**
 * NotFound.jsx - 404 not found page for WriteSpace Blog
 *
 * Custom 404 page for invalid routes. Displays a friendly 'Page Not Found'
 * message with a link back to home. Styled with Tailwind centered layout
 * and gradient background matching the app theme.
 *
 * User Stories: SCRUM-10770
 */

import { Link } from 'react-router-dom';
import { getSession } from '../utils/auth';

/**
 * 404 Not Found page component.
 * Renders a centered layout with a friendly message and a link back to
 * the appropriate home page based on authentication state.
 *
 * @returns {JSX.Element} The 404 not found page element.
 */
export function NotFound() {
  const session = getSession();
  const isAuthenticated =
    session !== null &&
    typeof session.username === 'string' &&
    session.username.length > 0;

  /**
   * Determine the home path based on authentication state and role.
   * Authenticated admin → /admin, authenticated viewer → /blogs, guest → /.
   * @returns {string} The home route path.
   */
  function getHomePath() {
    if (isAuthenticated) {
      if (session.role === 'admin') {
        return '/admin';
      }
      return '/blogs';
    }
    return '/';
  }

  /**
   * Get the label for the home link based on authentication state.
   * @returns {string} The home link label.
   */
  function getHomeLabel() {
    if (isAuthenticated) {
      return 'Back to Dashboard';
    }
    return 'Back to Home';
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-600 to-violet-600">
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* 404 icon */}
            <span className="text-6xl mb-4 block" aria-hidden="true">
              🔍
            </span>

            {/* Error code */}
            <h1 className="text-5xl font-bold text-indigo-600 mb-4">404</h1>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Page Not Found
            </h2>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or may have
              been moved. Let&apos;s get you back on track.
            </p>

            {/* Home link */}
            <Link
              to={getHomePath()}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {getHomeLabel()}
            </Link>

            {/* Brand */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                to="/"
                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                WriteSpace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}