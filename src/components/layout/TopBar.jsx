import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export function TopBar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const displayName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = user?.avatar_url || user?.user_metadata?.avatar_url;

  // Close dropdown on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className="app-topbar">
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <img
          src={logoImg}
          alt="IdeaVault Logo"
          style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }}
        />
        <span
          style={{
            fontWeight: 800,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
          }}
        >
          IdeaVault
        </span>
      </div>

      {/* Profile Icon with Dropdown Menu (Desktop & Mobile accessible) */}
      <div
        ref={menuRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}
      >

        {/* Profile Avatar Icon ONLY (No name text) */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            padding: 0,
            border: menuOpen ? '2px solid #D4A72C' : '2px solid var(--border-color)',
            backgroundColor: '#D4A72C',
            color: '#121418',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.92rem',
            boxShadow: menuOpen ? '0 0 0 4px rgba(212, 167, 44, 0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all var(--transition-fast)',
            overflow: 'hidden',
          }}
          title="Account Menu (Profile, Settings, Theme)"
          aria-label="User account menu"
          aria-expanded={menuOpen}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            initial
          )}
        </button>

        {/* Floating Dropdown Menu */}
        {menuOpen && (
          <div
            className="animate-scale-in"
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '260px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              boxShadow: isDark ? '0 16px 40px rgba(0, 0, 0, 0.5)' : '0 12px 32px rgba(0, 0, 0, 0.12)',
              padding: '0.55rem',
              zIndex: 1000,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* User Mini-Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-subtle)',
                marginBottom: '0.4rem',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#D4A72C',
                  color: '#121418',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initial
                )}
              </div>
              <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Menu Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {/* Option 1: Profile */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/profile');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: location.pathname === '/profile' ? 'rgba(212, 167, 44, 0.12)' : 'transparent',
                  border: 'none',
                  color: location.pathname === '/profile' ? '#D4A72C' : 'var(--text-primary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/profile') e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/profile') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <User size={16} color="#D4A72C" />
                  <span>Profile</span>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </button>

              {/* Option 2: Settings */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: location.pathname === '/settings' ? 'rgba(212, 167, 44, 0.12)' : 'transparent',
                  border: 'none',
                  color: location.pathname === '/settings' ? '#D4A72C' : 'var(--text-primary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/settings') e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/settings') e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Settings size={16} color="#D4A72C" />
                  <span>Settings</span>
                </div>
                <ChevronRight size={14} color="var(--text-muted)" />
              </button>

              {/* Option 3: Dark Mode / Light Mode toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {isDark ? <Sun size={16} color="#D4A72C" /> : <Moon size={16} color="#D4A72C" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                {/* Switch Pill */}
                <div
                  style={{
                    width: '38px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: isDark ? '#D4A72C' : '#CBD5E1',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      transform: isDark ? 'translateX(18px)' : 'translateX(0px)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </div>
              </button>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.35rem 0.25rem' }} />

              {/* Option 4: Sign Out */}
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} color="#EF4444" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
