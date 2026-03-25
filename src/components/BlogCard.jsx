/**
 * BlogCard.jsx - Blog post preview card component for WriteSpace Blog
 *
 * Blog post card component for the blog list grid. Displays title, excerpt
 * (truncated content), formatted date, author avatar and name. Colorful top
 * border that cycles by index. Shows edit icon for Admin on all posts, for
 * Viewer only on own posts. Links to full post view. Responsive Tailwind styling.
 *
 * User Stories: SCRUM-10765
 */

import { Link } from 'react-router-dom';
import { getSession } from '../utils/auth';
import { canEditPost } from '../utils/rbac';
import { getAvatar } from './avatar';

/**
 * Array of top border colors that cycle by card index.
 * @type {string[]}
 */
const BORDER_COLORS = [
  'border-t-indigo-500',
  'border-t-violet-500',
  'border-t-pink-500',
  'border-t-emerald-500',
  'border-t-amber-500',
  'border-t-cyan-500',
];

/**
 * Truncate content to create an excerpt.
 * @param {string} content - The full post content.
 * @param {number} [maxLength=150] - Maximum excerpt length.
 * @returns {string} Truncated content with ellipsis if needed.
 */
function getExcerpt(content, maxLength = 150) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

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
 * Blog post preview card component.
 * Renders a card with colorful top border, title, excerpt, formatted date,
 * author avatar and name, and an edit icon if the current user has permission.
 *
 * @param {object} props
 * @param {object} props.post - The post object to display.
 * @param {string} props.post.id - The post id.
 * @param {string} props.post.title - The post title.
 * @param {string} props.post.content - The post content.
 * @param {string} props.post.author - The post author username.
 * @param {string} [props.post.authorDisplayName] - The post author display name.
 * @param {string} [props.post.authorRole] - The post author role.
 * @param {string} [props.post.createdAt] - The post creation date.
 * @param {number} [props.index=0] - The card index for border color cycling.
 * @returns {JSX.Element} The blog card element.
 */
export function BlogCard({ post, index = 0 }) {
  const session = getSession();
  const showEdit = canEditPost(post);
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];
  const authorRole = post.authorRole || 'viewer';
  const authorName = post.authorDisplayName || post.author || 'Unknown';

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 ${borderColor} hover:shadow-md transition-shadow flex flex-col`}
    >
      {/* Edit icon */}
      {showEdit && (
        <Link
          to={`/blogs/${post.id}/edit`}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          aria-label={`Edit post: ${post.title}`}
          onClick={(e) => e.stopPropagation()}
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
      )}

      {/* Card content linking to full post */}
      <Link
        to={`/blogs/${post.id}`}
        className="flex flex-col flex-1 p-5"
      >
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 pr-8">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 mb-4 flex-1">
          {getExcerpt(post.content)}
        </p>

        {/* Footer: author and date */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {getAvatar(authorRole)}
            <span className="text-sm font-medium text-gray-700">
              {authorName}
            </span>
          </div>

          {post.createdAt && (
            <span className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}