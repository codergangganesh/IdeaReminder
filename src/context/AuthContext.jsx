import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from '../services/insforge';
import { categoryService } from '../services/categoryService';
import { profileService } from '../services/profileService';

const SESSION_STORAGE_KEY = 'ideavault_auth_session';

export function extractAvatar(userObj) {
  if (!userObj) return null;
  return (
    userObj.avatar_url ||
    userObj.user_metadata?.avatar_url ||
    userObj.user_metadata?.picture ||
    userObj.user_metadata?.avatar ||
    userObj.picture ||
    userObj.profile?.avatar_url ||
    userObj.profile?.picture ||
    (userObj.id ? localStorage.getItem(`ideavault_avatar_${userObj.id}`) : null) ||
    localStorage.getItem('ideavault_avatar_global') ||
    null
  );
}

function getLocalSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.accessToken || parsed.user)) {
      const savedAvatar = extractAvatar(parsed.user);

      if (savedAvatar) {
        parsed.user.avatar_url = savedAvatar;
        parsed.user.user_metadata = {
          ...(parsed.user.user_metadata || {}),
          avatar_url: savedAvatar,
          picture: savedAvatar,
        };
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

      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local session:', e);
  }
  return null;
}

function saveLocalSession(sessionData) {
  if (typeof window === 'undefined' || !sessionData || !sessionData.user) return;
  try {
    const avatarUrl = extractAvatar(sessionData.user);

    if (avatarUrl && sessionData.user) {
      sessionData.user.avatar_url = avatarUrl;
      sessionData.user.user_metadata = {
        ...(sessionData.user.user_metadata || {}),
        avatar_url: avatarUrl,
        picture: avatarUrl,
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

    const currentToken =
      sessionData.accessToken ||
      insforge.tokenManager?.getSession?.()?.accessToken ||
      null;

    const currentRefreshToken =
      sessionData.refreshToken ||
      insforge.tokenManager?.getSession?.()?.refreshToken ||
      null;

    const toSave = {
      accessToken: currentToken,
      refreshToken: currentRefreshToken,
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

  const refreshAuth = useCallback(async () => {
    const saved = getLocalSession();
    const tokenToRefresh = saved?.refreshToken || insforge.tokenManager?.getSession?.()?.refreshToken;

    try {
      const { data, error } = await insforge.auth.refreshSession(
        tokenToRefresh ? { refreshToken: tokenToRefresh } : undefined
      );

      if (!error && data?.accessToken) {
        insforge.setAccessToken(data.accessToken);
        try {
          insforge.tokenManager.saveSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || tokenToRefresh,
            user: data.user || saved?.user,
          });
        } catch (e) {}

        const finalUser = data.user || saved?.user;
        if (finalUser) {
          saveLocalSession({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || tokenToRefresh,
            user: finalUser,
          });
          setUser(finalUser);
        }
        return true;
      } else if (
        error &&
        (error.message?.includes('invalid_grant') ||
          error.message?.includes('revoked') ||
          error.message?.includes('Refresh token expired') ||
          error.status === 400 ||
          error.statusCode === 400)
      ) {
        console.warn('Session refresh token permanently invalid, logging out:', error.message);
        clearLocalSession();
        insforge.setAccessToken(null);
        insforge.tokenManager?.clearSession?.();
        setUser(null);
        return false;
      }
    } catch (err) {
      console.warn('Network issue during refreshAuth, retaining local session:', err);
    }
    return false;
  }, []);

  // Listen to SDK auth state changes for automatic token updates
  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = insforge.auth?.onAuthStateChange?.((event, session) => {
        if (session?.user) {
          setUser(session.user);
          if (session.accessToken) {
            saveLocalSession(session);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          clearLocalSession();
        }
      });
    } catch (e) {
      console.warn('Could not bind onAuthStateChange:', e);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

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
            refreshToken: saved.refreshToken,
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
            const savedAvatar = extractAvatar(data.user) || extractAvatar(saved.user);

            if (savedAvatar) {
              data.user.avatar_url = savedAvatar;
              if (data.user.id) {
                try {
                  localStorage.setItem(`ideavault_avatar_${data.user.id}`, savedAvatar);
                } catch (e) {}
              }
              try {
                localStorage.setItem('ideavault_avatar_global', savedAvatar);
              } catch (e) {}
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
              picture: savedAvatar || data.user.avatar_url,
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
            // Token expired; automatically perform session refresh using refresh token!
            console.log('Access token expired, performing seamless refresh...');
            const refreshed = await refreshAuth();
            if (!refreshed && !saved.user) {
              clearLocalSession();
              insforge.setAccessToken(null);
              insforge.tokenManager?.clearSession?.();
              setUser(null);
            }
          }
        } catch (err) {
          // Network errors or momentary connectivity issues should never log the user out
          console.warn('Auth verification check warning:', err);
        }
      } else {
        // No local session, attempt normal hydration (e.g. cold load or OAuth callback)
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (cancelled) return;
          if (!error && data?.user) {
            const savedAvatar = extractAvatar(data.user);

            if (savedAvatar) {
              data.user.avatar_url = savedAvatar;
              if (data.user.id) {
                try {
                  localStorage.setItem(`ideavault_avatar_${data.user.id}`, savedAvatar);
                } catch (e) {}
              }
              try {
                localStorage.setItem('ideavault_avatar_global', savedAvatar);
              } catch (e) {}
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
              picture: savedAvatar || data.user.avatar_url,
            };

            setUser(data.user);
            saveLocalSession({
              user: data.user,
            });
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

  const signInWithOAuth = useCallback(async (provider = 'google', options = {}) => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const normalizedProvider = provider.toLowerCase();
      const oauthParams = {
        redirectTo: `${origin}/`,
        ...(normalizedProvider === 'google' ? { additionalParams: { prompt: 'select_account' } } : {}),
        ...options,
      };
      const { data, error } = await insforge.auth.signInWithOAuth(normalizedProvider, oauthParams);
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
        refreshAuth,
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
