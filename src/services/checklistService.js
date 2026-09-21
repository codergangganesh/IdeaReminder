import { insforge } from './insforge';

export const DEFAULT_FOLDER_COLORS = [
  '#D4A72C', // Mustard
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const DEFAULT_FOLDER_ICONS = [
  '📁', '💼', '🚀', '🎯', '🛒', '⚡', '💻', '🎨', '📚', '🏠', '✨', '📝'
];

export const checklistService = {
  // --- Folders ---
  async getFolders() {
    const { data, error } = await insforge.database
      .from('checklist_folders')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createFolder(folderData, userId) {
    const payload = {
      user_id: userId,
      name: folderData.name.trim(),
      description: folderData.description || '',
      icon: folderData.icon || '📁',
      color: folderData.color || '#D4A72C',
      position: folderData.position || 0,
    };

    const { data, error } = await insforge.database
      .from('checklist_folders')
      .insert([payload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateFolder(folderId, updates) {
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.position !== undefined) payload.position = updates.position;

    const { data, error } = await insforge.database
      .from('checklist_folders')
      .update(payload)
      .eq('id', folderId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteFolder(folderId) {
    const { error } = await insforge.database
      .from('checklist_folders')
      .delete()
      .eq('id', folderId);

    if (error) throw error;
    return true;
  },

  // --- Checklists ---
  async getChecklists(folderId = null) {
    let query = insforge.database
      .from('checklists')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data: checklists, error: clError } = await query;
    if (clError) throw clError;
    if (!checklists || checklists.length === 0) return [];

    // Fetch items for all user checklists in a single request
    const { data: items, error: itemsError } = await insforge.database
      .from('checklist_items')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    // Group items by checklist_id
    const itemsMap = {};
    for (const item of (items || [])) {
      if (!itemsMap[item.checklist_id]) {
        itemsMap[item.checklist_id] = [];
      }
      itemsMap[item.checklist_id].push(item);
    }

    return checklists.map((cl) => ({
      ...cl,
      items: itemsMap[cl.id] || [],
    }));
  },

  async getChecklistById(checklistId) {
    const { data: checklist, error: clError } = await insforge.database
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .limit(1);

    if (clError) throw clError;
    if (!checklist || checklist.length === 0) return null;

    const { data: items, error: itemsError } = await insforge.database
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (itemsError) throw itemsError;

    return {
      ...checklist[0],
      items: items || [],
    };
  },

  async createChecklist(checklistData, userId) {
    const payload = {
      user_id: userId,
      folder_id: checklistData.folder_id || null,
      title: checklistData.title.trim(),
      description: checklistData.description || '',
      icon: checklistData.icon || '📝',
      color: checklistData.color || '#D4A72C',
      is_pinned: Boolean(checklistData.is_pinned),
      position: checklistData.position || 0,
    };

    const { data, error } = await insforge.database
      .from('checklists')
      .insert([payload])
      .select();

    if (error) throw error;
    const createdChecklist = data?.[0];

    // If initial items were provided, insert them
    let createdItems = [];
    if (Array.isArray(checklistData.initialItems) && checklistData.initialItems.length > 0) {
      const itemsPayload = checklistData.initialItems
        .filter((text) => typeof text === 'string' && text.trim().length > 0)
        .map((text, idx) => ({
          checklist_id: createdChecklist.id,
          user_id: userId,
          content: text.trim(),
          is_completed: false,
          position: idx,
        }));

      if (itemsPayload.length > 0) {
        const { data: itemsData, error: itemsErr } = await insforge.database
          .from('checklist_items')
          .insert(itemsPayload)
          .select();

        if (itemsErr) {
          console.warn('Error adding initial items to checklist:', itemsErr.message);
        } else {
          createdItems = itemsData || [];
        }
      }
    }

    return {
      ...createdChecklist,
      items: createdItems,
    };
  },

  async updateChecklist(checklistId, updates) {
    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.folder_id !== undefined) payload.folder_id = updates.folder_id || null;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.is_pinned !== undefined) payload.is_pinned = updates.is_pinned;
    if (updates.position !== undefined) payload.position = updates.position;

    const { data, error } = await insforge.database
      .from('checklists')
      .update(payload)
      .eq('id', checklistId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteChecklist(checklistId) {
    const { error } = await insforge.database
      .from('checklists')
      .delete()
      .eq('id', checklistId);

    if (error) throw error;
    return true;
  },

  async togglePin(checklistId, currentPinned) {
    return this.updateChecklist(checklistId, { is_pinned: !currentPinned });
  },

  // --- Checklist Items ---
  async createItem(itemData, userId) {
    const payload = {
      checklist_id: itemData.checklist_id,
      user_id: userId,
      content: itemData.content.trim(),
      is_completed: false,
      position: itemData.position || 0,
      due_date: itemData.due_date || null,
    };

    const { data, error } = await insforge.database
      .from('checklist_items')
      .insert([payload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateItem(itemId, updates) {
    const payload = {};
    if (updates.content !== undefined) payload.content = updates.content.trim();
    if (updates.is_completed !== undefined) {
      payload.is_completed = updates.is_completed;
      payload.completed_at = updates.is_completed ? new Date().toISOString() : null;
    }
    if (updates.position !== undefined) payload.position = updates.position;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date;

    const { data, error } = await insforge.database
      .from('checklist_items')
      .update(payload)
      .eq('id', itemId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async toggleItemCompletion(itemId, currentCompleted) {
    return this.updateItem(itemId, { is_completed: !currentCompleted });
  },

  async deleteItem(itemId) {
    const { error } = await insforge.database
      .from('checklist_items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  },

  async clearCompletedItems(checklistId) {
    const { error } = await insforge.database
      .from('checklist_items')
      .delete()
      .eq('checklist_id', checklistId)
      .eq('is_completed', true);

    if (error) throw error;
    return true;
  },

  // --- Statistics Helper ---
  calculateStats(checklists = []) {
    let totalItems = 0;
    let completedItems = 0;

    for (const cl of checklists) {
      const items = cl.items || [];
      totalItems += items.length;
      completedItems += items.filter((item) => item.is_completed).length;
    }

    const pendingItems = totalItems - completedItems;
    const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const completedChecklists = checklists.filter(
      (cl) => cl.items && cl.items.length > 0 && cl.items.every((item) => item.is_completed)
    ).length;

    return {
      totalChecklists: checklists.length,
      completedChecklists,
      totalItems,
      completedItems,
      pendingItems,
      completionRate,
    };
  },
};
