/**
 * blogModule.js - Blog CRUD business logic module for WriteSpace Blog
 *
 * Exports getAllPosts, getPostById, createPost, updatePost, deletePost functions.
 * Creates posts with crypto.randomUUID() IDs, author info from session, and timestamps.
 * Depends on storage.js for persistence and rbac.js for permission checks.
 * Used by blog pages for reading, creating, editing, and deleting posts.
 *
 * MVP LIMITATION: No pagination or search — all posts loaded at once.
 */

import {
  getPosts,
  setPosts,
  addPost as storageAddPost,
  updatePost as storageUpdatePost,
  removePost,
} from './storage';

import { getSession } from './auth';
import { canEditPost, canDeletePost } from './rbac';

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
 * Get all posts from storage, sorted by createdAt descending (newest first).
 * @returns {Array<Post>} Array of post objects, or [] if unavailable/corrupted.
 */
export function getAllPosts() {
  try {
    const posts = getPosts();
    return posts.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch {
    console.error('[blogModule] Failed to get all posts');
    return [];
  }
}

/**
 * Get a single post by its id.
 * @param {string} id - The post id to look up.
 * @returns {Post|null} The post object, or null if not found.
 */
export function getPostById(id) {
  try {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return null;
    }

    const posts = getPosts();
    const post = posts.find((p) => p.id === id);
    return post || null;
  } catch {
    console.error('[blogModule] Failed to get post by id');
    return null;
  }
}

/**
 * Create a new blog post.
 * Requires an active session. Author info is taken from the current session.
 * Generates a UUID id and sets createdAt/updatedAt timestamps.
 *
 * @param {string} title - The post title (required, max 100 chars).
 * @param {string} content - The post content (required, max 2000 chars).
 * @returns {{ success: boolean, post?: Post, error?: string }}
 */
export function createPost(title, content) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return { success: false, error: 'You must be logged in to create a post' };
    }

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      return { success: false, error: `Title must be at most ${MAX_TITLE_LENGTH} characters` };
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return { success: false, error: 'Content is required' };
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      return { success: false, error: `Content must be at most ${MAX_CONTENT_LENGTH} characters` };
    }

    const now = new Date().toISOString();

    const newPost = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      content: trimmedContent,
      author: session.username,
      authorDisplayName: session.displayName || session.username,
      authorRole: session.role || 'viewer',
      createdAt: now,
      updatedAt: now,
    };

    // Use direct array manipulation to avoid storageAddPost overwriting id/timestamps
    const posts = getPosts();
    posts.push(newPost);
    setPosts(posts);

    return { success: true, post: newPost };
  } catch {
    console.error('[blogModule] Failed to create post');
    return { success: false, error: 'Failed to create post due to an unexpected error' };
  }
}

/**
 * Update an existing blog post.
 * Requires an active session and edit permission (admin or post owner).
 * Updates title, content, and updatedAt timestamp.
 *
 * @param {string} id - The post id to update.
 * @param {string} title - The new title (required, max 100 chars).
 * @param {string} content - The new content (required, max 2000 chars).
 * @returns {{ success: boolean, post?: Post, error?: string }}
 */
export function updatePost(id, title, content) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return { success: false, error: 'You must be logged in to edit a post' };
    }

    // Validate id
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return { success: false, error: 'Post ID is required' };
    }

    // Find the post
    const post = getPostById(id);
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // Check permission
    if (!canEditPost(post)) {
      return { success: false, error: 'You do not have permission to edit this post' };
    }

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      return { success: false, error: `Title must be at most ${MAX_TITLE_LENGTH} characters` };
    }

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return { success: false, error: 'Content is required' };
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      return { success: false, error: `Content must be at most ${MAX_CONTENT_LENGTH} characters` };
    }

    const updatedPost = {
      ...post,
      title: trimmedTitle,
      content: trimmedContent,
      updatedAt: new Date().toISOString(),
    };

    storageUpdatePost(updatedPost);

    return { success: true, post: updatedPost };
  } catch {
    console.error('[blogModule] Failed to update post');
    return { success: false, error: 'Failed to update post due to an unexpected error' };
  }
}

/**
 * Delete a blog post by id.
 * Requires an active session and delete permission (admin or post owner).
 *
 * @param {string} id - The post id to delete.
 * @returns {{ success: boolean, error?: string }}
 */
export function deletePost(id) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return { success: false, error: 'You must be logged in to delete a post' };
    }

    // Validate id
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return { success: false, error: 'Post ID is required' };
    }

    // Find the post
    const post = getPostById(id);
    if (!post) {
      return { success: false, error: 'Post not found' };
    }

    // Check permission
    if (!canDeletePost(post)) {
      return { success: false, error: 'You do not have permission to delete this post' };
    }

    removePost(id);

    return { success: true };
  } catch {
    console.error('[blogModule] Failed to delete post');
    return { success: false, error: 'Failed to delete post due to an unexpected error' };
  }
}