import { insforge } from './insforge';

export const aiService = {
  /**
   * Generate a complete checklist (title, description, tasks, icon, color, suggested folder)
   * from a spoken voice recording or unstructured prompt.
   */
  async generateChecklistFromVoiceOrPrompt({ prompt, folders = [] }) {
    if (!prompt?.trim()) {
      throw new Error('Please speak or enter a prompt first.');
    }

    const folderContext = folders.map((f) => ({ id: f.id, name: f.name }));

    const systemPrompt = `You are an expert productivity assistant, project planner, and checklist architect.
The user will provide a spoken thought, voice dictation transcript, or unstructured prompt describing a goal, project, routine, or to-do list.

Your job is to:
1. Synthesize a clean, catchy, concise "title" (under 45 characters).
2. Write a clear 1-2 sentence "description" summarizing the purpose or context.
3. Select an appropriate emoji "suggestedIcon" (e.g., 🚀, 💻, 📋, 🎨, 🛠️, 🛒, 📈, ✈️, 📚, 🎯, 💡, 🏷️, 💼, 🏠).
4. Pick a modern accent color "suggestedColor" from this exact list:
   ["#D4A72C", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#14B8A6"]
5. If the available folders list below contains a folder that fits this topic, set "suggestedFolderId" to that folder's id; otherwise null.
   Available folders: ${JSON.stringify(folderContext)}
6. Generate 4 to 8 clear, distinct, actionable, realistic step-by-step to-do tasks. Each task must be short (under 60 characters), active/imperative (e.g. "Book round-trip flight tickets", "Draft user interview questions", "Setup staging database").

Return strictly valid JSON with this exact schema:
{
  "title": "Clean Title Here",
  "description": "Short description here",
  "suggestedIcon": "🚀",
  "suggestedColor": "#D4A72C",
  "suggestedFolderId": null,
  "tasks": [
    "Task 1",
    "Task 2",
    "Task 3"
  ]
}

Do not include markdown code fences or extra commentary. Return ONLY the raw JSON object.`;

    const userPrompt = `Spoken / Prompt Input:
"${prompt.trim()}"`;

    try {
      const response = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      const content = response?.choices?.[0]?.message?.content || '';
      return this.parseFullChecklistResponse(content, prompt, folders);
    } catch (err) {
      console.warn('InsForge AI Checklist generation fallback:', err);
      return this.generateSmartFallbackChecklist(prompt, folders);
    }
  },

  /**
   * Suggest additional, complementary tasks for an existing checklist
   * based on its current title, description, existing tasks, and optional user instruction/voice prompt.
   */
  async suggestAdditionalTasks({ title, description = '', existingTasks = [], prompt = '' }) {
    if (!title?.trim()) {
      throw new Error('Checklist title is required to suggest tasks.');
    }

    const existingListStr = existingTasks
      .map((t) => (typeof t === 'string' ? t : t.content || t.title || ''))
      .filter(Boolean)
      .join('\n- ');

    const systemPrompt = `You are a productivity expert and workflow consultant.
You are helping a user expand and refine an existing checklist.

Current Checklist:
Title: "${title.trim()}"
${description ? `Description: "${description.trim()}"` : ''}
Current Tasks:
- ${existingListStr || '(No tasks yet)'}

${prompt.trim() ? `User specific instruction / voice note: "${prompt.trim()}"` : ''}

Your task:
Suggest 3 to 6 NEW, realistic, complementary next steps or missing items.
Rules:
1. Do NOT repeat or duplicate any of the current tasks.
2. Focus on logical next steps, edge cases, QA/review, or preparation tasks.
3. Keep each task concise (under 60 characters), starting with an active verb.
4. Return strictly valid JSON with this exact schema:
{
  "suggestedTasks": [
    "New action item 1",
    "New action item 2",
    "New action item 3"
  ]
}
Do not include markdown fences. Return ONLY the JSON object.`;

    try {
      const response = await insforge.ai.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Suggest new tasks for this checklist.' },
        ],
        temperature: 0.7,
      });

      const content = response?.choices?.[0]?.message?.content || '';
      return this.parseSuggestedTasksResponse(content, title, existingTasks, prompt);
    } catch (err) {
      console.warn('InsForge AI Suggest tasks fallback:', err);
      return this.fallbackSuggestedTasks(title, existingTasks, prompt);
    }
  },

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
      return this.generateFallbackTasks(title, description);
    }
  },

  /**
   * Parse full checklist response from AI
   */
  parseFullChecklistResponse(content, prompt, folders = []) {
    if (!content) return this.generateSmartFallbackChecklist(prompt, folders);

    let clean = content.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(clean);
      if (parsed && (parsed.title || (Array.isArray(parsed.tasks) && parsed.tasks.length > 0))) {
        let matchedFolderId = parsed.suggestedFolderId || null;
        if (!matchedFolderId && folders.length > 0) {
          const match = folders.find(
            (f) =>
              parsed.title?.toLowerCase().includes(f.name.toLowerCase()) ||
              prompt.toLowerCase().includes(f.name.toLowerCase())
          );
          if (match) matchedFolderId = match.id;
        }

        return {
          title: parsed.title || this.extractTitleFromPrompt(prompt),
          description: parsed.description || `Action plan for ${this.extractTitleFromPrompt(prompt)}`,
          suggestedIcon: parsed.suggestedIcon || '📋',
          suggestedColor: parsed.suggestedColor || '#D4A72C',
          suggestedFolderId: matchedFolderId,
          tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0
            ? parsed.tasks.map((t) => (typeof t === 'string' ? t.trim() : t.content || String(t))).filter(Boolean)
            : this.generateSmartFallbackChecklist(prompt, folders).tasks,
        };
      }
    } catch (e) {
      console.warn('Could not parse AI checklist JSON, falling back:', e);
    }

    return this.generateSmartFallbackChecklist(prompt, folders);
  },

  /**
   * Parse AI suggested tasks response
   */
  parseSuggestedTasksResponse(content, title, existingTasks = [], prompt = '') {
    if (!content) return this.fallbackSuggestedTasks(title, existingTasks, prompt);

    let clean = content.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(clean);
      const tasks = parsed.suggestedTasks || parsed.tasks;
      if (Array.isArray(tasks) && tasks.length > 0) {
        return tasks.map((t) => (typeof t === 'string' ? t.trim() : t.content || String(t))).filter(Boolean);
      }
    } catch (e) {
      console.warn('Could not parse AI suggested tasks JSON:', e);
      const lines = clean
        .split('\n')
        .map((l) => l.replace(/^[-*•0-9.)\s]+/, '').trim())
        .filter((l) => l.length > 3 && !l.startsWith('{') && !l.startsWith('}'));

      if (lines.length > 0) {
        return lines.slice(0, 6);
      }
    }

    return this.fallbackSuggestedTasks(title, existingTasks, prompt);
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
   * Helper to extract a smart title from user prompt or speech
   */
  extractTitleFromPrompt(prompt = '') {
    if (!prompt) return 'New Checklist';
    const clean = prompt
      .replace(/^(i want to|need to|please create|create a checklist for|make a list for|plan a|plan for)\s+/i, '')
      .trim();

    const firstSentence = clean.split(/[.?!,\n]/)[0].trim();
    if (firstSentence.length > 45) {
      const words = firstSentence.split(' ');
      return words.slice(0, 6).join(' ') + '...';
    }
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  },

  /**
   * Smart Fallback Checklist Generator for offline or API limits
   */
  generateSmartFallbackChecklist(prompt, folders = []) {
    const p = prompt.toLowerCase();
    const title = this.extractTitleFromPrompt(prompt);

    let suggestedIcon = '📝';
    let suggestedColor = '#D4A72C';
    let suggestedDescription = `Actionable step-by-step tasks for ${title}`;
    let tasks = [];

    // Match folder if name exists in prompt
    let suggestedFolderId = null;
    if (folders.length > 0) {
      const matched = folders.find((f) => p.includes(f.name.toLowerCase()));
      if (matched) suggestedFolderId = matched.id;
    }

    if (p.includes('trip') || p.includes('travel') || p.includes('vacation') || p.includes('flight') || p.includes('pack')) {
      suggestedIcon = '✈️';
      suggestedColor = '#3B82F6';
      suggestedDescription = 'Complete itinerary, packing essentials, and travel logistics';
      tasks = [
        'Book round-trip flight/transportation tickets',
        'Reserve hotel or Airbnb accommodations',
        'Check passport validity & travel insurance',
        'Pack essential clothes, toiletries, and medications',
        'Download offline maps and translation apps',
        'Prepare electronic chargers, power bank, and adapters',
        'Confirm check-in time and arrange airport transit',
      ];
    } else if (p.includes('launch') || p.includes('producthunt') || p.includes('mvp') || p.includes('release')) {
      suggestedIcon = '🚀';
      suggestedColor = '#F59E0B';
      suggestedDescription = 'Milestones for public MVP release and marketing launch';
      tasks = [
        'Finalize core user flows and squash blocker bugs',
        'Craft engaging product screenshots, GIF, and demo video',
        'Write compelling headline, tagline, and maker statement',
        'Setup production analytics, error monitoring, and support',
        'Coordinate launch announcement across Twitter/X and LinkedIn',
        'Engage actively with first commenters and early adopters',
      ];
    } else if (p.includes('sprint') || p.includes('scrum') || p.includes('backlog') || p.includes('standup')) {
      suggestedIcon = '📊';
      suggestedColor = '#8B5CF6';
      suggestedDescription = 'Sprint planning, epic breakdown, and engineering deliverables';
      tasks = [
        'Review previous sprint velocity and unfinished tickets',
        'Define key sprint goals and target milestones',
        'Break down user stories into technical sub-tasks',
        'Estimate story points and assign team ownership',
        'Schedule mid-sprint review checkpoint and QA testing',
      ];
    } else if (p.includes('bug') || p.includes('fix') || p.includes('debug') || p.includes('issue') || p.includes('crash')) {
      suggestedIcon = '🛠️';
      suggestedColor = '#EC4899';
      suggestedDescription = 'Root-cause analysis, reproduction, and QA regression testing';
      tasks = [
        'Collect crash reports, stack traces, and reproduction steps',
        'Reproduce the issue locally with debug breakpoints',
        'Identify root cause in state management or API payload',
        'Implement clean fix and write unit/regression test',
        'Perform cross-browser smoke tests and deploy patch',
      ];
    } else if (p.includes('grocery') || p.includes('meal') || p.includes('food') || p.includes('cook') || p.includes('shop')) {
      suggestedIcon = '🛒';
      suggestedColor = '#10B981';
      suggestedDescription = 'Weekly ingredients, fresh produce, and pantry staples';
      tasks = [
        'Check pantry and refrigerator inventory',
        'Plan meals and dinners for Monday to Sunday',
        'List fresh vegetables, fruits, and greens',
        'Pick protein items (chicken, tofu, eggs, beans)',
        'Stock dairy, spices, and essential grains',
        'Purchase items at grocery store or schedule delivery',
      ];
    } else if (p.includes('interview') || p.includes('resume') || p.includes('job') || p.includes('hire')) {
      suggestedIcon = '💼';
      suggestedColor = '#06B6D4';
      suggestedDescription = 'Job application, interview preparation, and portfolio review';
      tasks = [
        'Update resume and LinkedIn profile with recent achievements',
        'Research target company products, culture, and tech stack',
        'Prepare answers for behavioral STAR method questions',
        'Practice system design and technical coding problems',
        'Draft insightful questions to ask the interviewer',
        'Send polite thank-you follow-up note after the interview',
      ];
    } else if (p.includes('workout') || p.includes('fitness') || p.includes('gym') || p.includes('health')) {
      suggestedIcon = '⚡';
      suggestedColor = '#14B8A6';
      suggestedDescription = 'Weekly fitness routine, hydration, and exercise milestones';
      tasks = [
        'Perform 5-10 minute dynamic warm-up and stretching',
        'Complete primary compound lift or cardio session',
        'Execute accessory strength sets with proper form',
        'Log workout reps, sets, and weights in tracker',
        'Hydrate with electrolytes and consume post-workout meal',
      ];
    } else {
      // General breakdown extracted from spoken words
      const rawSentences = prompt
        .split(/[.\n,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);

      if (rawSentences.length >= 3) {
        tasks = rawSentences.slice(0, 6).map((s) => {
          const cap = s.charAt(0).toUpperCase() + s.slice(1);
          return cap.length > 60 ? cap.slice(0, 57) + '...' : cap;
        });
      } else {
        tasks = [
          `Define requirements and outline scope for "${title}"`,
          'Gather necessary resources, research, and prerequisites',
          'Execute primary action steps and key deliverables',
          'Review progress, test details, and polish outcome',
          'Finalize checklist items and mark project complete',
        ];
      }
    }

    return {
      title,
      description: suggestedDescription,
      suggestedIcon,
      suggestedColor,
      suggestedFolderId,
      tasks,
    };
  },

  /**
   * Fallback suggested tasks for expanding an existing checklist
   */
  fallbackSuggestedTasks(title = '', existingTasks = [], prompt = '') {
    const t = (title + ' ' + prompt).toLowerCase();
    const existingTexts = existingTasks
      .map((item) => (typeof item === 'string' ? item : item.content || '').toLowerCase());

    const isExisting = (candidate) =>
      existingTexts.some((ex) => ex.includes(candidate.toLowerCase()) || candidate.toLowerCase().includes(ex));

    const potential = [
      'Document key decisions and update team wiki',
      'Conduct final QA review and smoke test',
      'Set up automated reminders and notifications',
      'Prepare backup and rollback plan',
      'Share completion summary with stakeholders',
      'Gather post-task feedback and retrospective notes',
    ];

    if (t.includes('trip') || t.includes('travel') || t.includes('vacation')) {
      potential.unshift(
        'Confirm airport transfer and terminal directions',
        'Notify bank of international travel',
        'Print or screenshot emergency hotel contacts',
        'Pack portable power bank and international adapter'
      );
    } else if (t.includes('launch') || t.includes('release') || t.includes('mvp')) {
      potential.unshift(
        'Set up Google Analytics and conversion tracking',
        'Prepare customer onboarding email sequence',
        'Draft social media announcement copy and graphics',
        'Set up feedback widget for early user reactions'
      );
    } else if (t.includes('interview') || t.includes('job')) {
      potential.unshift(
        'Review company recent news and blog posts',
        'Test microphone and webcam setup for remote call',
        'Prepare 3 thoughtful questions for the hiring manager'
      );
    }

    // Filter out duplicates and return top 4
    const filtered = potential.filter((item) => !isExisting(item));
    return filtered.slice(0, 4);
  },

  /**
   * High quality fallback generator for common patterns when offline
   */
  generateFallbackTasks(title, description = '') {
    return this.generateSmartFallbackChecklist(title + ' ' + description);
  },
};
