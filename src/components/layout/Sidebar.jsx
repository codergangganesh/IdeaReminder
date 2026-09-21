import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  ListTodo,
  FolderKanban,
  Star,
  Plus,
  LogOut,
} from 'lucide-react';
import { useAuth, extractAvatar } from '../../context/AuthContext';
import { Button } from '../common/Button';
import logoImg from '../../assets/logo.png';

export function Sidebar({ ideasCount = 0, checklistsCount = 0, favoritesCount = 0, onQuickCapture }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'My Vault';
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = extractAvatar(user);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  return (
    <aside className="app-sidebar">
      {/* Brand Header with official logo */}
      <div className="sidebar-brand">
        <img src={logoImg} alt="IdeaVault Logo" className="brand-logo-img" />

        <div className="brand-title-wrap">
          <span className="brand-title">IdeaVault</span>
          <span className="brand-subtitle">Capture Today. Build Tomorrow.</span>
        </div>
      </div>

      {/* Quick Capture Action */}
      <div style={{ padding: '1rem 0.85rem 0.25rem 0.85rem' }}>
        <Button
          variant="mustard"
          style={{ width: '100%', gap: '0.5rem', fontWeight: 700 }}
          icon={Plus}
          onClick={onQuickCapture}
        >
          Capture Idea
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="sidebar-nav">
        <span className="nav-section-heading">Workspace</span>

        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/ideas"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Lightbulb size={18} />
          <span>All Ideas</span>
          {ideasCount > 0 && <span className="nav-badge">{ideasCount}</span>}
        </NavLink>

        <NavLink
          to="/checklists"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ListTodo size={18} />
          <span>Checklists</span>
          {checklistsCount > 0 && <span className="nav-badge">{checklistsCount}</span>}
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FolderKanban size={18} />
          <span>Categories</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Star size={18} />
          <span>Favorites</span>
          {favoritesCount > 0 && <span className="nav-badge">{favoritesCount}</span>}
        </NavLink>
      </nav>

      {/* User Footer */}
      <div className="sidebar-user-footer">
        <div className="sidebar-user-card" onClick={() => navigate('/profile')}>
          <div className="user-avatar-circle" style={{ overflow: 'hidden' }}>
            {avatarUrl && !imgError ? (
              <img
                src={avatarUrl}
                alt={displayName}
                onError={() => setImgError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              initial
            )}
          </div>
          <div className="user-meta-info">
            <div className="user-display-name">{displayName}</div>
            <div className="user-email-text">{user?.email}</div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              handleSignOut();
            }}
            title="Sign Out"
            style={{ width: '30px', height: '30px', border: 'none' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
