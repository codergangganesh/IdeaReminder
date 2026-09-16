import { insforge } from './insforge';

export const DEFAULT_CATEGORIES = [
  { name: 'General Ideas', description: 'Everyday thoughts and serendipitous ideas', icon: '💡', color: '#D4A72C' },
  { name: 'Projects', description: 'Technical and personal software builds', icon: '💻', color: '#3B82F6' },
  { name: 'AI & Machine Learning', description: 'Models, prompts, agents, and generative AI', icon: '🤖', color: '#8B5CF6' },
  { name: 'Learning', description: 'Skills to acquire, courses, and educational notes', icon: '📚', color: '#10B981' },
  { name: 'Startup Ideas', description: 'Ventures, SaaS concepts, and monetization models', icon: '🚀', color: '#F59E0B' },
  { name: 'Research', description: 'Academic papers, experiments, and deep dives', icon: '🧪', color: '#EC4899' },
  { name: 'Career', description: 'Professional goals, interview prep, and growth', icon: '💼', color: '#06B6D4' },
  { name: 'Product Ideas', description: 'Feature enhancements, UX solutions, and tools', icon: '🛠️', color: '#6366F1' },
  { name: 'Creative Ideas', description: 'Writing, artwork, media, design, and storytelling', icon: '🎨', color: '#F43F5E' },
  { name: 'App Ideas', description: 'Native mobile iOS and Android applications', icon: '📱', color: '#14B8A6' },
  { name: 'Web Ideas', description: 'Websites, web apps, extensions, and web services', icon: '🌐', color: '#0EA5E9' },
  { name: 'Business', description: 'Investments, revenue streams, and partnerships', icon: '💰', color: '#84CC16' },
  { name: 'Personal Notes', description: 'Lifestyle, wellness, habits, and reflections', icon: '📝', color: '#A855F7' },
];

export const categoryService = {
  async getCategories() {
    const { data, error } = await insforge.database
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async seedDefaultCategories(userId) {
    if (!userId) return [];
    
    // Check if categories already exist
    const { data: existing, error: checkError } = await insforge.database
      .from('categories')
      .select('id')
      .limit(1);

    if (checkError) {
      console.warn('Could not check categories:', checkError.message);
      return [];
    }

    if (existing && existing.length > 0) {
      return existing;
    }

    const payload = DEFAULT_CATEGORIES.map(cat => ({
      user_id: userId,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
    }));

    const { data, error } = await insforge.database
      .from('categories')
      .insert(payload)
      .select();

    if (error) {
      console.error('Error seeding default categories:', error.message);
      return [];
    }

    return data || [];
  },

  async createCategory(categoryData, userId) {
    const { data, error } = await insforge.database
      .from('categories')
      .insert([{
        user_id: userId,
        name: categoryData.name,
        description: categoryData.description || '',
        icon: categoryData.icon || '💡',
        color: categoryData.color || '#D4A72C',
      }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateCategory(categoryId, categoryData) {
    const { data, error } = await insforge.database
      .from('categories')
      .update({
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        color: categoryData.color,
      })
      .eq('id', categoryId)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteCategory(categoryId) {
    const { error } = await insforge.database
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  },
};
