import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { Ideas } from './pages/Ideas';
import { IdeaDetail } from './pages/IdeaDetail';
import { Categories } from './pages/Categories';
import { Favorites } from './pages/Favorites';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Loader2 } from 'lucide-react';
import logoImg from './assets/logo.png';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <img
          src={logoImg}
          alt="IdeaVault Logo"

          style={{ width: '56px', height: '56px', borderRadius: '14px', boxShadow: 'var(--shadow-mustard)' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-mustard)', fontWeight: 600 }}>
          <Loader2 className="btn-spinner" size={20} />
          <span>Opening your IdeaVault...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="ideas" element={<Ideas />} />
          <Route path="ideas/:id" element={<IdeaDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
