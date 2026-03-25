/**
 * AdminDashboard.jsx - Admin overview dashboard page for WriteSpace Blog
 *
 * Admin-only dashboard at route '/admin'. Displays four stat cards showing
 * counts: total posts, total users, admins, viewers. Quick action buttons:
 * Write New Post, Manage Users. Recent posts section showing 5 most recent
 * posts with edit/delete controls. Gradient banner at top. Non-admin users
 * redirected to '/blogs'. Uses AuthNavbar component.
 *
 * User Stories: SCRUM-10763
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthNavbar } from '../components/AuthNavbar';
import { getAvatar } from '../components/avatar';
import { getSession } from '../utils/auth';
import { getAllPosts, deletePost } from '../utils/blogModule';
import { getAllUsers } from '../utils/userModule';

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
 * Truncate content to create an excerpt.
 * @param {string} content - The full post content.
 * @param {number} [maxLength=80] - Maximum excerpt length.
 * @returns {string} Truncated content with ellipsis if needed.
 */
function getExcerpt(content, maxLength = 80) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Admin overview dashboard page component.
 * Renders the authenticated navbar, gradient banner, stat cards, quick actions,
 * and recent posts section with edit/delete controls.
 * Redirects non-admin users to '/blogs'.
 *
 * @returns {JSX.Element} The admin dashboard page element.
 */
export function AdminDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Redirect non-admin users
  useEffect(() => {
    const session = getSession();
    if (
      !session ||
      typeof session.username !== 'string' ||
      session.username.length === 0
    ) {
      navigate('/login', { replace: true });
      return;
    }

    if (session.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }
  }, [navigate]);

  // Load data
  useEffect(() => {
    try {
      const allPosts = getAllPosts();
      setPosts(allPosts);
    } catch {
      console.error('[AdminDashboard] Failed to load posts');
      setPosts([]);
    }

    try {
      const result = getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      } else {
        setUsers([]);
      }
    } catch {
      console.error('[AdminDashboard] Failed to load users');
      setUsers([]);
    }
  }, []);

  // Compute stats
  const totalPosts = posts.length;
  // +1 for hard-coded admin who is not in localStorage users
  const totalUsers = users.length + 1;
  const adminCount =
    users.filter((u) => u.role === 'admin').length + 1;
  const viewerCount = users.filter((u) => u.role === 'viewer').length;

  const recentPosts = posts.slice(0, 5);

  /**
   * Handle delete button click. Shows confirmation dialog.
   * @param {string} postId - The post id to delete.
   */
  function handleDeleteClick(postId) {
    setDeleteError('');
    setDeleteConfirmId(postId);
  }

  /**
   * Handle delete confirmation. Deletes the post and refreshes the list.
   */
  function handleDeleteConfirm() {
    setDeleteError('');

    const result = deletePost(deleteConfirmId);

    if (!result.success) {
      setDeleteError(result.error || 'Failed to delete post');
      setDeleteConfirmId(null);
      return;
    }

    setDeleteConfirmId(null);

    // Refresh posts
    try {
      const allPosts = getAllPosts();
      setPosts(allPosts);
    } catch {
      console.error('[AdminDashboard] Failed to refresh posts');
      setPosts([]);
    }
  }

  /**
   * Handle delete cancellation. Hides confirmation dialog.
   */
  function handleDeleteCancel() {
    setDeleteConfirmId(null);
    setDeleteError('');
  }

  /**
   * Stat card data.
   * @type {Array<{ label: string, value: number, icon: string, color: string }>}
   */
  const stats = [
    {
      label: 'Total Posts',
      value: totalPosts,
      icon: '📝',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      icon: '👥',
      color: 'bg-violet-50 text-violet-700 border-violet-200',
    },
    {
      label: 'Admins',
      value: adminCount,
      icon: '👑',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'Viewers',
      value: viewerCount,
      icon: '📖',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AuthNavbar />

      <main className="flex-1 w-full">
        {/* Gradient banner */}
        <div className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Admin Dashboard
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              Manage your blog platform at a glance.
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

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg border p-5 ${stat.color}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl" aria-hidden="true">
                    {stat.icon}
                  </span>
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm font-medium mt-1 opacity-80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <Link
              to="/blogs/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
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
              Write New Post
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Manage Users
            </Link>
          </div>

          {/* Recent posts section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Posts
                </h2>
                <Link
                  to="/blogs"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View All
                </Link>
              </div>
            </div>

            {recentPosts.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentPosts.map((post) => {
                  const authorRole = post.authorRole || 'viewer';
                  const authorName =
                    post.authorDisplayName || post.author || 'Unknown';

                  return (
                    <div
                      key={post.id}
                      className="px-6 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/blogs/${post.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {getExcerpt(post.content)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getAvatar(authorRole)}
                          <span className="text-xs font-medium text-gray-600">
                            {authorName}
                          </span>
                          {post.createdAt && (
                            <span className="text-xs text-gray-400">
                              · {formatDate(post.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          to={`/blogs/${post.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          aria-label={`Edit post: ${post.title}`}
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          onClick={() => handleDeleteClick(post.id)}
                          aria-label={`Delete post: ${post.title}`}
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3" aria-hidden="true">
                  ✍️
                </span>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  No posts yet
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get started by writing the first blog post.
                </p>
                <Link
                  to="/blogs/new"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Write Your First Post
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Post
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
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