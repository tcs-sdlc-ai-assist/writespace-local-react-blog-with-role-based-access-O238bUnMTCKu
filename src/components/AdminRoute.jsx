/**
 * AdminRoute.jsx - Admin role route guard for WriteSpace Blog
 *
 * Route guard component that checks for admin role in session.
 * If no valid session exists, redirects to '/login'.
 * If user is not admin, redirects to '/blogs'.
 * Wraps children for admin-only routes. Uses auth.js and rbac.js helpers
 * to verify session state and role.
 *
 * User Stories: SCRUM-10770, SCRUM-10773
 */

import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { hasRole } from '../utils/rbac';

/**
 * Admin route guard component.
 * Checks if a valid authenticated session exists and if the user has admin role.
 * If not authenticated, redirects to the login page.
 * If authenticated but not admin, redirects to the blogs page.
 * Otherwise, renders the wrapped children.
 *
 * @param {object} props
 * @param {JSX.Element} props.children - The child components to render if user is admin.
 * @returns {JSX.Element} The children if admin, or a Navigate redirect to '/login' or '/blogs'.
 */
export function AdminRoute({ children }) {
  const session = getSession();
  const isAuthenticated =
    session !== null &&
    typeof session.username === 'string' &&
    session.username.length > 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('admin')) {
    return <Navigate to="/blogs" replace />;
  }

  return children;
}