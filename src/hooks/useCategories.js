import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useCategories() {
  const { user, signOut, refreshAuth } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      if (data.length === 0) {
        // Automatically seed if user has 0 categories
        const seeded = await categoryService.seedDefaultCategories(user.id);
        setCategories(seeded);
      } else {
        setCategories(data);
      }
      setError(null);
    } catch (err) {
      if (
        err?.status === 401 ||
        err?.statusCode === 401 ||
        err?.error === 'AUTH_UNAUTHORIZED' ||
        err?.message?.includes('Invalid token') ||
        err?.message?.includes('expired')
      ) {
        const refreshed = await refreshAuth?.();
        if (refreshed) {
          fetchCategories();
          return;
        }
        console.warn('Authentication token needs renewal for categories fetch');
      } else {
        console.error('Failed to fetch categories:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, refreshAuth]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (categoryData) => {
    if (!user) return null;
    try {
      const newCat = await categoryService.createCategory(categoryData, user.id);
      setCategories((prev) => [...prev, newCat]);
      showToast('Category created successfully', 'success');
      return newCat;
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
      throw err;
    }
  };

  const editCategory = async (id, categoryData) => {
    try {
      const updated = await categoryService.updateCategory(id, categoryData);
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      showToast('Category updated', 'success');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update category', 'error');
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast('Category deleted', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories,
    addCategory,
    editCategory,
    deleteCategory,
  };
}
