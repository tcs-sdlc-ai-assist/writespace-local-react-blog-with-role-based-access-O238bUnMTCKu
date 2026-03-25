/**
 * storage.js - Core localStorage helper module for WriteSpace Blog
 *
 * Provides CRUD functions for users, posts, and session data.
 * All operations wrapped in try/catch with safe defaults.
 *
 * MVP LIMITATION: Passwords are stored in plain text in localStorage.
 * This is intentional for the MVP phase — no encryption or external auth
 * is used per project requirements (SCRUM-10774).
 */

const STORAGE_KEYS = {
  USERS: 'users',
  POSTS: 'posts',
  SESSION: 'session',
};

/**
 * Safely read and parse a JSON value from localStorage.
 * Falls back to sessionStorage if localStorage is unavailable.
 * Returns the provided fallback if parsing fails or key is missing.
 */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      console.error(`[storage] Failed to read key "${key}"`);
      return fallback;
    }
  }
}

/**
 * Safely stringify and write a value to localStorage.
 * Falls back to sessionStorage if localStorage is unavailable.
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`[storage] Failed to write key "${key}"`);
    }
  }
}

/**
 * Safely remove a key from localStorage (and sessionStorage fallback).
 */
function safeRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
  try {
    sessionStorage.removeItem(key);
  } catch {
    // no-op
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Get all users from storage.
 * @returns {Array<User>} Array of user objects, or [] if unavailable/corrupted.
 *
 * NOTE: User passwords are stored in plain text (MVP limitation, no encryption).
 */
export function getUsers() {
  return safeGet(STORAGE_KEYS.USERS, []);
}

/**
 * Replace the entire users array in storage.
 * @param {Array<User>} users
 */
export function setUsers(users) {
  safeSet(STORAGE_KEYS.USERS, users);
}

/**
 * Add a single user to storage.
 * Password is stored in plain text (MVP limitation).
 * @param {User} user
 */
export function addUser(user) {
  const users = getUsers();
  users.push(user);
  setUsers(users);
}

/**
 * Remove a user by username.
 * @param {string} username
 */
export function removeUser(username) {
  const users = getUsers().filter((u) => u.username !== username);
  setUsers(users);
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

/**
 * Get all posts from storage.
 * @returns {Array<Post>} Array of post objects, or [] if unavailable/corrupted.
 */
export function getPosts() {
  return safeGet(STORAGE_KEYS.POSTS, []);
}

/**
 * Replace the entire posts array in storage.
 * @param {Array<Post>} posts
 */
export function setPosts(posts) {
  safeSet(STORAGE_KEYS.POSTS, posts);
}

/**
 * Add a single post to storage. Generates an id via crypto.randomUUID().
 * @param {Post} post - Post object (id will be assigned if missing).
 */
export function addPost(post) {
  const posts = getPosts();
  const newPost = {
    ...post,
    id: post.id || crypto.randomUUID(),
    createdAt: post.createdAt || new Date().toISOString(),
    updatedAt: post.updatedAt || new Date().toISOString(),
  };
  posts.push(newPost);
  setPosts(posts);
  return newPost;
}

/**
 * Update an existing post by id. Merges provided fields and updates `updatedAt`.
 * @param {Post} updatedPost - Must include `id`.
 */
export function updatePost(updatedPost) {
  const posts = getPosts().map((p) => {
    if (p.id === updatedPost.id) {
      return {
        ...p,
        ...updatedPost,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });
  setPosts(posts);
}

/**
 * Remove a post by id.
 * @param {string} postId
 */
export function removePost(postId) {
  const posts = getPosts().filter((p) => p.id !== postId);
  setPosts(posts);
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * Get the current session from storage.
 * @returns {Session|null} Session object or null if not logged in.
 */
export function getSession() {
  return safeGet(STORAGE_KEYS.SESSION, null);
}

/**
 * Set the current session in storage.
 * @param {Session} session
 */
export function setSession(session) {
  safeSet(STORAGE_KEYS.SESSION, session);
}

/**
 * Clear the current session (logout).
 */
export function clearSession() {
  safeRemove(STORAGE_KEYS.SESSION);
}