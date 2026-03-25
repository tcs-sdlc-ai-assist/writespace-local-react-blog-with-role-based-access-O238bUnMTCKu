/**
 * App.jsx - Root application component for WriteSpace Blog
 *
 * Root component with React Router v6 route definitions.
 * Defines all routes: '/' (Landing), '/login' (Login), '/register' (Register),
 * '/blogs' (ProtectedRoute → Blogs), '/blogs/:id' (ProtectedRoute → ReadBlog),
 * '/blogs/new' (ProtectedRoute → WriteBlog), '/blogs/:id/edit' (ProtectedRoute → WriteBlog),
 * '/admin' (AdminRoute → AdminDashboard), '/admin/users' (AdminRoute → UserManagement),
 * '*' (NotFound). Includes ErrorBanner for global storage error notification.
 *
 * User Stories: SCRUM-10770, SCRUM-10771, SCRUM-10773
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBanner } from './components/ErrorBanner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Blogs } from './pages/Blogs';
import { ReadBlog } from './pages/ReadBlog';
import { WriteBlog } from './pages/WriteBlog';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { NotFound } from './pages/NotFound';

/**
 * Root application component.
 * Renders the global error banner and all route definitions using
 * React Router v6. Protected routes are wrapped with ProtectedRoute,
 * admin routes are wrapped with AdminRoute.
 *
 * @returns {JSX.Element} The root application element.
 */
export function App() {
  return (
    <BrowserRouter>
      <ErrorBanner />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes (authenticated users) */}
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/new"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/:id"
          element={
            <ProtectedRoute>
              <ReadBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/:id/edit"
          element={
            <ProtectedRoute>
              <WriteBlog />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}