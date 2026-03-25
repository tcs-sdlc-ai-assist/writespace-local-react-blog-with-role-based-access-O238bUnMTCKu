/**
 * userModule.js - User management business logic module for WriteSpace Blog
 *
 * Exports getAllUsers, createUser, deleteUser functions.
 * Admin can create users with any role and delete non-admin, non-self accounts.
 * Validates username uniqueness.
 * Depends on storage.js for persistence and rbac.js for permission checks.
 *
 * MVP LIMITATION: No encryption or external auth is used per project
 * requirements (SCRUM-10774). Passwords are stored in plain text.
 */

import { getUsers, addUser, removeUser } from './storage';
import { getSession } from './auth';
import { hasRole } from './rbac';

/**
 * Hard-coded admin username that cannot be deleted.
 * @type {string}
 */
const HARDCODED_ADMIN_USERNAME = 'admin';

/**
 * Get all users from storage.
 * Requires admin role.
 *
 * @returns {{ success: boolean, users?: Array<object>, error?: string }}
 */
export function getAllUsers() {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return { success: false, error: 'You must be logged in to view users' };
    }

    if (!hasRole('admin')) {
      return { success: false, error: 'Only admins can view users' };
    }

    const users = getUsers();
    return { success: true, users };
  } catch {
    console.error('[userModule] Failed to get all users');
    return { success: false, error: 'Failed to get users due to an unexpected error' };
  }
}

/**
 * Create a new user account (admin only).
 * Validates all fields, checks uniqueness, and creates the user.
 *
 * MVP LIMITATION: Password is stored in plain text (SCRUM-10774).
 *
 * @param {string} username
 * @param {string} displayName
 * @param {string} password
 * @param {'admin' | 'viewer'} role
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
export function createUser(username, displayName, password, role) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return { success: false, error: 'You must be logged in to create a user' };
    }

    if (!hasRole('admin')) {
      return { success: false, error: 'Only admins can create users' };
    }

    // Validate required fields
    if (
      !username || typeof username !== 'string' || username.trim().length === 0 ||
      !displayName || typeof displayName !== 'string' || displayName.trim().length === 0 ||
      !password || typeof password !== 'string' || password.length === 0 ||
      !role || typeof role !== 'string' || role.trim().length === 0
    ) {
      return { success: false, error: 'All fields are required' };
    }

    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();
    const trimmedRole = role.trim();

    // Validate username length and format
    if (trimmedUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    if (/\s/.test(trimmedUsername)) {
      return { success: false, error: 'Username must not contain spaces' };
    }

    // Prevent creating user with 'admin' username
    if (trimmedUsername === HARDCODED_ADMIN_USERNAME) {
      return { success: false, error: 'Username not allowed' };
    }

    // Validate display name length
    if (trimmedDisplayName.length < 2) {
      return { success: false, error: 'Display name must be at least 2 characters' };
    }

    // Validate password length
    if (password.length < 3) {
      return { success: false, error: 'Password must be at least 3 characters' };
    }

    // Validate role
    if (trimmedRole !== 'admin' && trimmedRole !== 'viewer') {
      return { success: false, error: 'Role must be either admin or viewer' };
    }

    // Check username uniqueness
    const users = getUsers();
    const existingUser = users.find((u) => u.username === trimmedUsername);
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Create new user
    const newUser = {
      username: trimmedUsername,
      displayName: trimmedDisplayName,
      password: password, // MVP: plain text (SCRUM-10774)
      role: trimmedRole,
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);

    return { success: true, user: newUser };
  } catch {
    console.error('[userModule] Failed to create user');
    return { success: false, error: 'Failed to create user due to an unexpected error' };
  }
}

/**
 * Delete a user by username (admin only).
 * Cannot delete the hard-coded admin account or the currently logged-in user.
 *
 * @param {string} username - The username of the user to delete.
 * @returns {{ success: boolean, error?: string }}
 */
export function deleteUser(username) {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return { success: false, error: 'You must be logged in to delete a user' };
    }

    if (!hasRole('admin')) {
      return { success: false, error: 'Only admins can delete users' };
    }

    // Validate username
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return { success: false, error: 'Username is required' };
    }

    const trimmedUsername = username.trim();

    // Prevent deleting the hard-coded admin
    if (trimmedUsername === HARDCODED_ADMIN_USERNAME) {
      return { success: false, error: 'Cannot delete the admin account' };
    }

    // Prevent deleting self
    if (trimmedUsername === session.username) {
      return { success: false, error: 'Cannot delete your own account' };
    }

    // Check if user exists
    const users = getUsers();
    const user = users.find((u) => u.username === trimmedUsername);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    removeUser(trimmedUsername);

    return { success: true };
  } catch {
    console.error('[userModule] Failed to delete user');
    return { success: false, error: 'Failed to delete user due to an unexpected error' };
  }
}