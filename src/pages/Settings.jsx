import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { insforge } from '../services/insforge';
import {
  Lock,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetEmailSending, setResetEmailSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // First verify current password by testing sign-in with current credentials
      if (currentPassword && user?.email) {
        const { data: verifyData, error: verifyErr } = await insforge.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (verifyErr) {
          throw new Error('Current password is incorrect. Please try again.');
        }
        if (verifyData?.accessToken) {
          localStorage.setItem('ideavault_auth_session', JSON.stringify({
            accessToken: verifyData.accessToken,
            refreshToken: verifyData.refreshToken || null,
            user: verifyData.user || user,
          }));
          insforge.setAccessToken(verifyData.accessToken);
        }
      }

      // If InsForge has updateUser or password update support
      if (insforge.auth.updateUser) {
        const { error: updateErr } = await insforge.auth.updateUser({
          password: newPassword,
        });
        if (updateErr) throw updateErr;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setResetEmailSending(true);
    setError(null);
    try {
      const { error: resetErr } = await insforge.auth.sendResetPasswordEmail({
        email: user.email,
        redirectTo: window.location.origin + '/settings',
      });
      if (resetErr) throw resetErr;
      showToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      console.error('Reset email error:', err);
      showToast(err.message || 'Unable to send reset email', 'error');
    } finally {
      setResetEmailSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '520px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/profile')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: '0.88rem',
          cursor: 'pointer',
          marginBottom: '1.25rem',
        }}
      >
        <ArrowLeft size={16} /> Back to Profile
      </button>

      {/* Main Settings Card: Update Password */}
      <div
        className="iv-card-elevated"
        style={{
          padding: '2rem 1.75rem',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-mustard-subtle)',
              color: 'var(--color-mustard)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Lock size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Update Password</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage your credentials for account security
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10B981',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>Password updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword}>
          {/* Current Password */}
          <div className="form-field-group">
            <label className="form-label" htmlFor="current-pass">
              Current Password
            </label>
            <div className="form-input-wrap">
              <Lock className="form-input-icon" size={17} />
              <input
                id="current-pass"
                type={showPass ? 'text' : 'password'}
                className="form-input-control has-icon"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="form-field-group">
            <label className="form-label" htmlFor="new-pass">
              New Password
            </label>
            <div className="form-input-wrap">
              <Lock className="form-input-icon" size={17} />
              <input
                id="new-pass"
                type={showPass ? 'text' : 'password'}
                className="form-input-control has-icon"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="form-field-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" htmlFor="confirm-pass">
              Confirm New Password
            </label>
            <div className="form-input-wrap">
              <Lock className="form-input-icon" size={17} />
              <input
                id="confirm-pass"
                type={showPass ? 'text' : 'password'}
                className="form-input-control has-icon"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button
            variant="mustard"
            type="submit"
            loading={loading}
            style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
          >
            Update Password
          </Button>
        </form>

        {/* Alternative: Send password reset link */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            Forgot your current password?
          </p>
          <Button
            variant="ghost"
            size="sm"
            icon={Mail}
            loading={resetEmailSending}
            onClick={handleSendResetEmail}
            style={{ fontSize: '0.82rem', color: 'var(--color-mustard)' }}
          >
            Send Reset Link to {user?.email}
          </Button>
        </div>
      </div>
    </div>
  );
}
