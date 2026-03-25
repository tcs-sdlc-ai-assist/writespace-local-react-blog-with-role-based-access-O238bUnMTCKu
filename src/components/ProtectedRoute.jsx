/**
 * ProtectedRoute.jsx - Authentication route guard for WriteSpace Blog
 *
 * Route guard component that checks for an authenticated session.
 * If no valid session exists, redirects to '/login'.
 * Wraps children for protected routes. Uses auth.js helpers to verify
 * session state.
 *
 * User Stories: SCRUM-10770, SCRUM-10773
 */

import { Navigate } from 'react-router-dom';
import { getSession } from '../utils/auth';

/**
 * Protected route guard component.
 * Checks if a valid authenticated session exists. If not, redirects
 * the user to the login page. Otherwise, renders the wrapped children.
 *
 * @param {object} props
 * @param {JSX.Element} props.children - The child components to render if authenticated.
 * @returns {JSX.Element} The children if authenticated, or a Navigate redirect to '/login'.
 */
export function ProtectedRoute({ children }) {
  const session = getSession();
  const isAuthenticated =
    session !== null &&
    typeof session.username === 'string' &&
    session.username.length > 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}