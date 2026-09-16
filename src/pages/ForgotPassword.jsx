import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { insforge } from '../services/insforge';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  Loader2,
  Zap,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import bulbNotepadImg from '../assets/login-bulb-notepad.jpg';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetErr } = await insforge.auth.sendResetPasswordEmail({
        email: email.trim(),
        redirectTo: window.location.origin + '/settings',
      });
      if (resetErr) throw resetErr;

      setSuccess(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset link. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================================
     MOBILE VIEW (Consistent with mobile frame design)
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
                <h1 className="auth-hero-title-big" style={{ fontSize: '2.4rem' }}>Reset</h1>
                <div className="auth-hero-welcome">Forgot Password?</div>
                <p className="auth-hero-tagline">
                  We will help you regain access to your ideas.
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
            <h2 className="auth-card-title">Reset Password</h2>
            <p className="auth-card-subtitle">
              Enter your email to receive password reset instructions
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

            {success && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#15803D',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <Check size={16} style={{ flexShrink: 0 }} />
                <span>Password reset link sent to {email}. Check your inbox!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Email Address */}
              <div className="auth-input-group">
                <label className="auth-input-label" htmlFor="forgot-mobile-email">
                  Email Address
                </label>
                <div className="auth-pill-input-wrap">
                  <Mail size={18} className="auth-icon-left" />
                  <input
                    id="forgot-mobile-email"
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-primary-btn"
                disabled={loading}
                style={{ marginTop: '0.75rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Back to Sign In Link */}
              <div className="auth-footer-link-wrap">
                <Link to="/login" className="auth-footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeft size={15} />
                  <span>Back to Sign In</span>
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
     DESKTOP VIEW (Matching 100vh no-scroll Login/Register design)
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

        {/* Top Right "Remember password? Sign In" Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.88rem', color: '#374151', fontWeight: 600 }}>
            Remember password?
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

      {/* MAIN TWO-COLUMN SPLIT (100vh no-scroll) */}
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
            Reset
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
            Password Recovery
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
            Don't worry, we'll help you get back to your captured ideas.
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
              padding: '2.2rem 2.4rem',
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
              Reset your <span style={{ color: '#F59E0B' }}>Password</span>
            </h2>
            <p
              style={{
                fontSize: '0.82rem',
                color: '#6B7280',
                textAlign: 'center',
                marginTop: '0.35rem',
                marginBottom: '1.35rem',
              }}
            >
              Enter your email address to receive password reset instructions
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

            {/* Success Message */}
            {success && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#15803D',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <Check size={16} style={{ flexShrink: 0 }} />
                <span>Password reset link sent to {email}. Check your inbox!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Email Address */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.35rem',
                  }}
                  htmlFor="forgot-desktop-email"
                >
                  Registered Email Address
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
                    id="forgot-desktop-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      padding: '0.78rem 0.65rem',
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
                  marginTop: '0.25rem',
                  padding: '0.85rem 1.25rem',
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
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* In-Card "Remember your password? Sign In" */}
              <div
                style={{
                  textAlign: 'center',
                  marginTop: '0.5rem',
                  fontSize: '0.83rem',
                  color: '#4B5563',
                }}
              >
                Remember your password?{' '}
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

              {/* Create Account Link */}
              <div style={{ textAlign: 'center' }}>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    padding: '0.62rem 1rem',
                    borderRadius: '9999px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
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
                  Create New Account
                </Link>
              </div>
            </form>
          </div>

          {/* Card Footer: Copyright & Legal Links */}
          <footer
            style={{
              textAlign: 'center',
              marginTop: '0.85rem',
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
