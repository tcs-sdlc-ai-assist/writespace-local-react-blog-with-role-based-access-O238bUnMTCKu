/**
 * ReadBlog.jsx - Single blog post detail/reader page for WriteSpace Blog
 *
 * Full blog post reader at route '/blogs/:id'. Displays title, author avatar/name,
 * formatted date, and full content. Admin sees edit/delete buttons on all posts;
 * Viewer sees them only on own posts. Delete triggers confirmation dialog before
 * removing post via blogModule.deletePost(). Handles invalid/missing ID with
 * 'Post not found' message. Uses AuthNavbar component.
 *
 * User Stories: SCRUM-10767
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthNavbar } from '../components/AuthNavbar';
import { getAvatar } from '../components/avatar';
import { getPostById, deletePost } from '../utils/blogModule';
import { canEditPost, canDeletePost } from '../utils/rbac';

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
 * Single blog post detail/reader page component.
 * Renders the authenticated navbar and the full blog post with title,
 * author info, formatted date, and content. Shows edit/delete buttons
 * based on permissions. Handles missing posts with a not-found message.
 *
 * @returns {JSX.Element} The read blog page element.
 */
export function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    try {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        setNotFound(true);
        return;
      }

      const foundPost = getPostById(id);
      if (!foundPost) {
        setNotFound(true);
        return;
      }

      setPost(foundPost);
    } catch {
      console.error('[ReadBlog] Failed to load post');
      setNotFound(true);
    }
  }, [id]);

  /**
   * Handle delete button click. Shows confirmation dialog.
   */
  function handleDeleteClick() {
    setDeleteError('');
    setShowDeleteConfirm(true);
  }

  /**
   * Handle delete confirmation. Deletes the post and navigates to blogs list.
   */
  function handleDeleteConfirm() {
    setDeleteError('');

    const result = deletePost(id);

    if (!result.success) {
      setDeleteError(result.error || 'Failed to delete post');
      setShowDeleteConfirm(false);
      return;
    }

    setShowDeleteConfirm(false);
    navigate('/blogs', { replace: true });
  }

  /**
   * Handle delete cancellation. Hides confirmation dialog.
   */
  function handleDeleteCancel() {
    setShowDeleteConfirm(false);
    setDeleteError('');
  }

  const showEdit = post ? canEditPost(post) : false;
  const showDelete = post ? canDeletePost(post) : false;
  const authorRole = post?.authorRole || 'viewer';
  const authorName = post?.authorDisplayName || post?.author || 'Unknown';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AuthNavbar />

      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Not found state */}
          {notFound && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4" aria-hidden="true">
                📄
              </span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Post not found
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                The blog post you&apos;re looking for doesn&apos;t exist or may
                have been removed.
              </p>
              <Link
                to="/blogs"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Back to All Blogs
              </Link>
            </div>
          )}

          {/* Post content */}
          {post && !notFound && (
            <article>
              {/* Back link */}
              <div className="mb-6">
                <Link
                  to="/blogs"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  Back to All Blogs
                </Link>
              </div>

              {/* Delete error banner */}
              {deleteError && (
                <div
                  className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
                  role="alert"
                >
                  {deleteError}
                </div>
              )}

              {/* Post header */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {post.title}
                </h1>

                {/* Author and date */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {getAvatar(authorRole)}
                    <span className="text-sm font-medium text-gray-700">
                      {authorName}
                    </span>
                  </div>

                  {post.createdAt && (
                    <span className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </span>
                  )}
                </div>

                {/* Full content */}
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>

                {/* Action buttons */}
                {(showEdit || showDelete) && (
                  <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                    {showEdit && (
                      <Link
                        to={`/blogs/${post.id}/edit`}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </Link>
                    )}

                    {showDelete && (
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                        onClick={handleDeleteClick}
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Delete confirmation dialog */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Delete Post
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Are you sure you want to delete this post? This action
                      cannot be undone.
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
            </article>
          )}
        </div>
      </main>
    </div>
  );
}