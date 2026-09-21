import { insforge } from './insforge';

export const aiService = {
  /**
   * Generate a structured checklist breakdown (tasks, suggested icon, description)
   * from a user-supplied title / goal.
   */
  async generateChecklistBreakdown({ title, description = '', folderName = '' }) {
    if (!title?.trim()) {
      throw new Error('Please enter a checklist title or goal first.');
    }

    const systemPrompt = `You are an expert productivity assistant and project planner.
Your job is to break down a high-level goal, project, or checklist topic into 4 to 8 clear, realistic, actionable step-by-step to-do tasks.

Rules:
1. Return strictly valid JSON with this exact schema:
{
  "suggestedIcon": "A single appropriate emoji for this topic (e.g. 🚀, 💻, 📋, 🎨, 🛠️, 🛒, 📈, ✈️, 📚)",
  "suggestedDescription": "A concise 1-sentence description or subtitle for this checklist",
  "tasks": [
    "Action item 1 (short, active imperative phrasing, e.g., 'Draft initial landing page copy')",
    "Action item 2",
    "Action item 3"
  ]
}
2. Each task must be concise (under 60 characters), specific, and actionable.
3. Order tasks chronologically from initial step to completion.
4. Do not include markdown code fences (\`\`\`json) or extra commentary. Return ONLY the raw JSON object.`;

    const userPrompt = `Break down this checklist goal:
Title: "${title.trim()}"
${description.trim() ? `Additional Context: "${description.trim()}"` : ''}
${folderName.trim() ? `Category/Folder: "${folderName.trim()}"` : ''}`;

    try {
      // 1. Attempt using insforge.ai.chat.completions.create
      const response = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      const content = response?.choices?.[0]?.message?.content || '';
      return this.parseAIResponse(content, title);
    } catch (err) {
      console.warn('InsForge AI API call fallback:', err);
      // Fallback: rule-based intelligent task generator if network or API key is restricted
      return this.generateFallbackTasks(title, description);
    }
  },

  /**
   * Parse AI JSON content with cleanup for code fences or trailing text
   */
  parseAIResponse(content, fallbackTitle) {
    if (!content) return this.generateFallbackTasks(fallbackTitle);

    let clean = content.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed?.tasks) && parsed.tasks.length > 0) {
        return {
          suggestedIcon: parsed.suggestedIcon || '📋',
          suggestedDescription: parsed.suggestedDescription || `Action plan for ${fallbackTitle}`,
          tasks: parsed.tasks
            .map((t) => (typeof t === 'string' ? t.trim() : t.content || t.title || String(t)))
            .filter(Boolean),
        };
      }
    } catch (e) {
      console.warn('Could not parse AI JSON directly, extracting line by line:', e);
      // Try line-by-line extraction
      const lines = clean
        .split('\n')
        .map((l) => l.replace(/^[-*•0-9.)\s]+/, '').trim())
        .filter((l) => l.length > 3 && !l.startsWith('{') && !l.startsWith('}'));

      if (lines.length > 0) {
        return {
          suggestedIcon: '📝',
          suggestedDescription: `Action steps for ${fallbackTitle}`,
          tasks: lines.slice(0, 8),
        };
      }
    }

    return this.generateFallbackTasks(fallbackTitle);
  },

  /**
   * High quality fallback generator for common patterns when offline
   */
  generateFallbackTasks(title, description = '') {
    const t = title.toLowerCase();

    if (t.includes('launch') || t.includes('release') || t.includes('producthunt') || t.includes('mvp')) {
      return {
        suggestedIcon: '🚀',
        suggestedDescription: 'Complete preparation and launch checklist',
        tasks: [
          'Finalize core features and fix critical blockers',
          'Prepare demo screenshots, GIF, and teaser video',
          'Write compelling headline and maker comment',
          'Set up analytics tracking and feedback widget',
          'Announce launch on Twitter/X, LinkedIn, and communities',
          'Engage with early comments and gather user feedback',
        ],
      };
    }

    if (t.includes('sprint') || t.includes('scrum') || t.includes('plan') || t.includes('weekly')) {
      return {
        suggestedIcon: '📊',
        suggestedDescription: 'Sprint goals and milestone execution plan',
        tasks: [
          'Review previous sprint backlog and blockers',
          'Define high-priority deliverables and target milestones',
          'Break down epics into actionable developer tasks',
          'Assign story points and team ownership',
          'Schedule mid-sprint sync and QA review',
        ],
      };
    }

    if (t.includes('trip') || t.includes('travel') || t.includes('vacation') || t.includes('flight')) {
      return {
        suggestedIcon: '✈️',
        suggestedDescription: 'Travel essentials and itinerary preparation',
        tasks: [
          'Book transportation tickets and hotel accommodations',
          'Pack clothes, toiletries, and travel documents',
          'Check local weather and prepare daily itinerary',
          'Set up international roaming or offline maps',
          'Double-check chargers, adapters, and essentials',
        ],
      };
    }

    if (t.includes('bug') || t.includes('fix') || t.includes('test') || t.includes('qa')) {
      return {
        suggestedIcon: '🐛',
        suggestedDescription: 'Investigation, debugging, and verification steps',
        tasks: [
          'Reproduce bug locally with step-by-step logs',
          'Identify root cause in component state or API service',
          'Write regression test to verify failure case',
          'Implement fix and verify across desktop & mobile',
          'Deploy fix to staging and run smoke tests',
        ],
      };
    }

    // Generic intelligent breakdown
    return {
      suggestedIcon: '🎯',
      suggestedDescription: `Key action items to complete: ${title}`,
      tasks: [
        `Define requirements and scope for "${title}"`,
        'Gather necessary resources, research, and tools',
        'Draft the initial prototype or draft outline',
        'Execute core tasks and review progress',
        'Refine, test, and finalize deliverables',
      ],
    };
  },
};
