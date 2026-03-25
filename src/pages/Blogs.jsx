/**
 * Blogs.jsx - Blog list/dashboard page for WriteSpace Blog
 *
 * Authenticated blog list page at route '/blogs'. Shows all posts in a
 * responsive grid (1/2/3 columns by breakpoint) using BlogCard components.
 * Posts sorted newest first via blogModule.getAllPosts(). Role-based edit
 * icon visibility on cards. Empty state with message and CTA button to
 * write first post if no posts exist. Uses AuthNavbar component.
 *
 * User Stories: SCRUM-10765
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthNavbar } from '../components/AuthNavbar';
import { BlogCard } from '../components/BlogCard';
import { getAllPosts } from '../utils/blogModule';

/**
 * Blog list/dashboard page component.
 * Renders the authenticated navbar and a responsive grid of blog post cards.
 * Shows an empty state with a CTA to create the first post when no posts exist.
 *
 * @returns {JSX.Element} The blogs list page element.
 */
export function Blogs() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    try {
      const allPosts = getAllPosts();
      setPosts(allPosts);
    } catch {
      console.error('[Blogs] Failed to load posts');
      setPosts([]);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AuthNavbar />

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">All Blogs</h1>
            <Link
              to="/blogs/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Write Post
            </Link>
          </div>

          {/* Posts grid or empty state */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-5xl mb-4" aria-hidden="true">
                ✍️
              </span>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No posts yet
              </h2>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                It looks like there aren&apos;t any blog posts yet. Be the first
                to share your thoughts with the community!
              </p>
              <Link
                to="/blogs/new"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Write Your First Post
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}