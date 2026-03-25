/**
 * UserManagement.jsx - Admin user management page for WriteSpace Blog
 *
 * Admin-only user management page at route '/admin/users'. Responsive table
 * (desktop) / cards (mobile) showing all users with avatar, display name,
 * username, role badge, created date, and delete button. Create user form
 * with display name, username, password, confirm password, and role select
 * fields with validation. Hard-coded admin delete button disabled with tooltip.
 * Logged-in admin cannot delete own account. Uses AuthNavbar and userModule functions.
 *
 * User Stories: SCRUM-10768
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthNavbar } from '../components/AuthNavbar';
import { getAvatar } from '../components/avatar';
import { getSession } from '../utils/auth';
import { getAllUsers, createUser, deleteUser } from '../utils/userModule';

/**
 * Hard-coded admin username that cannot be deleted.
 * @type {string}
 */
const HARDCODED_ADMIN_USERNAME = 'admin';

/**
 * Format an ISO date string to a human-readable format.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted date string, or empty string if invalid.
 */
function formatDate(dateString) {
  try {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Admin user management page component.
 * Renders the authenticated navbar, gradient banner, create user form,
 * and a responsive user list (table on desktop, cards on mobile).
 * Redirects non-admin users to '/blogs'.
 *
 * @returns {JSX.Element} The user management page element.
 */
export function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('viewer');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirmUsername, setDeleteConfirmUsername] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const session = getSession();

  // Redirect non-admin users
  useEffect(() => {
    const currentSession = getSession();
    if (
      !currentSession ||
      typeof currentSession.username !== 'string' ||
      currentSession.username.length === 0
    ) {
      navigate('/login', { replace: true });
      return;
    }

    if (currentSession.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }
  }, [navigate]);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Load all users from storage.
   */
  function loadUsers() {
    try {
      const result = getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setUsers([]);
      }
    } catch {
      console.error('[UserManagement] Failed to load users');
      setUsers([]);
    }
  }

  /**
   * Handle create user form submission.
   * Validates fields and creates a new user via userModule.createUser().
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleCreateSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Client-side required validation
    if (!displayName.trim()) {
      setFormError('Display name is required');
      return;
    }

    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }

    if (!password) {
      setFormError('Password is required');
      return;
    }

    if (!confirmPassword) {
      setFormError('Please confirm the password');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    setFormLoading(true);

    const result = createUser(username, displayName, password, role);

    setFormLoading(false);

    if (!result.success) {
      setFormError(result.error || 'Failed to create user');
      return;
    }

    setFormSuccess(`User "${result.user.username}" created successfully`);
    setDisplayName('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setRole('viewer');

    // Refresh users list
    loadUsers();
  }

  /**
   * Handle delete button click. Shows confirmation dialog.
   * @param {string} targetUsername - The username of the user to delete.
   */
  function handleDeleteClick(targetUsername) {
    setDeleteError('');
    setDeleteConfirmUsername(targetUsername);
  }

  /**
   * Handle delete confirmation. Deletes the user and refreshes the list.
   */
  function handleDeleteConfirm() {
    setDeleteError('');

    const result = deleteUser(deleteConfirmUsername);

    if (!result.success) {
      setDeleteError(result.error || 'Failed to delete user');
      setDeleteConfirmUsername(null);
      return;
    }

    setDeleteConfirmUsername(null);

    // Refresh users list
    loadUsers();
  }

  /**
   * Handle delete cancellation. Hides confirmation dialog.
   */
  function handleDeleteCancel() {
    setDeleteConfirmUsername(null);
    setDeleteError('');
  }

  /**
   * Check if the delete button should be disabled for a given user.
   * Disabled for hard-coded admin and for the currently logged-in user.
   * @param {object} user - The user object.
   * @returns {boolean} True if delete should be disabled.
   */
  function isDeleteDisabled(user) {
    if (user.username === HARDCODED_ADMIN_USERNAME) {
      return true;
    }
    if (session && user.username === session.username) {
      return true;
    }
    return false;
  }

  /**
   * Get tooltip text for a disabled delete button.
   * @param {object} user - The user object.
   * @returns {string} Tooltip text explaining why delete is disabled.
   */
  function getDeleteTooltip(user) {
    if (user.username === HARDCODED_ADMIN_USERNAME) {
      return 'Cannot delete the default admin account';
    }
    if (session && user.username === session.username) {
      return 'Cannot delete your own account';
    }
    return `Delete user: ${user.username}`;
  }

  // Build full user list including hard-coded admin
  const hardcodedAdmin = {
    username: HARDCODED_ADMIN_USERNAME,
    displayName: 'Admin',
    role: 'admin',
    createdAt: null,
  };

  const allUsers = [hardcodedAdmin, ...users];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AuthNavbar />

      <main className="flex-1 w-full">
        {/* Gradient banner */}
        <div className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              User Management
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              Create and manage user accounts for your blog platform.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Delete error banner */}
          {deleteError && (
            <div
              className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
              role="alert"
            >
              {deleteError}
            </div>
          )}

          {/* Create user form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Create New User
            </h2>

            {/* Form error banner */}
            {formError && (
              <div
                className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
                role="alert"
              >
                {formError}
              </div>
            )}

            {/* Form success banner */}
            {formSuccess && (
              <div
                className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-md"
                role="status"
              >
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Display name field */}
                <div>
                  <label
                    htmlFor="createDisplayName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Display Name
                  </label>
                  <input
                    id="createDisplayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter display name"
                    required
                    autoComplete="name"
                  />
                </div>

                {/* Username field */}
                <div>
                  <label
                    htmlFor="createUsername"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <input
                    id="createUsername"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter username"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password field */}
                <div>
                  <label
                    htmlFor="createPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    id="createPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm password field */}
                <div>
                  <label
                    htmlFor="createConfirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="createConfirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Confirm password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Role select field */}
              <div className="mb-6">
                <label
                  htmlFor="createRole"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="createRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {formLoading ? 'Creating…' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Users list */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Users ({allUsers.length})
              </h2>
            </div>

            {allUsers.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {allUsers.map((user) => (
                        <tr key={user.username} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getAvatar(user.role)}
                              <span className="text-sm font-medium text-gray-900">
                                {user.displayName || user.username}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {user.username}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {user.role === 'admin' ? 'Admin' : 'Viewer'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">
                              {user.createdAt
                                ? formatDate(user.createdAt)
                                : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              className={`p-1.5 rounded-md transition-colors ${
                                isDeleteDisabled(user)
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              onClick={() =>
                                !isDeleteDisabled(user) &&
                                handleDeleteClick(user.username)
                              }
                              disabled={isDeleteDisabled(user)}
                              title={getDeleteTooltip(user)}
                              aria-label={getDeleteTooltip(user)}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {allUsers.map((user) => (
                    <div
                      key={user.username}
                      className="px-6 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {getAvatar(user.role)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                              {user.displayName || user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {user.role === 'admin' ? 'Admin' : 'Viewer'}
                          </span>
                          {user.createdAt && (
                            <span className="text-xs text-gray-400">
                              {formatDate(user.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${
                          isDeleteDisabled(user)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        onClick={() =>
                          !isDeleteDisabled(user) &&
                          handleDeleteClick(user.username)
                        }
                        disabled={isDeleteDisabled(user)}
                        title={getDeleteTooltip(user)}
                        aria-label={getDeleteTooltip(user)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3" aria-hidden="true">
                  👥
                </span>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  No users yet
                </h3>
                <p className="text-sm text-gray-600">
                  Create your first user using the form above.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation dialog */}
      {deleteConfirmUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete user &quot;{deleteConfirmUsername}
              &quot;? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}