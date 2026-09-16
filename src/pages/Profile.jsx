import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, extractAvatar } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { insforge } from '../services/insforge';
import {
  Bell,
  Pencil,
  Languages,
  Shield,
  Palette,
  ChevronRight,
  LogOut,
  Check,
  User as UserIcon,
  Camera,
  Trash2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export function Profile() {
  const { user, signOut, updateProfileName, updateProfileAvatar, updateProfileData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Responsive mobile vs desktop view detection (breakpoint 880px)
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 880 : false));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 880);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock scroll on mobile profile view so it fits mobile screen without scrolling
  useEffect(() => {
    if (isMobile) {
      const prevBodyOverflow = document.body.style.overflow;
      const contentBody = document.querySelector('.content-body');
      const prevContentPadding = contentBody ? contentBody.style.padding : '';
      const prevContentOverflow = contentBody ? contentBody.style.overflow : '';
      const prevContentHeight = contentBody ? contentBody.style.height : '';
      const prevContentMaxHeight = contentBody ? contentBody.style.maxHeight : '';

      document.body.style.overflow = 'hidden';
      if (contentBody) {
        contentBody.style.padding = '0';
        contentBody.style.overflow = 'hidden';
        contentBody.style.height = 'calc(100dvh - 60px)';
        contentBody.style.maxHeight = 'calc(100dvh - 60px)';
      }

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        if (contentBody) {
          contentBody.style.padding = prevContentPadding;
          contentBody.style.overflow = prevContentOverflow;
          contentBody.style.height = prevContentHeight;
          contentBody.style.maxHeight = prevContentMaxHeight;
        }
      };
    }
  }, [isMobile]);

  const [imgError, setImgError] = useState(false);
  const displayName = user?.name || user?.user_metadata?.name || 'Mannam Ganesh babu';
  const userEmail = user?.email || 'kit27.ad303@gmail.com';
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = extractAvatar(user);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Dynamic color palette supporting both Light and Dark modes seamlessly
  const colors = {
    cardBg: isDark ? '#111622' : '#FFFFFF',
    cardBorder: isDark ? '1px solid rgba(255, 255, 255, 0.07)' : '1px solid #E2E8F0',
    cardShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
    innerBg: isDark ? '#161C2A' : '#F8FAFC',
    innerBorder: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid #E2E8F0',
    divider: isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : '#475569',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B',
    headingSubtle: isDark ? 'rgba(255, 255, 255, 0.42)' : '#64748B',
    chevronColor: isDark ? 'rgba(255, 255, 255, 0.35)' : '#94A3B8',
    inputBg: isDark ? '#161C2A' : '#FFFFFF',
    inputBorder: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #CBD5E1',
    inputText: isDark ? '#FFFFFF' : '#0F172A',
    inputPlaceholder: isDark ? 'rgba(255, 255, 255, 0.35)' : '#94A3B8',
    hoverBg: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F1F5F9',
    toggleTrackOff: isDark ? '#2A2E39' : '#CBD5E1',
    mobileHeroBg: isDark
      ? 'radial-gradient(circle at 85% 15%, rgba(212, 167, 44, 0.28) 0%, rgba(25, 27, 34, 0.96) 50%, rgba(14, 16, 21, 0.99) 100%)'
      : 'radial-gradient(circle at 85% 15%, rgba(212, 167, 44, 0.2) 0%, #FFFFFF 60%, #F8FAFC 100%)',
    mobileHeroBorder: isDark ? '1px solid rgba(212, 167, 44, 0.22)' : '1px solid rgba(212, 167, 44, 0.35)',
    mobileHeroShadow: isDark
      ? '0 20px 45px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
      : '0 10px 30px rgba(212, 167, 44, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)',
    handwrittenColor: isDark ? 'rgba(255, 255, 255, 0.55)' : '#78350F',
    avatarBadgeBg: isDark ? '#161920' : '#FFFFFF',
    cameraBadgeBorder: isDark ? '2px solid #111622' : '2px solid #FFFFFF',
  };

  // Desktop active menu tab state ('personal', 'security', 'notifications', 'theme')
  const [activeTab, setActiveTab] = useState('personal');

  // Desktop Personal Information editable state
  const STORAGE_KEY = user?.id ? `ideavault_profile_extra_${user.id}` : 'ideavault_profile_extra_default';

  const [profileData, setProfileData] = useState(() => {
    const remoteBio = user?.user_metadata?.bio || user?.profile?.bio || user?.bio;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          fullName: user?.name || user?.user_metadata?.name || parsed.fullName || displayName,
          email: user?.email || parsed.email || userEmail,
          bio: remoteBio !== undefined && remoteBio !== null && remoteBio !== '' ? remoteBio : (parsed.bio !== undefined ? parsed.bio : 'IdeaVault Creator • Capturing thoughts and inspirations daily.'),
        };
      }
    } catch (e) { }
    return {
      fullName: user?.name || user?.user_metadata?.name || displayName,
      email: user?.email || userEmail,
      bio: remoteBio || 'IdeaVault Creator • Capturing thoughts and inspirations daily.',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newName, setNewName] = useState(displayName);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

  // Password update form state inside Security & Password section
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [resetEmailSending, setResetEmailSending] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sync profileData when user name or remote bio updates
  useEffect(() => {
    const remoteBio = user?.user_metadata?.bio || user?.profile?.bio || user?.bio;
    const remoteName = user?.name || user?.user_metadata?.name;
    if (remoteName || remoteBio !== undefined) {
      setProfileData((prev) => ({
        ...prev,
        fullName: remoteName || prev.fullName,
        bio: remoteBio !== undefined && remoteBio !== null && remoteBio !== '' ? remoteBio : prev.bio,
      }));
    }
  }, [user?.name, user?.user_metadata?.name, user?.user_metadata?.bio, user?.profile?.bio, user?.bio]);

  const handleSaveName = async (e) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      if (updateProfileData) {
        await updateProfileData({
          name: newName.trim(),
          bio: editForm.bio,
        });
      } else if (updateProfileName) {
        await updateProfileName(newName.trim());
      }
      setProfileData((prev) => {
        const next = { ...prev, fullName: newName.trim(), bio: editForm.bio };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      showToast('Profile information saved to InsForge cloud!', 'success');
      setEditModalOpen(false);
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDesktopSave = async () => {
    if (isEditing) {
      setSaving(true);
      setProfileData(editForm);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(editForm));
        if (updateProfileData) {
          await updateProfileData({
            name: editForm.fullName,
            bio: editForm.bio,
          });
        } else if (updateProfileName) {
          await updateProfileName(editForm.fullName);
        }
        showToast('Personal information & Bio saved to InsForge cloud!', 'success');
      } catch (e) {
        console.warn('Error saving to InsForge:', e);
        showToast('Saved locally, syncing to InsForge...', 'info');
      } finally {
        setSaving(false);
      }
      setIsEditing(false);
    } else {
      setEditForm(profileData);
      setIsEditing(true);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Password Update Handler inside Security view
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
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

      if (insforge.auth.updateUser) {
        const { error: updateErr } = await insforge.auth.updateUser({
          password: newPassword,
        });
        if (updateErr) throw updateErr;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully!', 'success');
    } catch (err) {
      console.error('Password update error:', err);
      setPasswordError(err.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    setResetEmailSending(true);
    setPasswordError(null);
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

  // Image Upload and Processing Handler
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (updateProfileAvatar) {
            await updateProfileAvatar(compressedDataUrl);
          }
          showToast('Profile picture updated successfully!', 'success');
          setUploadingAvatar(false);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast('Failed to upload profile picture.', 'error');
      setUploadingAvatar(false);
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (updateProfileAvatar) {
      await updateProfileAvatar(null);
      showToast('Profile picture removed. Reverted to default avatar.', 'info');
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  /* =========================================================================
     MOBILE VIEW (Exact match to reference, InsForge Verified badge removed)
     ========================================================================= */
  if (isMobile) {
    return (
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          padding: '0.5rem 1rem 5.5rem 1rem',
          maxWidth: '440px',
          margin: '0 auto',
        }}
      >
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarFileChange}
        />

        {/* Hero Profile Card */}
        <div
          style={{
            position: 'relative',
            background: colors.mobileHeroBg,
            borderRadius: '26px',
            border: colors.mobileHeroBorder,
            padding: '1.75rem 1.25rem',
            boxShadow: colors.mobileHeroShadow,
            marginBottom: '1.5rem',
            overflow: 'hidden',
          }}
        >
          {/* Subtle decorative background circles */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212,167,44,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Left Handwritten Greeting */}
          <div
            style={{
              position: 'absolute',
              left: '1.25rem',
              top: '42%',
              transform: 'translateY(-50%) rotate(-7deg)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: "'Caveat', 'Segoe Print', 'Brush Script MT', cursive, sans-serif",
                fontSize: '0.92rem',
                color: colors.handwrittenColor,
                lineHeight: 1.15,
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              Good to<br />see you!
            </div>
            <div style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>👋</div>
          </div>

          {/* Right Handwritten Quote */}
          <div
            style={{
              position: 'absolute',
              right: '1.2rem',
              top: '20px',
              transform: 'rotate(7deg)',
              pointerEvents: 'none',
              textAlign: 'right',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontFamily: "'Caveat', 'Segoe Print', 'Brush Script MT', cursive, sans-serif",
                fontSize: '0.86rem',
                color: colors.handwrittenColor,
                lineHeight: 1.15,
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              Ideas<br />Today<br />A Brighter<br />Tomorrow
            </div>
            <svg
              width="74"
              height="10"
              viewBox="0 0 74 10"
              fill="none"
              style={{ display: 'block', marginLeft: 'auto', marginTop: '3px' }}
            >
              <path
                d="M2 7C22 2 52 2 72 7"
                stroke="#D4A72C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeOpacity="0.75"
              />
            </svg>
          </div>

          {/* Center Avatar & User Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              zIndex: 3,
            }}
          >
            <div style={{ position: 'relative' }}>
              <div
                onClick={triggerUpload}
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  backgroundColor: '#D4A72C',
                  color: '#121418',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  border: isDark ? '4px solid #14171E' : '4px solid #FFFFFF',
                  boxShadow: isDark ? '0 10px 25px rgba(0, 0, 0, 0.5)' : '0 6px 18px rgba(0, 0, 0, 0.12)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast)',
                }}
                title="Click to change profile picture"
              >
                {uploadingAvatar ? (
                  <div style={{ fontSize: '1rem', color: '#121418', fontWeight: 600 }}>...</div>
                ) : avatarUrl && !imgError ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initial
                )}
              </div>

              {/* Circular Pencil Edit Badge on Bottom-Right of Avatar */}
              <button
                type="button"
                onClick={triggerUpload}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: colors.avatarBadgeBg,
                  border: '2px solid #D4A72C',
                  color: '#D4A72C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
                }}
                title="Upload & Change Profile Picture"
                aria-label="Upload photo"
              >
                <Pencil size={13} />
              </button>
            </div>

            {/* Display Name */}
            <h2
              style={{
                fontSize: '1.28rem',
                fontWeight: 800,
                marginTop: '0.85rem',
                color: colors.textPrimary,
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              {profileData.fullName}
            </h2>

            {/* Email Address */}
            <p
              style={{
                fontSize: '0.83rem',
                color: colors.textSecondary,
                marginTop: '0.2rem',
                textAlign: 'center',
                wordBreak: 'break-all',
              }}
            >
              {profileData.email}
            </p>
          </div>
        </div>

        {/* Section 1: ACCOUNT */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.65rem',
              paddingLeft: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: colors.headingSubtle,
                letterSpacing: '0.08em',
              }}
            >
              ACCOUNT
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: colors.divider,
                marginLeft: '0.75rem',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '18px',
              border: colors.cardBorder,
              boxShadow: colors.cardShadow,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => {
                setNewName(profileData.fullName);
                setEditModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(212, 167, 44, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A72C',
                  }}
                >
                  <UserIcon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                    Edit profile information
                  </div>
                  <div style={{ fontSize: '0.76rem', color: colors.textMuted, marginTop: '1px' }}>
                    Update your display name
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.chevronColor} />
            </div>

            <div
              onClick={() => {
                const next = !notificationsOn;
                setNotificationsOn(next);
                showToast(next ? 'Notifications turned ON' : 'Notifications paused', 'info');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(212, 167, 44, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A72C',
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                    Notifications
                  </div>
                  <div style={{ fontSize: '0.76rem', color: colors.textMuted, marginTop: '1px' }}>
                    Manage your alerts
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: '46px',
                  height: '26px',
                  borderRadius: '13px',
                  backgroundColor: notificationsOn ? '#D4A72C' : colors.toggleTrackOff,
                  padding: '2px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    transform: notificationsOn ? 'translateX(20px)' : 'translateX(0px)',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>
            </div>

            <div
              onClick={() => showToast('Language: English (US)', 'info')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(212, 167, 44, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A72C',
                  }}
                >
                  <Languages size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                    Language
                  </div>
                  <div style={{ fontSize: '0.76rem', color: colors.textMuted, marginTop: '1px' }}>
                    Choose your preferred language
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#D4A72C' }}>
                  English
                </span>
                <ChevronRight size={18} color={colors.chevronColor} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: PREFERENCES */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.65rem',
              paddingLeft: '0.25rem',
            }}
          >
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: colors.headingSubtle,
                letterSpacing: '0.08em',
              }}
            >
              PREFERENCES
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                backgroundColor: colors.divider,
                marginLeft: '0.75rem',
              }}
            />
          </div>

          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '18px',
              border: colors.cardBorder,
              boxShadow: colors.cardShadow,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => navigate('/settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(212, 167, 44, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A72C',
                  }}
                >
                  <Shield size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                    Security
                  </div>
                  <div style={{ fontSize: '0.76rem', color: colors.textMuted, marginTop: '1px' }}>
                    Keep your account safe
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color={colors.chevronColor} />
            </div>

            <div
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '11px',
                    backgroundColor: 'rgba(212, 167, 44, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A72C',
                  }}
                >
                  <Palette size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                    Theme
                  </div>
                  <div style={{ fontSize: '0.76rem', color: colors.textMuted, marginTop: '1px' }}>
                    Make it yours
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#D4A72C' }}>
                  {isDark ? 'Dark mode' : 'Light mode'}
                </span>
                <ChevronRight size={18} color={colors.chevronColor} />
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            padding: '0.88rem',
            borderRadius: '24px',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.07)' : 'rgba(239, 68, 68, 0.05)',
            border: isDark ? '1px solid rgba(239, 68, 68, 0.28)' : '1px solid rgba(239, 68, 68, 0.22)',
            color: '#EF4444',
            fontWeight: 700,
            fontSize: '0.94rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>

        {/* Edit Profile Info Modal */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Profile Information"
          subtitle="Update your full display name and avatar"
          maxWidth="440px"
        >
          <form onSubmit={handleSaveName}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: '16px',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#D4A72C',
                  color: '#121418',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {avatarUrl && !imgError ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initial
                )}
              </div>

              <div style={{ flex: 1, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button type="button" variant="outline" size="sm" onClick={triggerUpload} icon={Camera}>
                  Change Photo
                </Button>
                {avatarUrl && (
                  <Button type="button" variant="danger" size="sm" onClick={handleRemoveAvatar} icon={Trash2}>
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="form-field-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="edit-display-name">
                Full Name
              </label>
              <input
                id="edit-display-name"
                type="text"
                className="form-input-control"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mannam Ganesh babu"
                required
                autoFocus
              />
            </div>

            <div className="form-field-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="edit-mobile-bio">
                Bio / Personal Note
              </label>
              <textarea
                id="edit-mobile-bio"
                className="form-input-control"
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell something about yourself or your creative vision..."
                maxLength={250}
                style={{ resize: 'vertical', lineHeight: 1.4 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Button variant="ghost" onClick={() => setEditModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="mustard" type="submit" loading={saving} icon={Check}>
                Save Profile
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  /* =========================================================================
     DESKTOP VIEW
     ========================================================================= */
  // Left sidebar menu items: "Account Settings" completely removed
  const menuItems = [
    { id: 'personal', label: 'Personal Information', icon: UserIcon },
    { id: 'security', label: 'Security & Password', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'theme', label: 'Theme Preferences', icon: Palette },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 1.5rem 3.5rem 1.5rem',
        display: 'flex',
        gap: '1.75rem',
        alignItems: 'flex-start',
      }}
    >
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleAvatarFileChange}
      />

      {/* LEFT SIDEBAR PANEL */}
      <div
        style={{
          width: '270px',
          flexShrink: 0,
          backgroundColor: colors.cardBg,
          borderRadius: '22px',
          border: colors.cardBorder,
          padding: '1.25rem 0.85rem',
          boxShadow: colors.cardShadow,
        }}
      >
        {/* User Mini-Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.5rem 0.5rem 1.25rem 0.5rem',
            borderBottom: `1px solid ${colors.divider}`,
            marginBottom: '0.85rem',
          }}
        >
          <div
            onClick={triggerUpload}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#D4A72C',
              color: '#121418',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              overflow: 'hidden',
              cursor: 'pointer',
              flexShrink: 0,
              border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid rgba(0,0,0,0.08)',
            }}
            title="Click to change avatar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initial
            )}
          </div>

          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.94rem',
                fontWeight: 700,
                color: colors.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {profileData.fullName}
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                color: '#D4A72C',
                marginTop: '1px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              <span>IdeaVault Member</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.72rem 0.95rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'rgba(212, 167, 44, 0.14)' : 'transparent',
                  color: isActive ? '#D4A72C' : colors.textSecondary,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = colors.hoverBg;
                    e.currentTarget.style.color = colors.textPrimary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.textSecondary;
                  }
                }}
              >
                <Icon size={18} color={isActive ? '#D4A72C' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
            );
          })}

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: colors.divider, margin: '0.5rem 0' }} />

          {/* Sign Out Action */}
          <div
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.72rem 0.95rem',
              borderRadius: '12px',
              cursor: 'pointer',
              color: isDark ? 'rgba(239, 68, 68, 0.85)' : '#DC2626',
              fontWeight: 600,
              fontSize: '0.88rem',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = isDark ? 'rgba(239, 68, 68, 0.85)' : '#DC2626';
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        {/* Clean Profile Header Card (Banner area removed, InsForge Verified badge removed, Account Settings button removed) */}
        <div
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: '24px',
            border: colors.cardBorder,
            padding: '1.75rem 2rem',
            boxShadow: colors.cardShadow,
            display: 'flex',
            alignItems: 'center',
            gap: '1.75rem',
          }}
        >
          {/* Avatar with Camera Badge */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={triggerUpload}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: '#D4A72C',
                color: '#121418',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 800,
                border: '3px solid rgba(212, 167, 44, 0.4)',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              title="Click to change profile picture"
            >
              {uploadingAvatar ? (
                <div style={{ fontSize: '1rem', color: '#121418', fontWeight: 600 }}>...</div>
              ) : avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  onError={() => setImgError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initial
              )}
            </div>

            {/* Mustard Camera Icon Badge */}
            <button
              type="button"
              onClick={triggerUpload}
              style={{
                position: 'absolute',
                bottom: '0px',
                right: '0px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#D4A72C',
                color: '#121418',
                border: colors.cameraBadgeBorder,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
              title="Upload & Change Profile Picture"
            >
              <Camera size={14} />
            </button>
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h1
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: colors.textPrimary,
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {profileData.fullName}
                </h1>
                <div style={{ fontSize: '0.86rem', color: colors.textMuted, marginTop: '0.35rem' }}>
                  {profileData.email} • IdeaVault Member
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TAB 1: PERSONAL INFORMATION (Membership, Backend Cloud, and Data Encryption cards removed) */}
        {activeTab === 'personal' && (
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '24px',
              border: colors.cardBorder,
              padding: '1.75rem 2rem',
              boxShadow: colors.cardShadow,
            }}
          >
            {/* Card Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
                  Personal Information
                </h2>
                <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: '0.2rem 0 0 0' }}>
                  Manage your display name, email, and personal profile bio
                </p>
              </div>

              <button
                type="button"
                onClick={handleDesktopSave}
                style={{
                  background: isEditing ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 167, 44, 0.12)',
                  border: isEditing ? '1px solid #10B981' : '1px solid rgba(212, 167, 44, 0.3)',
                  padding: '0.45rem 1rem',
                  borderRadius: '10px',
                  color: isEditing ? '#10B981' : '#D4A72C',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all var(--transition-fast)',
                }}
              >

                <span>{isEditing ? 'Save' : 'Edit'}</span>
              </button>
            </div>

            {/* 2-Column Information Grid (Full Name & Email Address) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.45rem' }}>
                  Full Name
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: colors.innerBg,
                    border: isEditing ? '1px solid #D4A72C' : colors.innerBorder,
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: colors.textPrimary,
                    fontSize: '0.92rem',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  <UserIcon size={18} color="#D4A72C" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      style={{ flex: 1, background: 'none', border: 'none', color: colors.inputText, outline: 'none', fontSize: '0.92rem' }}
                      placeholder="Enter your full name"
                      autoFocus
                    />
                  ) : (
                    <span>{profileData.fullName}</span>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.45rem' }}>
                  Email Address
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    backgroundColor: colors.innerBg,
                    border: colors.innerBorder,
                    borderRadius: '12px',
                    padding: '0.8rem 1rem',
                    color: colors.textPrimary,
                    fontSize: '0.92rem',
                  }}
                >
                  <Mail size={18} color={colors.textMuted} />
                  <span style={{ color: colors.textPrimary }}>{profileData.email}</span>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.45rem' }}>
                Bio / Personal Note
              </label>
              <div
                style={{
                  backgroundColor: colors.innerBg,
                  border: isEditing ? '1px solid #D4A72C' : colors.innerBorder,
                  borderRadius: '12px',
                  padding: '0.95rem 1rem',
                  minHeight: '85px',
                  color: colors.textPrimary,
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    maxLength={250}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: colors.inputText,
                      outline: 'none',
                      fontSize: '0.92rem',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                    placeholder="Tell something about yourself or your creative vision..."
                  />
                ) : (
                  profileData.bio
                )}
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: colors.textMuted, marginTop: '0.4rem' }}>
                {Math.max(0, 250 - (isEditing ? editForm.bio.length : profileData.bio.length))} characters left
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORD (Update Password form directly within this section) */}
        {activeTab === 'security' && (
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '24px',
              border: colors.cardBorder,
              padding: '2rem 2.25rem',
              boxShadow: colors.cardShadow,
            }}
          >
            {/* Section Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '13px',
                  backgroundColor: 'rgba(212, 167, 44, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4A72C',
                }}
              >
                <Lock size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
                  Update Password
                </h2>
                <p style={{ fontSize: '0.82rem', color: colors.textMuted, margin: '0.2rem 0 0 0' }}>
                  Manage your credentials and keep your IdeaVault account secure
                </p>
              </div>
            </div>

            {/* Error Alert */}
            {passwordError && (
              <div
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Success Alert */}
            {passwordSuccess && (
              <div
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#10B981',
                  fontSize: '0.86rem',
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

            {/* Password Update Form */}
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Current Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.45rem' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={17} color={colors.textMuted} style={{ position: 'absolute', left: '1rem' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.inputBg,
                      border: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '0.8rem 2.75rem 0.8rem 2.65rem',
                      color: colors.inputText,
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#D4A72C')}
                    onBlur={(e) => (e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: '0.9rem',
                      background: 'none',
                      border: 'none',
                      color: colors.textMuted,
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
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.45rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={17} color={colors.textMuted} style={{ position: 'absolute', left: '1rem' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.inputBg,
                      border: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '0.8rem 1rem 0.8rem 2.65rem',
                      color: colors.inputText,
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#D4A72C')}
                    onBlur={(e) => (e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1')}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: colors.textSecondary, marginBottom: '0.45rem' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={17} color={colors.textMuted} style={{ position: 'absolute', left: '1rem' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    style={{
                      width: '100%',
                      backgroundColor: colors.inputBg,
                      border: colors.inputBorder,
                      borderRadius: '12px',
                      padding: '0.8rem 1rem 0.8rem 2.65rem',
                      color: colors.inputText,
                      fontSize: '0.92rem',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#D4A72C')}
                    onBlur={(e) => (e.target.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1')}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={resetEmailSending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D4A72C',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0',
                  }}
                >
                  <Mail size={15} />
                  <span>{resetEmailSending ? 'Sending reset link...' : 'Forgot password? Send reset email'}</span>
                </button>

                <Button
                  type="submit"
                  variant="mustard"
                  icon={ShieldCheck}
                  loading={passwordLoading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '24px',
              border: colors.cardBorder,
              padding: '1.75rem 2rem',
              boxShadow: colors.cardShadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(212, 167, 44, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4A72C',
                }}
              >
                <Bell size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
                  Notification Preferences
                </h2>
                <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: '0.2rem 0 0 0' }}>
                  Configure alerts and reminder notifications
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                const next = !notificationsOn;
                setNotificationsOn(next);
                showToast(next ? 'Notifications turned ON' : 'Notifications paused', 'info');
              }}
              style={{
                backgroundColor: colors.innerBg,
                borderRadius: '16px',
                border: colors.innerBorder,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary }}>
                  Idea Reminder Alerts
                </div>
                <div style={{ fontSize: '0.82rem', color: colors.textMuted, marginTop: '0.2rem' }}>
                  Get notifications when scheduled reminders or task due dates arrive.
                </div>
              </div>

              <div
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  backgroundColor: notificationsOn ? '#D4A72C' : colors.toggleTrackOff,
                  padding: '2px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    transform: notificationsOn ? 'translateX(22px)' : 'translateX(0px)',
                    transition: 'transform 0.2s',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: THEME PREFERENCES */}
        {activeTab === 'theme' && (
          <div
            style={{
              backgroundColor: colors.cardBg,
              borderRadius: '24px',
              border: colors.cardBorder,
              padding: '1.75rem 2rem',
              boxShadow: colors.cardShadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(212, 167, 44, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4A72C',
                }}
              >
                <Palette size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>
                  Theme & Accent
                </h2>
                <p style={{ fontSize: '0.8rem', color: colors.textMuted, margin: '0.2rem 0 0 0' }}>
                  Toggle theme appearance and view the signature Mustard accent
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: colors.innerBg,
                borderRadius: '16px',
                border: colors.innerBorder,
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textPrimary }}>
                  Appearance Mode
                </div>
                <div style={{ fontSize: '0.82rem', color: colors.textMuted, marginTop: '0.2rem' }}>
                  Current active mode: <strong style={{ color: '#D4A72C' }}>{isDark ? 'Dark Mode' : 'Light Mode'}</strong>
                </div>
              </div>

              <Button
                variant="secondary"
                icon={Palette}
                onClick={toggleTheme}
              >
                Switch to {isDark ? 'Light' : 'Dark'} Mode
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
