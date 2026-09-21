import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Lightbulb, ListTodo, FolderKanban, Star, User, Plus } from 'lucide-react';

export function MobileBottomNav({ onQuickCapture }) {
  const location = useLocation();
  const isProfile = location.pathname === '/profile';
  const isChecklists = location.pathname === '/checklists';
  const isFolders = location.pathname === '/categories';
  const hideFab = isProfile || isChecklists || isFolders;

  return (
    <>
      {/* Floating Action Button for instant mobile capture (Hidden on Profile, Checklists, and Folders) */}
      {!hideFab && (
        <button
          type="button"
          className="fab-capture-btn"
          onClick={onQuickCapture}
          aria-label="Capture new idea"
          title="Capture idea"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Fixed bottom navigation */}
      <nav className="mobile-bottom-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Home size={19} />
              <span>Home</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/ideas"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Lightbulb size={19} />
              <span>Ideas</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/checklists"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <ListTodo size={19} />
              <span>Tasks</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/categories"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <FolderKanban size={19} />
              <span>Folders</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Star size={19} />
              <span>Saved</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>
      </nav>
    </>
  );
}
