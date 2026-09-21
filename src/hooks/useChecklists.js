import { useState, useEffect, useCallback } from 'react';
import { checklistService } from '../services/checklistService';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export function useChecklists() {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const [folders, setFolders] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!user) {
      setFolders([]);
      setChecklists([]);
      setLoading(false);
      return;
    }

    if (!isBackground) setLoading(true);
    try {
      const [fetchedFolders, fetchedChecklists] = await Promise.all([
        checklistService.getFolders(),
        checklistService.getChecklists(),
      ]);

      setFolders(fetchedFolders);
      setChecklists(fetchedChecklists);
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
        console.error('Failed to fetch checklists/folders:', err);
        setError(err.message);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [user, signOut]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Wire InsForge Realtime sync for cross-tab & multi-device updates
  useEffect(() => {
    if (!user?.id) return;
    realtimeService.init(user.id);

    const unsubscribe = realtimeService.on('checklists:changed', () => {
      fetchData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id, fetchData]);

  // --- Folder operations ---
  const addFolder = async (folderData) => {
    if (!user) return null;
    try {
      const created = await checklistService.createFolder(folderData, user.id);
      setFolders((prev) => [...prev, created]);
      showToast('✓ Folder created successfully', 'success');
      realtimeService.broadcast('checklists:changed');
      return created;
    } catch (err) {
      console.error('Add folder error:', err);
      showToast(err.message || 'Failed to create folder', 'error');
      throw err;
    }
  };

  const editFolder = async (folderId, updates) => {
    try {
      const updated = await checklistService.updateFolder(folderId, updates);
      setFolders((prev) => prev.map((f) => (f.id === folderId ? updated : f)));
      showToast('✓ Folder updated', 'success');
      realtimeService.broadcast('checklists:changed');
      return updated;
    } catch (err) {
      console.error('Update folder error:', err);
      showToast(err.message || 'Failed to update folder', 'error');
      throw err;
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      await checklistService.deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      // Unlink folder from checklists in local state
      setChecklists((prev) =>
        prev.map((cl) => (cl.folder_id === folderId ? { ...cl, folder_id: null } : cl))
      );
      showToast('✓ Folder removed', 'success');
      realtimeService.broadcast('checklists:changed');
      return true;
    } catch (err) {
      console.error('Delete folder error:', err);
      showToast(err.message || 'Failed to delete folder', 'error');
      throw err;
    }
  };

  // --- Checklist operations ---
  const addChecklist = async (checklistData) => {
    if (!user) return null;
    try {
      const created = await checklistService.createChecklist(checklistData, user.id);
      setChecklists((prev) => [created, ...prev]);
      showToast('✓ Checklist created', 'success');
      realtimeService.broadcast('checklists:changed');
      return created;
    } catch (err) {
      console.error('Add checklist error:', err);
      showToast(err.message || 'Failed to create checklist', 'error');
      throw err;
    }
  };

  const editChecklist = async (checklistId, updates) => {
    try {
      const updated = await checklistService.updateChecklist(checklistId, updates);
      setChecklists((prev) =>
        prev.map((cl) => (cl.id === checklistId ? { ...cl, ...updated } : cl))
      );
      showToast('✓ Checklist updated', 'success');
      realtimeService.broadcast('checklists:changed');
      return updated;
    } catch (err) {
      console.error('Update checklist error:', err);
      showToast(err.message || 'Failed to update checklist', 'error');
      throw err;
    }
  };

  const deleteChecklist = async (checklistId) => {
    try {
      await checklistService.deleteChecklist(checklistId);
      setChecklists((prev) => prev.filter((cl) => cl.id !== checklistId));
      showToast('✓ Checklist deleted', 'success');
      realtimeService.broadcast('checklists:changed');
      return true;
    } catch (err) {
      console.error('Delete checklist error:', err);
      showToast(err.message || 'Failed to delete checklist', 'error');
      throw err;
    }
  };

  const togglePinChecklist = async (checklistId) => {
    const target = checklists.find((cl) => cl.id === checklistId);
    if (!target) return;
    const newPinned = !target.is_pinned;

    setChecklists((prev) =>
      prev.map((cl) => (cl.id === checklistId ? { ...cl, is_pinned: newPinned } : cl))
    );

    try {
      await checklistService.togglePin(checklistId, target.is_pinned);
      showToast(newPinned ? 'Checklist pinned 📌' : 'Checklist unpinned', 'info');
      realtimeService.broadcast('checklists:changed');
    } catch (err) {
      setChecklists((prev) =>
        prev.map((cl) => (cl.id === checklistId ? { ...cl, is_pinned: target.is_pinned } : cl))
      );
      showToast('Failed to toggle pin', 'error');
    }
  };

  // --- Item operations ---
  const addItem = async (checklistId, content) => {
    if (!user || !content.trim()) return null;
    const targetChecklist = checklists.find((cl) => cl.id === checklistId);
    const position = targetChecklist?.items?.length || 0;

    try {
      const createdItem = await checklistService.createItem(
        { checklist_id: checklistId, content, position },
        user.id
      );

      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id === checklistId) {
            return {
              ...cl,
              items: [...(cl.items || []), createdItem],
            };
          }
          return cl;
        })
      );

      realtimeService.broadcast('checklists:changed');
      return createdItem;
    } catch (err) {
      console.error('Add item error:', err);
      showToast(err.message || 'Failed to add task', 'error');
      throw err;
    }
  };

  const editItem = async (checklistId, itemId, updates) => {
    try {
      const updatedItem = await checklistService.updateItem(itemId, updates);
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id === checklistId) {
            return {
              ...cl,
              items: (cl.items || []).map((it) => (it.id === itemId ? { ...it, ...updatedItem } : it)),
            };
          }
          return cl;
        })
      );
      realtimeService.broadcast('checklists:changed');
      return updatedItem;
    } catch (err) {
      console.error('Edit item error:', err);
      showToast(err.message || 'Failed to edit task', 'error');
      throw err;
    }
  };

  const deleteItem = async (checklistId, itemId) => {
    try {
      await checklistService.deleteItem(itemId);
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id === checklistId) {
            return {
              ...cl,
              items: (cl.items || []).filter((it) => it.id !== itemId),
            };
          }
          return cl;
        })
      );
      showToast('Task removed', 'info');
      realtimeService.broadcast('checklists:changed');
      return true;
    } catch (err) {
      console.error('Delete item error:', err);
      showToast(err.message || 'Failed to delete task', 'error');
      throw err;
    }
  };

  const toggleItem = async (checklistId, itemId) => {
    const targetChecklist = checklists.find((cl) => cl.id === checklistId);
    const targetItem = targetChecklist?.items?.find((it) => it.id === itemId);
    if (!targetItem) return;

    const newCompleted = !targetItem.is_completed;

    // Optimistic UI update
    setChecklists((prev) =>
      prev.map((cl) => {
        if (cl.id === checklistId) {
          const updatedItems = (cl.items || []).map((it) =>
            it.id === itemId ? { ...it, is_completed: newCompleted } : it
          );

          // If all items become completed and we have > 1 item, trigger micro-confetti!
          if (
            newCompleted &&
            updatedItems.length > 0 &&
            updatedItems.every((it) => it.is_completed)
          ) {
            try {
              confetti({
                particleCount: 25,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#10B981', '#34D399', '#059669'],
              });
            } catch (e) {
              // Confetti optional
            }
          }

          return {
            ...cl,
            items: updatedItems,
          };
        }
        return cl;
      })
    );

    try {
      await checklistService.toggleItemCompletion(itemId, targetItem.is_completed);
      realtimeService.broadcast('checklists:changed');
    } catch (err) {
      // Revert optimistic update on failure
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id === checklistId) {
            return {
              ...cl,
              items: (cl.items || []).map((it) =>
                it.id === itemId ? { ...it, is_completed: targetItem.is_completed } : it
              ),
            };
          }
          return cl;
        })
      );
      showToast('Failed to update task completion', 'error');
    }
  };

  const clearCompleted = async (checklistId) => {
    try {
      await checklistService.clearCompletedItems(checklistId);
      setChecklists((prev) =>
        prev.map((cl) => {
          if (cl.id === checklistId) {
            return {
              ...cl,
              items: (cl.items || []).filter((it) => !it.is_completed),
            };
          }
          return cl;
        })
      );
      showToast('Cleared completed tasks', 'info');
      realtimeService.broadcast('checklists:changed');
      return true;
    } catch (err) {
      console.error('Clear completed error:', err);
      showToast(err.message || 'Failed to clear completed tasks', 'error');
      throw err;
    }
  };

  return {
    folders,
    checklists,
    loading,
    error,
    refreshChecklists: fetchData,
    addFolder,
    editFolder,
    deleteFolder,
    addChecklist,
    editChecklist,
    deleteChecklist,
    togglePinChecklist,
    addItem,
    editItem,
    deleteItem,
    toggleItem,
    clearCompleted,
  };
}
