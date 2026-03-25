/**
 * authModule.js - Authentication business logic module for WriteSpace Blog
 *
 * Exports login, logout, register, getSession, isAuthenticated, getCurrentUser functions.
 * Login checks hard-coded admin (admin/admin) first, then localStorage users.
 * Register validates uniqueness and creates viewer accounts.
 * Depends on storage.js and auth.js for persistence.
 *
 * MVP LIMITATION: No encryption or external auth is used per project
 * requirements (SCRUM-10774). Passwords are stored in plain text.
 */

import {
  getUsers,
  addUser,
  getSession as storageGetSession,
  setSession as storageSetSession,
  clearSession as storageClearSession,
} from './storage';

/**
 * Hard-coded admin credentials for MVP.
 * @type {{ username: string, password: string, displayName: string, role: 'admin' }}
 */
const HARDCODED_ADMIN = {
  username: 'admin',
  password: 'admin',
  displayName: 'Admin',
  role: 'admin',
};

/**
 * Get the current session from storage.
 * @returns {Session|null} Session object or null if not logged in.
 */
export function getSession() {
  try {
    return storageGetSession();
  } catch {
    console.error('[authModule] Failed to read session');
    return null;
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
 * Get the current user object from storage based on the active session.
 * Returns the full user record (including password — MVP limitation).
 * @returns {User|null} User object or null if not logged in or user not found.
 */
export function getCurrentUser() {
  try {
    const session = getSession();
    if (!session || typeof session.username !== 'string' || session.username.length === 0) {
      return null;
    }

    // Check hard-coded admin
    if (session.username === HARDCODED_ADMIN.username) {
      return {
        username: HARDCODED_ADMIN.username,
        displayName: HARDCODED_ADMIN.displayName,
        password: HARDCODED_ADMIN.password,
        role: HARDCODED_ADMIN.role,
        createdAt: session.createdAt || session.loginAt || new Date().toISOString(),
      };
    }

    const users = getUsers();
    const user = users.find((u) => u.username === session.username);
    return user || null;
  } catch {
    console.error('[authModule] Failed to get current user');
    return null;
  }
}

/**
 * Authenticate a user by username and password.
 * Checks hard-coded admin (admin/admin) first, then localStorage users.
 * On success, creates a session and persists it.
 *
 * MVP LIMITATION: Password comparison is plain text (SCRUM-10774).
 *
 * @param {string} username
 * @param {string} password
 * @returns {{ success: boolean, session?: Session, error?: string }}
 */
export function login(username, password) {
  try {
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return { success: false, error: 'Username is required' };
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return { success: false, error: 'Password is required' };
    }

    const trimmedUsername = username.trim();

    // Check hard-coded admin first
    if (trimmedUsername === HARDCODED_ADMIN.username && password === HARDCODED_ADMIN.password) {
      const session = {
        username: HARDCODED_ADMIN.username,
        displayName: HARDCODED_ADMIN.displayName,
        role: HARDCODED_ADMIN.role,
        createdAt: new Date().toISOString(),
        loginAt: new Date().toISOString(),
      };

      storageSetSession(session);
      return { success: true, session };
    }

    // Check localStorage users
    const users = getUsers();
    const user = users.find(
      (u) => u.username === trimmedUsername && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const session = {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    storageSetSession(session);
    return { success: true, session };
  } catch {
    console.error('[authModule] Login failed');
    return { success: false, error: 'Login failed due to an unexpected error' };
  }
}

/**
 * Log out the current user by clearing the session.
 */
export function logout() {
  try {
    storageClearSession();
  } catch {
    console.error('[authModule] Logout failed');
  }
}

/**
 * Register a new user account.
 * Validates all fields, checks uniqueness, and creates a viewer account.
 * On success, creates a session and persists it (auto-login).
 *
 * MVP LIMITATION: Password is stored in plain text (SCRUM-10774).
 *
 * @param {string} username
 * @param {string} displayName
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ success: boolean, session?: Session, error?: string }}
 */
export function register(username, displayName, password, confirmPassword) {
  try {
    // Validate required fields
    if (
      !username || typeof username !== 'string' || username.trim().length === 0 ||
      !displayName || typeof displayName !== 'string' || displayName.trim().length === 0 ||
      !password || typeof password !== 'string' || password.length === 0 ||
      !confirmPassword || typeof confirmPassword !== 'string' || confirmPassword.length === 0
    ) {
      return { success: false, error: 'All fields are required' };
    }

    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();

    // Validate username length and format
    if (trimmedUsername.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }

    if (/\s/.test(trimmedUsername)) {
      return { success: false, error: 'Username must not contain spaces' };
    }

    // Prevent registering as 'admin'
    if (trimmedUsername === 'admin') {
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

    // Validate password match
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    // Check username uniqueness
    const users = getUsers();
    const existingUser = users.find((u) => u.username === trimmedUsername);
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Create new user with viewer role
    const newUser = {
      username: trimmedUsername,
      displayName: trimmedDisplayName,
      password: password, // MVP: plain text (SCRUM-10774)
      role: 'viewer',
      createdAt: new Date().toISOString(),
    };

    addUser(newUser);

    // Auto-login after registration
    const session = {
      username: newUser.username,
      displayName: newUser.displayName,
      role: newUser.role,
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    storageSetSession(session);
    return { success: true, session };
  } catch {
    console.error('[authModule] Registration failed');
    return { success: false, error: 'Registration failed due to an unexpected error' };
  }
}