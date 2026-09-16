import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Zap,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import bulbNotepadImg from '../assets/login-bulb-notepad.jpg';

function GoogleIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function GitHubIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Responsive breakpoint (900px)
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 900 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await signUp(email.trim(), password, name.trim());
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider) => {
    showToast(`Connecting with ${provider}... Please complete your registration.`, 'info');
  };

  /* =========================================================================
     MOBILE VIEW (Kept 100% undisturbed as requested)
     ========================================================================= */
  if (isMobile) {
    return (
      <div className="auth-viewport-wrapper">
        <div className="auth-phone-frame animate-fade-in">
          {/* Phone Notch Bar for Mockup */}
          <div className="auth-phone-notch" />

          {/* Yellow Top Section with 3D Illustration */}
          <div className="auth-header-section">
            {/* Brand Row */}
            <div className="auth-brand-row">
              <div className="auth-brand-logo-card">
                <img src={logoImg} alt="IdeaVault" />
              </div>
              <span className="auth-brand-name">IdeaVault</span>
            </div>

            {/* Hero Split Row */}
            <div className="auth-hero-split">
              <div className="auth-hero-text">
                <h1 className="auth-hero-title-big">Join Us</h1>
                <div className="auth-hero-welcome">Create Free Account</div>
                <p className="auth-hero-tagline">
                  Start capturing and developing your ideas.
                </p>
              </div>

              <img
                src={bulbNotepadImg}
                alt="IdeaVault Notepad"
                className="auth-hero-illustration"
              />
            </div>
          </div>

          {/* Elevated White Card */}
          <div className="auth-card-container">
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-subtitle">
              Fill in your details to start your journey
            </p>

            {error && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#DC2626',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Full Name */}
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-name">
                  Full Name
                </label>
                <div className="auth-pill-input-wrap">
                  <User size={18} className="auth-icon-left" />
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-email">
                  Email Address
                </label>
                <div className="auth-pill-input-wrap">
                  <Mail size={18} className="auth-icon-left" />
                  <input
                    id="register-email"
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-password">
                  Password
                </label>
                <div className="auth-pill-input-wrap">
                  <Lock size={18} className="auth-icon-left" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="auth-icon-right" />
                    ) : (
                      <Eye size={18} className="auth-icon-right" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="register-confirm">
                  Confirm Password
                </label>
                <div className="auth-pill-input-wrap">
                  <Lock size={18} className="auth-icon-left" />
                  <input
                    id="register-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-primary-btn"
                disabled={loading}
                id="btn-register-account"
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Footer Link: Already have account */}
              <div className="auth-footer-link-wrap">
                <Link to="/login" className="auth-footer-link">
                  Already have an account? Sign In
                </Link>
              </div>
            </form>
          </div>

          {/* Bottom Banner with Decorative Quote */}
          <div className="auth-bottom-banner">
            <div className="auth-bottom-circle-1" />
            <div className="auth-bottom-circle-2" />

            <div className="auth-bottom-quote-text">
              Small Ideas<br />Big Possibilities
              <svg
                width="76"
                height="10"
                viewBox="0 0 76 10"
                fill="none"
                className="auth-bottom-quote-svg"
              >
                <path
                  d="M2 7C22 2 54 2 74 7"
                  stroke="#D4A72C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     DESKTOP VIEW (Exact match to reference, 100vh no-scroll, with Sign In option)
     ========================================================================= */
  return (
    <div
      className="animate-fade-in"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        position: 'relative',
        background: 'linear-gradient(115deg, #F9BE28 0%, #FBBF24 24%, #FDE047 48%, #FFFBEB 75%, #FFFFFF 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Soft Decorative Background Waves */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '25%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(254, 240, 138, 0.45) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          left: '-80px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* TOP HEADER BAR */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 3.5rem',
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '11px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '5px',
            }}
          >
            <img src={logoImg} alt="IdeaVault" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <span
            style={{
              fontSize: '1.45rem',
              fontWeight: 900,
              color: '#111827',
              letterSpacing: '-0.03em',
            }}
          >
            IdeaVault
          </span>
        </div>

        {/* Top Right "Already have an account? Sign In" Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 600 }}>
            Already have an account?
          </span>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '0.45rem 1.25rem',
              borderRadius: '9999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              color: '#111827',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.04)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* MAIN TWO-COLUMN SPLIT (No vertical scroll, fits 100vh perfectly) */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 3.5rem 1.25rem 3.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '3rem',
          position: 'relative',
          zIndex: 5,
          minHeight: 0,
        }}
      >
        {/* LEFT COLUMN: HERO HEADLINE, 3D NOTEPAD ILLUSTRATION, FEATURES, SCRIPT */}
        <div style={{ flex: 1, maxWidth: '540px', display: 'flex', flexDirection: 'column' }}>
          {/* Main Hero Typography */}
          <h1
            style={{
              fontSize: '3.4rem',
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1,
              margin: 0,
              letterSpacing: '-0.04em',
            }}
          >
            Join Us
          </h1>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#111827',
              marginTop: '0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Create Free Account
          </div>
          <p
            style={{
              fontSize: '0.96rem',
              color: '#4B5563',
              marginTop: '0.35rem',
              marginBottom: '1.25rem',
              fontWeight: 500,
              lineHeight: 1.35,
            }}
          >
            Turn your ideas into something amazing.
          </p>

          {/* 3D Yellow Lightbulb & Notepad Illustration */}
          <div style={{ position: 'relative', width: 'fit-content', margin: '0 0 1.25rem 0' }}>
            <img
              src={bulbNotepadImg}
              alt="IdeaVault 3D Lightbulb Notepad"
              style={{
                width: '245px',
                height: 'auto',
                borderRadius: '20px',
                boxShadow: '0 16px 36px rgba(212, 167, 44, 0.28), 0 6px 12px rgba(0,0,0,0.06)',
                display: 'block',
              }}
            />
          </div>

          {/* 3 Feature Pills: Capture, Organize, Grow */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.75rem', marginBottom: '1.25rem' }}>
            {/* Feature 1: Capture */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111827',
                  marginBottom: '0.35rem',
                }}
              >
                <Zap size={18} fill="#111827" />
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#111827' }}>
                Capture
              </div>
              <div style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: '0.1rem', lineHeight: 1.2 }}>
                Jot down ideas easily
              </div>
            </div>

            {/* Feature 2: Organize */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '115px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111827',
                  marginBottom: '0.35rem',
                }}
              >
                <Sprout size={18} />
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#111827' }}>
                Organize
              </div>
              <div style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: '0.1rem', lineHeight: 1.2 }}>
                Keep everything in one place
              </div>
            </div>

            {/* Feature 3: Grow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '105px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111827',
                  marginBottom: '0.35rem',
                }}
              >
                <TrendingUp size={18} />
              </div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#111827' }}>
                Grow
              </div>
              <div style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: '0.1rem', lineHeight: 1.2 }}>
                Turn ideas into reality
              </div>
            </div>
          </div>

          {/* Bottom Calligraphic Quote */}
          <div
            style={{
              transform: 'rotate(-6deg)',
              display: 'inline-block',
              width: 'fit-content',
            }}
          >
            <div
              style={{
                fontFamily: "'Caveat', 'Segoe Print', 'Brush Script MT', cursive",
                fontSize: '1.25rem',
                color: '#78350F',
                lineHeight: 1.1,
                fontWeight: 700,
              }}
            >
              Small Ideas<br />Big Possibilities
            </div>
            <svg width="90" height="10" viewBox="0 0 90 10" fill="none" style={{ marginTop: '2px' }}>
              <path d="M2 8C28 2 65 2 88 8" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: CRISP WHITE FLOATING CARD */}
        <div style={{ width: '100%', maxWidth: '470px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '30px',
              padding: '1.85rem 2.4rem',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 4px 14px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            {/* Card Header */}
            <h2
              style={{
                fontSize: '1.85rem',
                fontWeight: 900,
                color: '#111827',
                textAlign: 'center',
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Register to <span style={{ color: '#F59E0B' }}>IdeaVault</span>
            </h2>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#6B7280',
                textAlign: 'center',
                marginTop: '0.3rem',
                marginBottom: '1.15rem',
              }}
            >
              Fill in your details to start your journey
            </p>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#DC2626',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Full Name */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.3rem',
                  }}
                  htmlFor="desktop-reg-name"
                >
                  Full Name
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '0 1rem',
                    transition: 'border-color 0.2s',
                  }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#F59E0B')}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <User size={17} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    id="desktop-reg-name"
                    type="text"
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.68rem 0.65rem',
                      outline: 'none',
                      fontSize: '0.88rem',
                      color: '#111827',
                    }}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.3rem',
                  }}
                  htmlFor="desktop-reg-email"
                >
                  Email Address
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '0 1rem',
                    transition: 'border-color 0.2s',
                  }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#F59E0B')}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <Mail size={17} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    id="desktop-reg-email"
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.68rem 0.65rem',
                      outline: 'none',
                      fontSize: '0.88rem',
                      color: '#111827',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.3rem',
                  }}
                  htmlFor="desktop-reg-pass"
                >
                  Password
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '0 1rem',
                    transition: 'border-color 0.2s',
                  }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#F59E0B')}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <Lock size={17} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    id="desktop-reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.68rem 0.65rem',
                      outline: 'none',
                      fontSize: '0.88rem',
                      color: '#111827',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.3rem',
                  }}
                  htmlFor="desktop-reg-confirm"
                >
                  Confirm Password
                </label>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '0 1rem',
                    transition: 'border-color 0.2s',
                  }}
                  onFocusCapture={(e) => (e.currentTarget.style.borderColor = '#F59E0B')}
                  onBlurCapture={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
                >
                  <Lock size={17} color="#9CA3AF" style={{ flexShrink: 0 }} />
                  <input
                    id="desktop-reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.68rem 0.65rem',
                      outline: 'none',
                      fontSize: '0.88rem',
                      color: '#111827',
                    }}
                  />
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: '0.2rem',
                  padding: '0.82rem 1.25rem',
                  borderRadius: '9999px',
                  background: 'linear-gradient(180deg, #FDB813 0%, #EAA00A 100%)',
                  border: 'none',
                  color: '#111827',
                  fontSize: '0.94rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.35)';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* In-Card "Already have an account? Sign In" Option */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '0.15rem',
                  fontSize: '0.83rem',
                  color: '#4B5563',
                }}
              >
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{
                    color: '#D97706',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Sign In
                </Link>
              </div>

              {/* Divider: or */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '0.35rem 0',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
                <span style={{ padding: '0 0.75rem', fontSize: '0.78rem', color: '#9CA3AF' }}>or</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }} />
              </div>

              {/* Social Login Buttons: Google & GitHub */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleSocialClick('Google')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <GoogleIcon size={16} />
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialClick('GitHub')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '9999px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <GitHubIcon size={16} />
                  <span>Continue with GitHub</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card Footer: Copyright & Legal Links */}
          <footer
            style={{
              textAlign: 'center',
              marginTop: '0.75rem',
              fontSize: '0.74rem',
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
            }}
          >
            <span>© 2026 IdeaVault. All rights reserved.</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }}>Terms</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span>|</span>
            <span style={{ cursor: 'pointer' }}>Contact</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
