// Smart Heuristics for Title Generation and Category Suggestion

export function generateSmartTitle(content) {
  if (!content || !content.trim()) {
    return 'Untitled Idea';
  }

  const clean = content.trim();

  // Remove common starter phrases
  const cleanStarter = clean
    .replace(/^(what if (we|i) (make|build|create|design|do))/i, '')
    .replace(/^(i should (make|build|create|start|work on|develop))/i, '')
    .replace(/^(we should (make|build|create|start|develop))/i, '')
    .replace(/^(idea for an?|idea:|idea is to|my idea is to|concept:)/i, '')
    .replace(/^(create an?|build an?|develop an?|design an?)/i, '')
    .trim();

  // Take the first sentence or first clause
  const firstSentence = cleanStarter.split(/[.\n?!]/)[0].trim();
  const words = firstSentence.split(/\s+/).filter(Boolean);

  if (words.length <= 6) {
    return capitalizeTitle(words.join(' '));
  }

  // Pick up to 5-6 impactful words
  const shortSnippet = words.slice(0, 5).join(' ');
  return capitalizeTitle(shortSnippet);
}

function capitalizeTitle(str) {
  if (!str) return 'Untitled Idea';
  return str
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim() || 'Untitled Idea';
}

const CATEGORY_KEYWORD_MAP = [
  {
    name: 'AI & Machine Learning',
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'llm', 'deep learning', 'neural', 'prompt', 'agent', 'nlp', 'vision', 'genai', 'claude', 'model', 'embeddings', 'chatbot']
  },
  {
    name: 'Startup Ideas',
    keywords: ['startup', 'saas', 'monetize', 'revenue', 'mrr', 'arr', 'pricing', 'pitch', 'mvp', 'market', 'customer', 'investor', 'b2b', 'b2c', 'unicorn']
  },
  {
    name: 'App Ideas',
    keywords: ['mobile app', 'ios', 'android', 'flutter', 'react native', 'swift', 'smartphone', 'mobile', 'playstore', 'appstore']
  },
  {
    name: 'Web Ideas',
    keywords: ['website', 'web app', 'extension', 'browser', 'chrome extension', 'react', 'nextjs', 'vite', 'frontend', 'dashboard', 'portal']
  },
  {
    name: 'Projects',
    keywords: ['project', 'code', 'github', 'repo', 'dev', 'developer', 'architecture', 'database', 'api', 'backend', 'open source', 'cli']
  },
  {
    name: 'Learning',
    keywords: ['learn', 'study', 'student', 'course', 'university', 'college', 'tutorial', 'book', 'exam', 'practice', 'quiz', 'flashcard', 'syllabus']
  },
  {
    name: 'Research',
    keywords: ['research', 'paper', 'experiment', 'analysis', 'hypothesis', 'dataset', 'benchmark', 'academic', 'thesis', 'survey']
  },
  {
    name: 'Career',
    keywords: ['career', 'job', 'interview', 'resume', 'linkedin', 'promotion', 'salary', 'hiring', 'recruiter', 'networking', 'portfolio']
  },
  {
    name: 'Product Ideas',
    keywords: ['feature', 'ux', 'ui', 'user experience', 'productivity', 'workflow', 'automation', 'tool', 'efficiency', 'analytics']
  },
  {
    name: 'Creative Ideas',
    keywords: ['design', 'art', 'music', 'story', 'game', 'animation', 'video', 'creative', 'illustration', 'draw', 'film', 'podcast']
  },
  {
    name: 'Business',
    keywords: ['business', 'finance', 'accounting', 'sales', 'contract', 'client', 'agency', 'consulting', 'partnership', 'ecommerce', 'retail']
  },
  {
    name: 'Personal Notes',
    keywords: ['reminder', 'todo', 'habit', 'routine', 'journal', 'health', 'fitness', 'workout', 'diet', 'travel', 'trip', 'family']
  }
];

export function suggestCategory(content, existingCategories = []) {
  if (!content || !content.trim()) return null;
  const lower = content.toLowerCase();

  let bestMatch = null;
  let highestScore = 0;

  for (const item of CATEGORY_KEYWORD_MAP) {
    let score = 0;
    for (const kw of item.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += kw.length > 4 ? 2 : 1;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item.name;
    }
  }

  if (!bestMatch || highestScore === 0) {
    return null;
  }

  // Find matching category object in existingCategories
  const matchedCat = existingCategories.find(
    c => c.name.toLowerCase().includes(bestMatch.toLowerCase()) || bestMatch.toLowerCase().includes(c.name.toLowerCase())
  );

  return matchedCat || { name: bestMatch, icon: '💡' };
}

export function extractSuggestedTags(content) {
  if (!content || !content.trim()) return [];
  const lower = content.toLowerCase();
  const foundTags = new Set();

  const TAG_RULES = [
    { tag: 'AI', keywords: ['ai', 'artificial intelligence', 'genai', 'llm', 'gpt'] },
    { tag: 'Startup', keywords: ['startup', 'saas', 'founder', 'mvp'] },
    { tag: 'React', keywords: ['react', 'nextjs', 'vite'] },
    { tag: 'Productivity', keywords: ['productivity', 'habit', 'efficient', 'workflow'] },
    { tag: 'Mobile', keywords: ['mobile', 'ios', 'android', 'app'] },
    { tag: 'Web', keywords: ['web', 'website', 'browser'] },
    { tag: 'Learning', keywords: ['study', 'learn', 'student', 'course'] },
    { tag: 'Design', keywords: ['design', 'ui', 'ux', 'creative'] },
    { tag: 'Research', keywords: ['research', 'paper', 'data'] },
    { tag: 'Business', keywords: ['business', 'sales', 'finance'] },
  ];

  for (const rule of TAG_RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      foundTags.add(rule.tag);
    }
  }

  return Array.from(foundTags).slice(0, 4);
}
