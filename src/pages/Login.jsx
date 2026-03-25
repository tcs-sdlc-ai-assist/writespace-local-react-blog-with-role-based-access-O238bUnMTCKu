/**
 * Login.jsx - User login page for WriteSpace Blog
 *
 * Login page at route '/login'. Centered card UI with gradient background.
 * Username and password fields with required validation. Checks hard-coded
 * admin (admin/admin) first, then localStorage users via authModule.login().
 * On success: writes session and redirects (Admin → /admin, Viewer → /blogs).
 * Shows inline error on failure. Link to registration page.
 * Redirects authenticated users away.
 *
 * User Stories: SCRUM-10760
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { login } from '../utils/authModule';

/**
 * Login page component.
 * Renders a centered login card with gradient background, username/password
 * fields, inline error display, and a link to the registration page.
 * Redirects already-authenticated users to their appropriate dashboard.
 *
 * @returns {JSX.Element} The login page element.
 */
export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect authenticated users away
  useEffect(() => {
    const session = getSession();
    if (
      session !== null &&
      typeof session.username === 'string' &&
      session.username.length > 0
    ) {
      if (session.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    }
  }, [navigate]);

  /**
   * Handle form submission. Validates fields and attempts login.
   * On success, redirects based on role. On failure, shows inline error.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side required validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    const result = login(username, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      return;
    }

    // Redirect based on role
    if (result.session && result.session.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/blogs', { replace: true });
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-600 to-violet-600">
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Logo / Brand */}
            <div className="text-center mb-8">
              <Link
                to="/"
                className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                WriteSpace
              </Link>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your account
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Username field */}
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                />
              </div>

              {/* Password field */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Registration link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}