import { useState, useEffect, useCallback } from 'react';
import { ideaService } from '../services/ideaService';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export function useIdeas() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIdeas = useCallback(async (isBackground = false) => {
    if (!user) {
      setIdeas([]);
      setLoading(false);
      return;
    }
    if (!isBackground) setLoading(true);
    try {
      const data = await ideaService.getIdeas();
      setIdeas(data);
      setError(null);
    } catch (err) {
      if (
        err?.status === 401 ||
        err?.statusCode === 401 ||
        err?.error === 'AUTH_UNAUTHORIZED' ||
        err?.message?.includes('Invalid token') ||
        err?.message?.includes('expired')
      ) {
        signOut?.();
      } else {
        console.error('Failed to fetch ideas:', err);
        setError(err.message);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user, signOut]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // Wire Realtime sync for live multi-tab & multi-device updates
  useEffect(() => {
    if (!user?.id) return;
    realtimeService.init(user.id);

    const unsubscribe = realtimeService.on('ideas:changed', () => {
      fetchIdeas(true);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, fetchIdeas]);

  const addIdea = async (ideaData) => {
    if (!user) return null;
    try {
      const created = await ideaService.createIdea(ideaData, user.id);
      setIdeas((prev) => [created, ...prev]);
      showToast('✓ Idea saved successfully', 'success');
      realtimeService.broadcast('ideas:changed');

      // Play soft celebratory confetti
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#D4A72C', '#F3CA4F', '#A67E16'],
        });
      } catch (e) {
        // Confetti optional
      }

      return created;
    } catch (err) {
      console.error('Save idea error:', err);
      showToast(err.message || 'Unable to save the idea', 'error');
      throw err;
    }
  };

  const editIdea = async (id, updates) => {
    try {
      const updated = await ideaService.updateIdea(id, updates);
      setIdeas((prev) => prev.map((item) => (item.id === id ? updated : item)));
      showToast('✓ Idea updated', 'success');
      realtimeService.broadcast('ideas:changed');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update idea', 'error');
      throw err;
    }
  };

  const deleteIdea = async (id) => {
    try {
      await ideaService.deleteIdea(id);
      setIdeas((prev) => prev.filter((item) => item.id !== id));
      showToast('✓ Idea deleted', 'success');
      realtimeService.broadcast('ideas:changed');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to delete idea', 'error');
      throw err;
    }
  };

  const toggleFavorite = async (id) => {
    const target = ideas.find((i) => i.id === id);
    if (!target) return;
    const newFav = !target.is_favorite;

    // Optimistic UI update
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_favorite: newFav } : i))
    );

    try {
      await ideaService.toggleFavorite(id, target.is_favorite);
      showToast(newFav ? 'Marked as favorite ⭐' : 'Removed from favorites', 'info');
      realtimeService.broadcast('ideas:changed');
    } catch (err) {
      // Revert on error
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_favorite: target.is_favorite } : i))
      );
      showToast('Failed to update favorite', 'error');
    }
  };

  const changeStatus = async (id, newStatus) => {
    const target = ideas.find((i) => i.id === id);
    if (!target) return;

    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );

    try {
      await ideaService.updateStatus(id, newStatus);
      showToast(`Status updated to ${newStatus}`, 'info');
      realtimeService.broadcast('ideas:changed');
    } catch (err) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: target.status } : i))
      );
      showToast('Failed to update status', 'error');
    }
  };

  return {
    ideas,
    loading,
    error,
    refreshIdeas: fetchIdeas,
    addIdea,
    editIdea,
    deleteIdea,
    toggleFavorite,
    changeStatus,
  };
}
