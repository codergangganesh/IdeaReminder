import { insforge } from './insforge';

export const profileService = {
  async getUserSettings(userId) {
    if (!userId) return null;
    const { data, error } = await insforge.database
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.warn('Error fetching user settings:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }

    // Initialize default settings if not found
    const defaultSettings = {
      user_id: userId,
      theme: 'dark',
      default_status: 'New',
      default_priority: 'Medium',
    };

    const { data: inserted, error: insertError } = await insforge.database
      .from('user_settings')
      .insert([defaultSettings])
      .select();

    if (insertError) {
      console.warn('Error creating user settings:', insertError.message);
      return defaultSettings;
    }

    return inserted?.[0] || defaultSettings;
  },

  async updateUserSettings(userId, updates) {
    if (!userId) return null;
    const payload = {};
    if (updates.theme !== undefined) payload.theme = updates.theme;
    if (updates.default_category_id !== undefined) payload.default_category_id = updates.default_category_id;
    if (updates.default_status !== undefined) payload.default_status = updates.default_status;
    if (updates.default_priority !== undefined) payload.default_priority = updates.default_priority;
    if (updates.bio !== undefined) payload.bio = updates.bio;

    const { data, error } = await insforge.database
      .from('user_settings')
      .update(payload)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  exportToJSON(ideas, categories) {
    const exportObject = {
      appName: 'IdeaVault',
      exportedAt: new Date().toISOString(),
      ideasCount: ideas.length,
      categoriesCount: categories.length,
      categories,
      ideas,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ideavault-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  exportToCSV(ideas, categories) {
    const categoryNameMap = {};
    for (const c of categories) {
      categoryNameMap[c.id] = c.name;
    }

    const headers = ['ID', 'Title', 'Content', 'Category', 'Status', 'Priority', 'Is Favorite', 'Voice Captured', 'Tags', 'Created At'];
    const rows = ideas.map(i => [
      `"${i.id}"`,
      `"${(i.title || '').replace(/"/g, '""')}"`,
      `"${(i.content || '').replace(/"/g, '""')}"`,
      `"${categoryNameMap[i.category_id] || 'Uncategorized'}"`,
      `"${i.status}"`,
      `"${i.priority}"`,
      i.is_favorite ? 'Yes' : 'No',
      i.voice_captured ? 'Yes' : 'No',
      `"${(i.tags || []).join(';')}"`,
      `"${i.created_at}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `ideavault-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};
