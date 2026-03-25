/**
 * avatar.jsx - Role-distinct avatar rendering component for WriteSpace Blog
 *
 * Exports getAvatar(role) function that returns role-distinct JSX.
 * Admin gets crown emoji (👑) with violet background.
 * Viewer gets book emoji (📖) with indigo background.
 * Used in navbar, user management table, blog cards, and blog detail pages.
 *
 * User Stories: SCRUM-10762, SCRUM-10763, SCRUM-10764
 */

/**
 * Returns a role-distinct avatar JSX element.
 * Admin: crown emoji (👑) with violet background.
 * Viewer: book emoji (📖) with indigo background.
 *
 * @param {'admin' | 'viewer'} role - The user role to render an avatar for.
 * @returns {JSX.Element} A styled avatar element.
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-200 text-violet-800 text-sm"
        title="Admin"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 text-sm"
      title="Viewer"
    >
      📖
    </span>
  );
}