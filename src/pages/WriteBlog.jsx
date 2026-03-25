/**
 * WriteBlog.jsx - Blog post create and edit form page for WriteSpace Blog
 *
 * Blog create/edit form page at '/blogs/new' (create) and '/blogs/:id/edit' (edit).
 * Title and content fields with required validation and character counter.
 * Create mode: generates UUID, sets author info from session, saves via
 * blogModule.createPost(), redirects to post.
 * Edit mode: pre-fills form, enforces ownership (Viewer own only, Admin any),
 * updates via blogModule.updatePost().
 * Cancel button routes back. Uses AuthNavbar component.
 *
 * User Stories: SCRUM-10766
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthNavbar } from '../components/AuthNavbar';
import { getSession } from '../utils/auth';
import { getPostById, createPost, updatePost } from '../utils/blogModule';
import { canEditPost } from '../utils/rbac';

/**
 * Maximum allowed length for post title.
 * @type {number}
 */
const MAX_TITLE_LENGTH = 100;

/**
 * Maximum allowed length for post content.
 * @type {number}
 */
const MAX_CONTENT_LENGTH = 2000;

/**
 * Blog post create and edit form page component.
 * Renders the authenticated navbar and a form with title and content fields,
 * character counters, required validation, and submit/cancel buttons.
 * In edit mode, pre-fills the form and enforces ownership permissions.
 *
 * @returns {JSX.Element} The write/edit blog page element.
 */
export function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [noPermission, setNoPermission] = useState(false);

  // Load existing post data in edit mode
  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    try {
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        setNotFound(true);
        return;
      }

      const post = getPostById(id);
      if (!post) {
        setNotFound(true);
        return;
      }

      // Check edit permission
      if (!canEditPost(post)) {
        setNoPermission(true);
        return;
      }

      setTitle(post.title || '');
      setContent(post.content || '');
    } catch {
      console.error('[WriteBlog] Failed to load post for editing');
      setNotFound(true);
    }
  }, [id, isEditMode]);

  /**
   * Handle form submission. Validates fields and creates or updates the post.
   * On success, redirects to the post detail page.
   * On failure, shows inline error.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submit event.
   */
  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Client-side required validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length > MAX_TITLE_LENGTH) {
      setError(`Title must be at most ${MAX_TITLE_LENGTH} characters`);
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.trim().length > MAX_CONTENT_LENGTH) {
      setError(`Content must be at most ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    setLoading(true);

    if (isEditMode) {
      const result = updatePost(id, title, content);

      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Failed to update post');
        return;
      }

      navigate(`/blogs/${id}`, { replace: true });
    } else {
      const result = createPost(title, content);

      setLoading(false);

      if (!result.success) {
        setError(result.error || 'Failed to create post');
        return;
      }

      navigate(`/blogs/${result.post.id}`, { replace: true });
    }
  }

  /**
   * Handle cancel button click. Navigates back to the appropriate page.
   */
  function handleCancel() {
    if (isEditMode && id) {
      navigate(`/blogs/${id}`);
    } else {
      navigate('/blogs');
    }
  }

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
                The blog post you&apos;re trying to edit doesn&apos;t exist or
                may have been removed.
              </p>
              <Link
                to="/blogs"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Back to All Blogs
              </Link>
            </div>
          )}

          {/* No permission state */}
          {noPermission && !notFound && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4" aria-hidden="true">
                🔒
              </span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Permission denied
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                You don&apos;t have permission to edit this post.
              </p>
              <Link
                to="/blogs"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Back to All Blogs
              </Link>
            </div>
          )}

          {/* Form */}
          {!notFound && !noPermission && (
            <>
              {/* Back link */}
              <div className="mb-6">
                <Link
                  to={isEditMode && id ? `/blogs/${id}` : '/blogs'}
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
                  {isEditMode ? 'Back to Post' : 'Back to All Blogs'}
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                {/* Page header */}
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  {isEditMode ? 'Edit Post' : 'Write a New Post'}
                </h1>

                {/* Error banner */}
                {error && (
                  <div
                    className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Post form */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Title field */}
                  <div className="mb-4">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter your post title"
                      required
                      maxLength={MAX_TITLE_LENGTH}
                    />
                    <div className="flex justify-end mt-1">
                      <span
                        className={`text-xs ${
                          title.trim().length > MAX_TITLE_LENGTH
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      >
                        {title.trim().length}/{MAX_TITLE_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* Content field */}
                  <div className="mb-6">
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Content
                    </label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
                      placeholder="Write your blog post content here…"
                      required
                      rows={12}
                      maxLength={MAX_CONTENT_LENGTH}
                    />
                    <div className="flex justify-end mt-1">
                      <span
                        className={`text-xs ${
                          content.trim().length > MAX_CONTENT_LENGTH
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}
                      >
                        {content.trim().length}/{MAX_CONTENT_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? isEditMode
                          ? 'Saving…'
                          : 'Publishing…'
                        : isEditMode
                          ? 'Save Changes'
                          : 'Publish Post'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}