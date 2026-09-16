import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from '../services/insforge';
import { categoryService } from '../services/categoryService';
import { profileService } from '../services/profileService';

const SESSION_STORAGE_KEY = 'ideavault_auth_session';

function getLocalSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.accessToken && parsed.user) {
      const savedAvatar =
        localStorage.getItem(`ideavault_avatar_${parsed.user.id}`) ||
        localStorage.getItem('ideavault_avatar_global') ||
        parsed.user.avatar_url ||
        parsed.user.user_metadata?.avatar_url;

      if (savedAvatar) {
        parsed.user.avatar_url = savedAvatar;
      }

      // Check for saved profile extra metadata (bio, custom fields)
      try {
        const extraRaw = localStorage.getItem(`ideavault_profile_extra_${parsed.user.id}`);
        if (extraRaw) {
          const extra = JSON.parse(extraRaw);
          parsed.user.user_metadata = {
            ...(parsed.user.user_metadata || {}),
            bio: parsed.user.user_metadata?.bio || extra.bio,
            fullName: parsed.user.user_metadata?.fullName || extra.fullName || parsed.user.name,
          };
          if (!parsed.user.bio && extra.bio) {
            parsed.user.bio = extra.bio;
          }
        }
      } catch (e) {}

      if (savedAvatar) {
        parsed.user.user_metadata = { ...(parsed.user.user_metadata || {}), avatar_url: savedAvatar };
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local session:', e);
  }
  return null;
}

function saveLocalSession(sessionData) {
  if (typeof window === 'undefined' || !sessionData) return;
  try {
    const avatarUrl =
      sessionData.user?.avatar_url ||
      sessionData.user?.user_metadata?.avatar_url ||
      (sessionData.user?.id ? localStorage.getItem(`ideavault_avatar_${sessionData.user.id}`) : null) ||
      localStorage.getItem('ideavault_avatar_global');

    if (avatarUrl && sessionData.user) {
      sessionData.user.avatar_url = avatarUrl;
      sessionData.user.user_metadata = {
        ...(sessionData.user.user_metadata || {}),
        avatar_url: avatarUrl,
      };
      if (sessionData.user.id) {
        try {
          localStorage.setItem(`ideavault_avatar_${sessionData.user.id}`, avatarUrl);
        } catch (e) {}
      }
      try {
        localStorage.setItem('ideavault_avatar_global', avatarUrl);
      } catch (e) {}
    }

    const toSave = {
      accessToken: sessionData.accessToken,
      refreshToken: sessionData.refreshToken || null,
      user: sessionData.user,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('Failed to save session locally:', e);
  }
}

function clearLocalSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear local session:', e);
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initialSession = getLocalSession();
  const [user, setUser] = useState(() => initialSession?.user || null);
  const [loading, setLoading] = useState(() => !initialSession);

  // Restore & verify session on app load
  useEffect(() => {
    let cancelled = false;

    async function hydrateAuth() {
      const saved = getLocalSession();

      if (saved?.accessToken && saved?.user) {
        // Ensure SDK has the token & session populated
        try {
          insforge.tokenManager.saveSession({
            accessToken: saved.accessToken,
            user: saved.user,
          });
          insforge.setAccessToken(saved.accessToken);
        } catch (e) {
          console.warn('Error setting session in SDK:', e);
        }

        if (!user && !cancelled) {
          setUser(saved.user);
        }

        if (!cancelled) {
          setLoading(false);
        }

        // Verify token with backend in background
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (cancelled) return;

          if (!error && data?.user) {
            const savedAvatar =
              localStorage.getItem(`ideavault_avatar_${data.user.id}`) ||
              localStorage.getItem('ideavault_avatar_global') ||
              saved.user?.avatar_url ||
              data.user.avatar_url ||
              data.user.user_metadata?.avatar_url;

            if (savedAvatar) {
              data.user.avatar_url = savedAvatar;
            }

            // Sync bio and profile fields from InsForge auth profile/metadata and user_settings
            let remoteBio = data.user.user_metadata?.bio || data.user.profile?.bio || data.user.bio;
            if (!remoteBio) {
              try {
                const settings = await profileService.getUserSettings(data.user.id);
                if (settings?.bio) {
                  remoteBio = settings.bio;
                }
              } catch (e) {}
            }

            let localExtra = {};
            try {
              const extraRaw = localStorage.getItem(`ideavault_profile_extra_${data.user.id}`);
              if (extraRaw) localExtra = JSON.parse(extraRaw);
            } catch (e) {}

            const resolvedBio = remoteBio !== undefined && remoteBio !== null && remoteBio !== '' ? remoteBio : (localExtra.bio || '');

            data.user.bio = resolvedBio;
            data.user.user_metadata = {
              ...(data.user.user_metadata || {}),
              ...(data.user.profile || {}),
              bio: resolvedBio,
              avatar_url: savedAvatar || data.user.avatar_url,
            };

            setUser(data.user);
            saveLocalSession({
              accessToken: saved.accessToken,
              refreshToken: saved.refreshToken,
              user: data.user,
            });
            categoryService.seedDefaultCategories(data.user.id).catch(console.warn);
          } else if (
            error &&
            (error.status === 401 ||
              error.statusCode === 401 ||
              error.code === 'UNAUTHORIZED' ||
              error.error === 'AUTH_UNAUTHORIZED' ||
              error.message?.includes('Invalid token') ||
              error.message?.includes('expired') ||
              error.message?.includes('unauthorized') ||
              error.message?.includes('JWT'))
          ) {
            // Token is explicitly expired or invalid on server
            console.warn('Session expired or unauthorized, clearing session');
            clearLocalSession();
            insforge.setAccessToken(null);
            insforge.tokenManager?.clearSession?.();
            setUser(null);
          }
        } catch (err) {
          if (
            err?.status === 401 ||
            err?.statusCode === 401 ||
            err?.code === 'UNAUTHORIZED' ||
            err?.error === 'AUTH_UNAUTHORIZED' ||
            err?.message?.includes('Invalid token') ||
            err?.message?.includes('expired') ||
            err?.message?.includes('unauthorized')
          ) {
            clearLocalSession();
            insforge.setAccessToken(null);
            insforge.tokenManager?.clearSession?.();
            setUser(null);
          } else {
            // Network errors should not log the user out
            console.warn('Auth verification check warning:', err);
          }
        }
      } else {
        // No local session, attempt normal hydration
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (cancelled) return;
          if (!error && data?.user) {
            const savedAvatar =
              localStorage.getItem(`ideavault_avatar_${data.user.id}`) ||
              localStorage.getItem('ideavault_avatar_global') ||
              data.user.avatar_url ||
              data.user.user_metadata?.avatar_url;

            if (savedAvatar) {
              data.user.avatar_url = savedAvatar;
            }

            let remoteBio = data.user.user_metadata?.bio || data.user.profile?.bio || data.user.bio;
            if (!remoteBio) {
              try {
                const settings = await profileService.getUserSettings(data.user.id);
                if (settings?.bio) {
                  remoteBio = settings.bio;
                }
              } catch (e) {}
            }

            let localExtra = {};
            try {
              const extraRaw = localStorage.getItem(`ideavault_profile_extra_${data.user.id}`);
              if (extraRaw) localExtra = JSON.parse(extraRaw);
            } catch (e) {}

            const resolvedBio = remoteBio !== undefined && remoteBio !== null && remoteBio !== '' ? remoteBio : (localExtra.bio || '');

            data.user.bio = resolvedBio;
            data.user.user_metadata = {
              ...(data.user.user_metadata || {}),
              ...(data.user.profile || {}),
              bio: resolvedBio,
              avatar_url: savedAvatar || data.user.avatar_url,
            };

            setUser(data.user);
            categoryService.seedDefaultCategories(data.user.id).catch(console.warn);
          } else {
            setUser(null);
          }
        } catch (err) {
          if (!cancelled) {
            setUser(null);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
    }

    hydrateAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data?.user) {
      if (data.accessToken) {
        saveLocalSession(data);
        try {
          insforge.tokenManager.saveSession(data);
          insforge.setAccessToken(data.accessToken);
        } catch (e) {
          console.warn('Error syncing token manager after signIn:', e);
        }
      }
      setUser(data.user);
      categoryService.seedDefaultCategories(data.user.id).catch(console.warn);
    }
    return data;
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
    });

    if (error) throw error;
    if (data?.user) {
      if (data.accessToken) {
        saveLocalSession(data);
        try {
          insforge.tokenManager.saveSession(data);
          insforge.setAccessToken(data.accessToken);
        } catch (e) {
          console.warn('Error syncing token manager after signUp:', e);
        }
      }
      setUser(data.user);
      categoryService.seedDefaultCategories(data.user.id).catch(console.warn);
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    clearLocalSession();
    try {
      insforge.setAccessToken(null);
      insforge.tokenManager?.clearSession?.();
      await insforge.auth.signOut();
    } catch (err) {
      console.warn('Sign out warning:', err);
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfileData = useCallback(async ({ name, bio, ...customFields }) => {
    if (!user) return;

    // 1. Send update to InsForge Auth User Profile & Metadata in InsForge Cloud
    try {
      if (insforge.auth.setProfile) {
        await insforge.auth.setProfile({
          name: name || user.name,
          bio: bio !== undefined ? bio : (user.user_metadata?.bio || user.bio || ''),
          ...customFields,
        });
      }
      if (insforge.auth.updateUser) {
        await insforge.auth.updateUser({
          name: name || user.name,
          data: {
            bio: bio !== undefined ? bio : (user.user_metadata?.bio || user.bio || ''),
            ...customFields,
          }
        });
      }
    } catch (err) {
      console.warn('InsForge update profile auth error:', err);
    }

    // 2. Also persist to InsForge database user_settings table
    try {
      if (bio !== undefined && profileService?.updateUserSettings) {
        await profileService.updateUserSettings(user.id, { bio }).catch(() => {});
      }
    } catch (e) {}

    // 3. Update local session & user state
    const updatedMetadata = {
      ...(user.user_metadata || {}),
      ...(user.profile || {}),
      ...(bio !== undefined ? { bio } : {}),
      ...customFields,
    };

    const updated = {
      ...user,
      name: name || user.name,
      bio: bio !== undefined ? bio : (user.bio || user.user_metadata?.bio),
      user_metadata: updatedMetadata,
      profile: updatedMetadata,
    };

    setUser(updated);
    const saved = getLocalSession();
    if (saved) {
      saveLocalSession({ ...saved, user: updated });
    }

    try {
      localStorage.setItem(`ideavault_profile_extra_${user.id}`, JSON.stringify({
        fullName: updated.name,
        email: updated.email,
        bio: updated.bio || updated.user_metadata?.bio || '',
        ...customFields,
      }));
    } catch (e) {}
  }, [user]);

  const updateProfileName = useCallback(async (newName) => {
    return updateProfileData({ name: newName });
  }, [updateProfileData]);

  const updateProfileAvatar = useCallback(async (newAvatarUrl) => {
    if (!user) return;
    try {
      if (newAvatarUrl) {
        localStorage.setItem(`ideavault_avatar_${user.id}`, newAvatarUrl);
        localStorage.setItem('ideavault_avatar_global', newAvatarUrl);
      } else {
        localStorage.removeItem(`ideavault_avatar_${user.id}`);
        localStorage.removeItem('ideavault_avatar_global');
      }
    } catch (e) { }

    const updated = {
      ...user,
      avatar_url: newAvatarUrl,
      user_metadata: { ...(user.user_metadata || {}), avatar_url: newAvatarUrl },
    };
    setUser(updated);
    const saved = getLocalSession();
    if (saved) {
      saveLocalSession({ ...saved, user: updated });
    }

    try {
      if (insforge.auth.updateUser) {
        await insforge.auth.updateUser({
          data: { avatar_url: newAvatarUrl }
        });
      }
      if (insforge.auth.setProfile) {
        await insforge.auth.setProfile({
          avatar_url: newAvatarUrl,
        });
      }
    } catch (err) {
      console.warn('Update user avatar error:', err);
    }
  }, [user]);

  const signInWithOAuth = useCallback(async (provider = 'github') => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { data, error } = await insforge.auth.signInWithOAuth(provider.toLowerCase(), {
        redirectTo: `${origin}/`,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`OAuth ${provider} error:`, err);
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        updateProfileName,
        updateProfileAvatar,
        updateProfileData,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
