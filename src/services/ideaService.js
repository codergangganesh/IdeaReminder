import { insforge } from './insforge';
import { generateSmartTitle } from './smartSuggestions';

export const ideaService = {
  async getIdeas() {
    const { data, error } = await insforge.database
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getIdeaById(id) {
    const { data, error } = await insforge.database
      .from('ideas')
      .select('*')
      .eq('id', id)
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  },

  async createIdea(ideaData, userId) {
    const title = ideaData.title && ideaData.title.trim()
      ? ideaData.title.trim()
      : generateSmartTitle(ideaData.content);

    const payload = {
      user_id: userId,
      title,
      content: ideaData.content || '',
      category_id: ideaData.category_id || null,
      status: ideaData.status || 'New',
      priority: ideaData.priority || 'Medium',
      is_favorite: Boolean(ideaData.is_favorite),
      voice_captured: Boolean(ideaData.voice_captured),
      tags: Array.isArray(ideaData.tags) ? ideaData.tags : [],
    };

    const { data, error } = await insforge.database
      .from('ideas')
      .insert([payload])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateIdea(id, updates) {
    const payload = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.category_id !== undefined) payload.category_id = updates.category_id;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.is_favorite !== undefined) payload.is_favorite = updates.is_favorite;
    if (updates.voice_captured !== undefined) payload.voice_captured = updates.voice_captured;
    if (updates.tags !== undefined) payload.tags = updates.tags;

    const { data, error } = await insforge.database
      .from('ideas')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteIdea(id) {
    const { error } = await insforge.database
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleFavorite(id, currentFavorite) {
    return this.updateIdea(id, { is_favorite: !currentFavorite });
  },

  async updateStatus(id, newStatus) {
    return this.updateIdea(id, { status: newStatus });
  },

  calculateStats(ideas = [], categories = []) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const total = ideas.length;
    const thisWeek = ideas.filter(i => new Date(i.created_at) >= oneWeekAgo).length;
    const favorites = ideas.filter(i => i.is_favorite).length;
    const inProgress = ideas.filter(i => i.status === 'In Progress').length;
    const voiceCaptured = ideas.filter(i => i.voice_captured).length;
    const completed = ideas.filter(i => i.status === 'Completed').length;
    const exploring = ideas.filter(i => i.status === 'Exploring').length;

    // Category breakdown
    const categoryMap = {};
    for (const cat of categories) {
      categoryMap[cat.id] = {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        count: 0,
      };
    }

    let uncategorizedCount = 0;
    for (const idea of ideas) {
      if (idea.category_id && categoryMap[idea.category_id]) {
        categoryMap[idea.category_id].count += 1;
      } else {
        uncategorizedCount += 1;
      }
    }

    const categoryBreakdown = Object.values(categoryMap);
    if (uncategorizedCount > 0) {
      categoryBreakdown.push({
        id: 'uncategorized',
        name: 'Uncategorized',
        icon: '📁',
        color: '#64748B',
        count: uncategorizedCount,
      });
    }

    categoryBreakdown.sort((a, b) => b.count - a.count);

    // Tag counts
    const tagCountMap = {};
    for (const idea of ideas) {
      if (Array.isArray(idea.tags)) {
        for (const tag of idea.tags) {
          tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
        }
      }
    }

    const topTags = Object.entries(tagCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total,
      thisWeek,
      favorites,
      inProgress,
      voiceCaptured,
      completed,
      exploring,
      categoryBreakdown,
      topTags,
    };
  }
};
