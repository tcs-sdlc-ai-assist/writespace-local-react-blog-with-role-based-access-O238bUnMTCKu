/**
 * rbac.js - Role-Based Access Control module for WriteSpace Blog
 *
 * Exports hasRole, canEditPost, canDeletePost functions.
 * Checks session role against required roles.
 * Implements ownership logic: Admin can edit/delete any post,
 * Viewer can only edit/delete own posts.
 * Used by route guards, blog pages, and user management.
 */

import { getSession } from './auth';

/**
 * Check if the current session user has the specified role.
 * @param {'admin' | 'viewer'} role - The role to check against.
 * @returns {boolean} True if the current user has the specified role.
 */
export function hasRole(role) {
  try {
    const session = getSession();
    if (!session || typeof session.role !== 'string') {
      return false;
    }
    return session.role === role;
  } catch {
    console.error('[rbac] Failed to check role');
    return false;
  }
}

/**
 * Check if the current session user can edit a given post.
 * Admin can edit any post. Viewer can only edit their own posts.
 * @param {object} post - The post object to check. Must include `author` field.
 * @returns {boolean} True if the current user is allowed to edit the post.
 */
export function canEditPost(post) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return false;
    }
    if (session.role === 'admin') {
      return true;
    }
    if (!post || typeof post.author !== 'string') {
      return false;
    }
    return post.author === session.username;
  } catch {
    console.error('[rbac] Failed to check edit permission');
    return false;
  }
}

/**
 * Check if the current session user can delete a given post.
 * Admin can delete any post. Viewer can only delete their own posts.
 * @param {object} post - The post object to check. Must include `author` field.
 * @returns {boolean} True if the current user is allowed to delete the post.
 */
export function canDeletePost(post) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return false;
    }
    if (session.role === 'admin') {
      return true;
    }
    if (!post || typeof post.author !== 'string') {
      return false;
    }
    return post.author === session.username;
  } catch {
    console.error('[rbac] Failed to check delete permission');
    return false;
  }
}