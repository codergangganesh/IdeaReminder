import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { insforge } from '../services/insforge';
import { categoryService } from '../services/categoryService';

const SESSION_STORAGE_KEY = 'ideavault_auth_session';

function getLocalSession() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.accessToken && parsed.user) {
      const savedAvatar = localStorage.getItem(`ideavault_avatar_${parsed.user.id}`);
      if (savedAvatar) {
        parsed.user.avatar_url = savedAvatar;
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
            setUser(data.user);
            saveLocalSession({
              accessToken: saved.accessToken,
              refreshToken: saved.refreshToken,
              user: data.user,
            });
            categoryService.seedDefaultCategories(data.user.id).catch(console.warn);
          } else if (error && (error.status === 401 || error.code === 'UNAUTHORIZED' || error.message?.includes('expired'))) {
            // Token is explicitly expired or invalid on server
            console.warn('Session expired or unauthorized, logging out');
            clearLocalSession();
            insforge.setAccessToken(null);
            insforge.tokenManager?.clearSession?.();
            setUser(null);
          }
        } catch (err) {
          // Network errors should not log the user out
          console.warn('Auth verification check warning:', err);
        }
      } else {
        // No local session, attempt normal hydration
        try {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (cancelled) return;
          if (!error && data?.user) {
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

  const updateProfileName = useCallback(async (newName) => {
    if (!user) return;
    try {
      if (insforge.auth.updateUser) {
        await insforge.auth.updateUser({ name: newName });
      }
      const updated = {
        ...user,
        name: newName,
        user_metadata: { ...(user.user_metadata || {}), name: newName },
      };
      setUser(updated);
      const saved = getLocalSession();
      if (saved) {
        saveLocalSession({ ...saved, user: updated });
      }
    } catch (err) {
      console.warn('Update user name error:', err);
    }
  }, [user]);

  const updateProfileAvatar = useCallback(async (newAvatarUrl) => {
    if (!user) return;
    try {
      if (insforge.auth.updateUser) {
        await insforge.auth.updateUser({
          data: { avatar_url: newAvatarUrl }
        });
      }
    } catch (err) {
      console.warn('Update user avatar error:', err);
    }
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
      if (newAvatarUrl) {
        localStorage.setItem(`ideavault_avatar_${user.id}`, newAvatarUrl);
      } else {
        localStorage.removeItem(`ideavault_avatar_${user.id}`);
      }
    } catch (e) { }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfileName,
        updateProfileAvatar,
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
