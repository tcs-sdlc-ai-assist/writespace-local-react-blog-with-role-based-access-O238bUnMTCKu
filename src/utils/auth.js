/**
 * auth.js - Authentication and session management helper module for WriteSpace Blog
 *
 * Exports getSession, setSession, clearSession functions.
 * Depends on storage.js for underlying persistence.
 * Handles session read/write with error handling.
 * Used by route guards and components to check authentication state.
 *
 * MVP LIMITATION: No encryption or external auth is used per project
 * requirements (SCRUM-10774). Passwords are stored in plain text.
 */

import {
  getSession as storageGetSession,
  setSession as storageSetSession,
  clearSession as storageClearSession,
  getUsers,
} from './storage';

/**
 * Get the current session from storage.
 * @returns {Session|null} Session object or null if not logged in.
 */
export function getSession() {
  try {
    return storageGetSession();
  } catch {
    console.error('[auth] Failed to read session');
    return null;
  }
}

/**
 * Set the current session in storage.
 * @param {Session} session
 */
export function setSession(session) {
  try {
    storageSetSession(session);
  } catch {
    console.error('[auth] Failed to write session');
  }
}

/**
 * Clear the current session (logout).
 */
export function clearSession() {
  try {
    storageClearSession();
  } catch {
    console.error('[auth] Failed to clear session');
  }
}

/**
 * Check if a user is currently authenticated.
 * @returns {boolean} True if a valid session exists.
 */
export function isAuthenticated() {
  const session = getSession();
  return session !== null && typeof session.username === 'string' && session.username.length > 0;
}

/**
 * Check if the current session user has admin role.
 * @returns {boolean} True if the current user is an admin.
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}

/**
 * Authenticate a user by username and password.
 * On success, creates a session and persists it.
 * Returns the session object on success, or null on failure.
 *
 * MVP LIMITATION: Password comparison is plain text (SCRUM-10774).
 *
 * @param {string} username
 * @param {string} password
 * @returns {Session|null} Session object or null if authentication failed.
 */
export function login(username, password) {
  try {
    const users = getUsers();
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return null;
    }

    const session = {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      loginAt: new Date().toISOString(),
    };

    setSession(session);
    return session;
  } catch {
    console.error('[auth] Login failed');
    return null;
  }
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  clearSession();
}