/**
 * ErrorBanner.jsx - Global error notification component for WriteSpace Blog
 *
 * Displays a warning banner when localStorage is unavailable and the app
 * falls back to sessionStorage. Informs users that data may not persist
 * across browser sessions. Styled with Tailwind warning colors.
 *
 * User Stories: SCRUM-10773, SCRUM-10774
 */

import { useState, useEffect } from 'react';

/**
 * Check whether localStorage is available and functional.
 * @returns {boolean} True if localStorage is usable, false otherwise.
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__writespace_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Global error banner component.
 * Renders a dismissible warning banner when localStorage is unavailable
 * and the app falls back to sessionStorage.
 *
 * @returns {JSX.Element|null} Warning banner or null if localStorage is available or banner is dismissed.
 */
export function ErrorBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      setVisible(true);
    }
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-between w-full px-4 py-3 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded"
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">⚠️</span>
        <p className="text-sm font-medium">
          localStorage is unavailable. Your data is stored in sessionStorage and may not persist after closing the browser.
        </p>
      </div>
      <button
        type="button"
        className="ml-4 text-yellow-800 hover:text-yellow-900 font-bold text-lg leading-none"
        onClick={() => setVisible(false)}
        aria-label="Dismiss warning"
      >
        ×
      </button>
    </div>
  );
}