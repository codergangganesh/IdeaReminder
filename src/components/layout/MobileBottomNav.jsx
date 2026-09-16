import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Lightbulb, Compass, Star, User, Plus } from 'lucide-react';

export function MobileBottomNav({ onQuickCapture }) {
  const location = useLocation();
  const isProfile = location.pathname === '/profile';

  return (
    <>
      {/* Floating Action Button for instant mobile capture (Hidden on Profile section) */}
      {!isProfile && (
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
              <Home size={20} />
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
              <Lightbulb size={20} />
              <span>Ideas</span>
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
              <Compass size={20} />
              <span>Explore</span>
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
              <Star size={20} />
              <span>Favorites</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <User size={20} />
              <span>Profile</span>
              {isActive && <span className="mobile-nav-active-dot" />}
            </>
          )}
        </NavLink>
      </nav>
    </>
  );
}
