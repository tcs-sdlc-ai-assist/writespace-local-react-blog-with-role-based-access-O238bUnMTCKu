/**
 * AuthNavbar.jsx - Authenticated navigation bar for WriteSpace Blog
 *
 * Authenticated navbar component for all protected pages. Shows logo,
 * role-based nav links (Admin: All Blogs, Write, Users; Viewer: All Blogs, Write),
 * active link highlighting based on current route, avatar chip with display name,
 * logout dropdown. Hamburger toggle for mobile without external libraries.
 * Sticky positioning with Tailwind styling.
 *
 * User Stories: SCRUM-10762, SCRUM-10763, SCRUM-10764
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { logout } from '../utils/authModule';
import { getAvatar } from './avatar';

/**
 * Get navigation links based on user role.
 * Admin: All Blogs, Write, Users.
 * Viewer: All Blogs, Write.
 *
 * @param {'admin' | 'viewer'} role - The user role.
 * @returns {Array<{ label: string, to: string }>} Array of nav link objects.
 */
function getNavLinks(role) {
  const links = [
    { label: 'All Blogs', to: '/blogs' },
    { label: 'Write', to: '/blogs/new' },
  ];

  if (role === 'admin') {
    links.push({ label: 'Users', to: '/admin' });
  }

  return links;
}

/**
 * Authenticated navigation bar component.
 * Renders a sticky top navbar with logo, role-based nav links with active
 * highlighting, avatar chip with display name, logout dropdown, and
 * hamburger toggle for mobile.
 *
 * @returns {JSX.Element} The authenticated navbar element.
 */
export function AuthNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const session = getSession();
  const role = session?.role || 'viewer';
  const displayName = session?.displayName || session?.username || 'User';
  const navLinks = getNavLinks(role);

  /**
   * Check if a nav link is active based on the current route.
   * @param {string} to - The link path.
   * @returns {boolean} True if the link matches the current route.
   */
  function isActive(to) {
    if (to === '/blogs') {
      return location.pathname === '/blogs';
    }
    return location.pathname.startsWith(to);
  }

  /**
   * Handle logout action. Clears session and navigates to login.
   */
  function handleLogout() {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  }

  /**
   * Toggle mobile menu visibility.
   */
  function toggleMobileMenu() {
    setMobileMenuOpen((prev) => !prev);
    setDropdownOpen(false);
  }

  /**
   * Toggle user dropdown visibility.
   */
  function toggleDropdown() {
    setDropdownOpen((prev) => !prev);
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/blogs"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            WriteSpace
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.to)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop avatar chip and dropdown */}
          <div className="hidden md:flex items-center gap-3 relative">
            <button
              type="button"
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              onClick={toggleDropdown}
              aria-label="User menu"
            >
              {getAvatar(role)}
              <span className="text-sm font-medium text-gray-700">
                {displayName}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(link.to)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              {getAvatar(role)}
              <span className="text-sm font-medium text-gray-700">
                {displayName}
              </span>
            </div>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}