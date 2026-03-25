/**
 * Landing.jsx - Public landing page for WriteSpace Blog
 *
 * Public landing page at route '/'. Contains hero section with app name,
 * tagline, and CTA buttons (Get Started, Login). Features section with
 * three descriptive cards. Latest posts preview showing up to 3 most recent
 * posts from localStorage. Uses PublicNavbar and Footer components.
 * Fully responsive Tailwind layout.
 *
 * User Stories: SCRUM-10760
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PublicNavbar } from '../components/PublicNavbar';
import { Footer } from '../components/Footer';
import { getAllPosts } from '../utils/blogModule';
import { getAvatar } from '../components/avatar';

/**
 * Feature card data for the features section.
 * @type {Array<{ title: string, description: string, icon: string }>}
 */
const FEATURES = [
  {
    title: 'Write Freely',
    description:
      'Express your thoughts with a clean, distraction-free writing experience. Create and publish blog posts in seconds.',
    icon: '✍️',
  },
  {
    title: 'Role-Based Access',
    description:
      'Admins manage users and all content. Viewers create and edit their own posts. Simple, secure, and organized.',
    icon: '🔐',
  },
  {
    title: 'Instant Publishing',
    description:
      'No setup required. Your posts are saved locally and available immediately. Start sharing your ideas right away.',
    icon: '🚀',
  },
];

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
 * @param {number} [maxLength=120] - Maximum excerpt length.
 * @returns {string} Truncated content with ellipsis if needed.
 */
function getExcerpt(content, maxLength = 120) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  if (content.length <= maxLength) {
    return content;
  }
  return content.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Public landing page component.
 * Renders the hero section, features section, latest posts preview,
 * and uses PublicNavbar and Footer components.
 *
 * @returns {JSX.Element} The landing page element.
 */
export function Landing() {
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    try {
      const posts = getAllPosts();
      setLatestPosts(posts.slice(0, 3));
    } catch {
      console.error('[Landing] Failed to load latest posts');
      setLatestPosts([]);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            WriteSpace
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            A clean, simple blogging platform where your words take center stage.
            Write, share, and discover stories that matter.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white border-2 border-white rounded-md hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Everything you need to start blogging, nothing you don't.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-center"
              >
                <span className="text-4xl mb-4 block" aria-hidden="true">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Preview Section */}
      {latestPosts.length > 0 && (
        <section className="w-full py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Latest Posts
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                See what the community has been writing about.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestPosts.map((post) => {
                const authorRole = post.authorRole || 'viewer';
                const authorName =
                  post.authorDisplayName || post.author || 'Unknown';

                return (
                  <div
                    key={post.id}
                    className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 flex-1">
                      {getExcerpt(post.content)}
                    </p>
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
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign in to read more
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="flex-1" />

      <Footer />
    </div>
  );
}