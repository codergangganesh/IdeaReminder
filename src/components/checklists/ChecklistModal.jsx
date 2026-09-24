import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DEFAULT_FOLDER_COLORS } from '../../services/checklistService';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';
import { VoiceRecorder } from '../voice/VoiceRecorder';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { parseSpokenItems } from '../../utils/voiceListParser';
import {
  FolderPlus,
  Plus,
  Trash2,
  Loader2,
  Mic,
  Check,
  Wand2,
  X,
} from 'lucide-react';

const CHECKLIST_ICONS = [
  '📝', '✅', '🎯', '🚀', '⚡', '🛒', '💻', '📌', '💡', '🏷️', '📋', '🔥', '✈️', '📈', '🛠️', '📚', '💼', '🎨'
];

const parseSubitem = (content) => {
  if (!content || typeof content !== 'string') return null;
  if (!content.startsWith('↳')) return null;

  const match = content.match(/^↳\s*([a-zA-Z0-9_-]+):::(.*)$/);
  if (match) {
    return {
      isSubitem: true,
      parentId: match[1],
      text: match[2].trim(),
    };
  }
  return {
    isSubitem: true,
    parentId: null,
    text: content.replace(/^↳\s*/, '').trim(),
  };
};

export function ChecklistModal({
  isOpen,
  onClose,
  checklist,
  folders = [],
  defaultFolderId = null,
  onSave,
  onOpenCreateFolder,
  onAddItem,
  onDeleteItem,
}) {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState('#D4A72C');
  const [initialItems, setInitialItems] = useState(['', '']);
  const [newItems, setNewItems] = useState([]);
  const [existingItems, setExistingItems] = useState([]);
  const [deletedExistingItemIds, setDeletedExistingItemIds] = useState([]);

  // Voice recording target state for individual items
  // target: { type: 'initial' | 'new' | 'multi' | 'existing', index: number|string }
  const [activeVoiceTarget, setActiveVoiceTarget] = useState(null);
  const [breakingDownTitle, setBreakingDownTitle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const DRAFT_KEY = 'ideavault_checklist_draft';

  // Voice recognition hook
  const {
    isListening,
    formattedDuration,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Reset or initialize state when opening modal
  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || '');
      setDescription(checklist.description || '');
      setFolderId(checklist.folder_id || '');
      setIcon(checklist.icon || '📝');
      setColor(checklist.color || '#D4A72C');
      setExistingItems(checklist.items || []);
      setNewItems([]);
      setInitialItems([]);
      setDeletedExistingItemIds([]);
      setActiveVoiceTarget(null);
      setHasDraft(false);
      resetTranscript();
    } else if (isOpen) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            parsed?.title?.trim() ||
            parsed?.description?.trim() ||
            (Array.isArray(parsed?.initialItems) && parsed.initialItems.some((i) => i.trim()))
          ) {
            setTitle(parsed.title || '');
            setDescription(parsed.description || '');
            setFolderId(parsed.folderId || defaultFolderId || '');
            setIcon(parsed.icon || '📝');
            setColor(parsed.color || '#D4A72C');
            setInitialItems(Array.isArray(parsed.initialItems) ? parsed.initialItems : ['', '']);
            setActiveVoiceTarget(null);
            setHasDraft(true);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not restore checklist draft:', e);
      }

      setTitle('');
      setDescription('');
      setFolderId(defaultFolderId || '');
      setIcon('📝');
      setColor('#D4A72C');
      setInitialItems(['', '']);
      setNewItems([]);
      setExistingItems([]);
      setDeletedExistingItemIds([]);
      setActiveVoiceTarget(null);
      setHasDraft(false);
      resetTranscript();
    }
  }, [checklist, defaultFolderId, isOpen, resetTranscript]);

  // Auto-save draft on typing when creating a new checklist
  useEffect(() => {
    if (!isOpen || checklist) return;

    const hasAnyContent =
      title.trim() ||
      description.trim() ||
      initialItems.some((i) => typeof i === 'string' && i.trim().length > 0);

    if (hasAnyContent) {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            title,
            description,
            folderId,
            icon,
            color,
            initialItems,
            savedAt: Date.now(),
          })
        );
        setHasDraft(true);
      } catch (e) {
        console.warn('Draft save notice:', e);
      }
    } else {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    }
  }, [isOpen, checklist, title, description, folderId, icon, color, initialItems]);

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setTitle('');
    setDescription('');
    setFolderId(defaultFolderId || '');
    setIcon('📝');
    setColor('#D4A72C');
    setInitialItems(['', '']);
    setHasDraft(false);
    setActiveVoiceTarget(null);
    resetTranscript();
  };

  // --- Task row management for creation mode ---
  const handleAddInitialItemField = () => {
    setInitialItems((prev) => [...prev, '']);
  };

  const handleInitialItemChange = (index, value) => {
    setInitialItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveInitialItemField = (index) => {
    setInitialItems((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Task row management for edit mode ---
  const handleAddNewItemField = () => {
    setNewItems((prev) => [...prev, '']);
  };

  const handleNewItemChange = (index, value) => {
    setNewItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveNewItemField = (index) => {
    setNewItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingItem = async (itemId) => {
    // Find any subitems under this item to cascade delete
    const isSub = existingItems.find((it) => it.id === itemId)?.content?.startsWith('↳');
    const childSubs = !isSub
      ? existingItems.filter((it) => {
          const parsed = parseSubitem(it.content);
          return parsed?.parentId === itemId;
        })
      : [];

    if (onDeleteItem && checklist?.id) {
      try {
        await onDeleteItem(checklist.id, itemId);
        for (const sub of childSubs) {
          try {
            await onDeleteItem(checklist.id, sub.id);
          } catch (e) {}
        }
        const childIds = new Set(childSubs.map((s) => s.id));
        setExistingItems((prev) => prev.filter((it) => it.id !== itemId && !childIds.has(it.id)));
        return;
      } catch (err) {
        console.error('Delete item error:', err);
      }
    }
    // Fallback: mark as deleted locally
    const childIds = new Set(childSubs.map((s) => s.id));
    setDeletedExistingItemIds((prev) => [...prev, itemId, ...Array.from(childIds)]);
    setExistingItems((prev) => prev.filter((it) => it.id !== itemId && !childIds.has(it.id)));
  };

  // --- Voice Dictation for Individual Items & Multi-Item Splitting ---
  const handleStartItemVoice = (type, index, currentText = '') => {
    setActiveVoiceTarget({ type, index });
    startListening(currentText, (liveText) => {
      if (type === 'initial') {
        setInitialItems((prev) => {
          const next = [...prev];
          next[index] = liveText;
          return next;
        });
      } else if (type === 'new') {
        setNewItems((prev) => {
          const next = [...prev];
          next[index] = liveText;
          return next;
        });
      }
    });
  };

  const handleStopItemVoice = (type, index) => {
    stopListening((finalSpeech) => {
      const parsedItems = parseSpokenItems(finalSpeech);
      setActiveVoiceTarget(null);

      if (!parsedItems || parsedItems.length === 0) return;

      if (type === 'initial') {
        setInitialItems((prev) => {
          if (parsedItems.length === 1) {
            const next = [...prev];
            next[index] = parsedItems[0];
            return next;
          }
          // Multiple items spoken (e.g. "apples, bananas, oranges, milk")
          const before = prev.slice(0, index);
          let after = prev.slice(index + 1);
          // If the subsequent row is empty, absorb it
          if (after.length > 0 && !after[0]?.trim()) {
            after = after.slice(1);
          }
          return [...before, ...parsedItems, ...after];
        });
        showToast(
          parsedItems.length > 1
            ? `✓ Created ${parsedItems.length} checklist items!`
            : `✓ Task updated!`,
          'success'
        );
      } else if (type === 'new') {
        setNewItems((prev) => {
          if (parsedItems.length === 1) {
            const next = [...prev];
            next[index] = parsedItems[0];
            return next;
          }
          const before = prev.slice(0, index);
          let after = prev.slice(index + 1);
          if (after.length > 0 && !after[0]?.trim()) {
            after = after.slice(1);
          }
          return [...before, ...parsedItems, ...after];
        });
        showToast(
          parsedItems.length > 1
            ? `✓ Created ${parsedItems.length} checklist items!`
            : `✓ Task updated!`,
          'success'
        );
      } else if (type === 'multi') {
        if (checklist) {
          setNewItems((prev) => [...prev, ...parsedItems]);
        } else {
          setInitialItems((prev) => {
            const nonBlank = prev.filter((i) => typeof i === 'string' && i.trim().length > 0);
            return [...nonBlank, ...parsedItems];
          });
        }
        showToast(`✓ Added ${parsedItems.length} items from voice!`, 'success');
      } else if (type === 'existing') {
        setNewItems((prev) => [...prev, ...parsedItems]);
        showToast(`✓ Added ${parsedItems.length} items to checklist!`, 'success');
      }
    });
  };

  // --- AI Breakdown: Generates tasks from Title input ---
  const handleAIBreakdown = async (customTitle) => {
    const targetTitle = (customTitle || title).trim();
    if (!targetTitle) {
      showToast('Please enter a checklist goal or title first', 'info');
      return;
    }

    setBreakingDownTitle(true);
    try {
      const selectedFolder = folders.find((f) => f.id === folderId);
      const result = await aiService.generateChecklistBreakdown({
        title: targetTitle,
        description,
        folderName: selectedFolder?.name || '',
      });

      if (result?.tasks && result.tasks.length > 0) {
        if (checklist) {
          setNewItems((prev) => [...prev, ...result.tasks]);
        } else {
          setInitialItems(result.tasks);
        }
        if (result.suggestedIcon) setIcon(result.suggestedIcon);
        if (result.suggestedDescription && !description.trim()) {
          setDescription(result.suggestedDescription);
        }
        showToast(`AI formulated ${result.tasks.length} action items!`, 'success');
      }
    } catch (err) {
      console.error('AI breakdown error:', err);
      showToast('Failed to generate AI breakdown: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setBreakingDownTitle(false);
    }
  };

  // --- Submit handler ---
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim() || saving) return;

    if (isListening) {
      stopListening();
    }

    setSaving(true);
    try {
      const validInitialItems = initialItems
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const validNewItems = newItems
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        folder_id: folderId || null,
        icon,
        color,
        initialItems: checklist ? undefined : validInitialItems,
        newItems: checklist ? validNewItems : undefined,
        currentPositionOffset: existingItems.length,
        deletedItemIds: checklist ? deletedExistingItemIds : undefined,
      });

      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      resetTranscript();
      onClose();
    } catch (err) {
      console.error('Save checklist error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter to save
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={checklist ? 'Edit Checklist & Tasks' : 'Create New Checklist'}
      subtitle="Organize actionable tasks, dictate with voice, or let AI generate plans"
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* In-progress Draft Banner */}
        {hasDraft && !checklist && (
          <div
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>In-progress draft restored</span>
            <button
              type="button"
              onClick={handleDiscardDraft}
              style={{
                color: '#EF4444',
                fontSize: '0.76rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 0.25rem',
              }}
            >
              Discard
            </button>
          </div>
        )}

        {/* Title Field + AI Breakdown Trigger */}
        <div className="form-field-group">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}
          >
            <label className="form-label" htmlFor="checklist-title" style={{ marginBottom: 0 }}>
              Checklist Title / Goal *
            </label>

            <button
              type="button"
              onClick={() => handleAIBreakdown()}
              disabled={breakingDownTitle || !title.trim()}
              style={{
                fontSize: '0.78rem',
                color: title.trim() ? 'var(--color-mustard)' : 'var(--text-muted)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: title.trim() ? 'pointer' : 'not-allowed',
                backgroundColor: 'rgba(212, 167, 44, 0.1)',
                border: '1px solid rgba(212, 167, 44, 0.25)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-full)',
                transition: 'all var(--transition-fast)',
              }}
              title="Break down this title into step-by-step tasks with AI"
            >
              {breakingDownTitle ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Generating tasks...</span>
                </>
              ) : (
                <>
                  <Wand2 size={12} />
                  <span>AI Breakdown</span>
                </>
              )}
            </button>
          </div>

          <input
            id="checklist-title"
            type="text"
            className="form-input-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Launch MVP"
            required
            autoFocus
          />
        </div>

        {/* Folder Select */}
        <div className="form-field-group">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}
          >
            <label className="form-label" htmlFor="checklist-folder" style={{ marginBottom: 0 }}>
              Folder (Optional)
            </label>
            {onOpenCreateFolder && (
              <button
                type="button"
                onClick={onOpenCreateFolder}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-mustard)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                }}
              >
                <FolderPlus size={13} />
                + New Folder
              </button>
            )}
          </div>
          <select
            id="checklist-folder"
            className="form-input-control"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="">📂 No Folder (Unfiled)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.icon || '📁'} {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="checklist-desc">
            Description (Optional)
          </label>
          <textarea
            id="checklist-desc"
            className="form-textarea-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context, dates, or reminder notes..."
          />
        </div>

        {/* TASKS SECTION */}
        {/* Case 1: In Create Mode (initialItems) */}
        {!checklist && (
          <div className="form-field-group">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.45rem',
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Tasks & Checklist Items ({initialItems.filter((i) => i.trim()).length})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (activeVoiceTarget?.type === 'multi') {
                      handleStopItemVoice('multi', -1);
                    } else {
                      handleStartItemVoice('multi', -1, '');
                    }
                  }}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-mustard)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer',
                    background: activeVoiceTarget?.type === 'multi' ? 'var(--color-mustard-subtle)' : 'none',
                    border: `1px solid ${activeVoiceTarget?.type === 'multi' ? 'var(--color-mustard)' : 'transparent'}`,
                    padding: '0.2rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  title="Speak multiple items (e.g. 'apples, bananas, oranges, milk')"
                >
                  <Mic size={13} />
                  <span>{activeVoiceTarget?.type === 'multi' ? 'Stop Recording' : 'Voice List'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddInitialItemField}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-mustard)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  <Plus size={13} />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Active Voice Multi-list Banner */}
            {activeVoiceTarget?.type === 'multi' && isListening && (
              <div className="item-voice-active-banner" style={{ marginBottom: '0.55rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Mic size={14} className="voice-mic-pulsing" />
                  <span>Listening... Speak multiple items (e.g. "apples, bananas, milk")</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="voice-duration-tag">{formattedDuration}</span>
                  <Button
                    type="button"
                    variant="mustard"
                    size="sm"
                    onClick={() => handleStopItemVoice('multi', -1)}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem', fontWeight: 700 }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '240px', overflowY: 'auto' }}>
              {initialItems.map((itemVal, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '18px', textAlign: 'right', flexShrink: 0 }}>
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    className="form-input-control"
                    style={{ flex: 1, minWidth: 0, padding: '0.45rem 0.65rem', fontSize: '0.86rem' }}
                    value={itemVal}
                    onChange={(e) => handleInitialItemChange(idx, e.target.value)}
                    placeholder={`Task ${idx + 1} (or tap mic to speak)...`}
                  />
                  {/* Voice button for THIS specific item */}
                  <VoiceRecorder
                    isListening={activeVoiceTarget?.type === 'initial' && activeVoiceTarget?.index === idx && isListening}
                    formattedDuration={formattedDuration}
                    isSupported={isSupported}
                    error={voiceError}
                    onStart={() => handleStartItemVoice('initial', idx, itemVal)}
                    onStop={() => handleStopItemVoice('initial', idx)}
                    compact={true}
                    title="Speak items (e.g. 'apples, bananas, oranges, milk')"
                  />
                  {initialItems.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleRemoveInitialItemField(idx)}
                      title="Remove row"
                      style={{ width: '28px', height: '28px', flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Case 2: In Edit Mode (existingItems + newItems) */}
        {checklist && (
          <div className="form-field-group">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.45rem',
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Checklist Tasks ({existingItems.length + newItems.filter(Boolean).length})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (activeVoiceTarget?.type === 'multi') {
                      handleStopItemVoice('multi', -1);
                    } else {
                      handleStartItemVoice('multi', -1, '');
                    }
                  }}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-mustard)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer',
                    background: activeVoiceTarget?.type === 'multi' ? 'var(--color-mustard-subtle)' : 'none',
                    border: `1px solid ${activeVoiceTarget?.type === 'multi' ? 'var(--color-mustard)' : 'transparent'}`,
                    padding: '0.2rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                  title="Speak multiple items (e.g. 'apples, bananas, oranges, milk')"
                >
                  <Mic size={13} />
                  <span>{activeVoiceTarget?.type === 'multi' ? 'Stop Recording' : 'Voice List'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddNewItemField}
                  style={{
                    fontSize: '0.78rem',
                    color: 'var(--color-mustard)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  <Plus size={13} />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Active Voice Multi-list Banner */}
            {activeVoiceTarget?.type === 'multi' && isListening && (
              <div className="item-voice-active-banner" style={{ marginBottom: '0.55rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Mic size={14} className="voice-mic-pulsing" />
                  <span>Listening... Speak multiple items (e.g. "apples, bananas, milk")</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="voice-duration-tag">{formattedDuration}</span>
                  <Button
                    type="button"
                    variant="mustard"
                    size="sm"
                    onClick={() => handleStopItemVoice('multi', -1)}
                    style={{ padding: '0.2rem 0.6rem', fontSize: '0.74rem', fontWeight: 700 }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                maxHeight: '260px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              {existingItems.length === 0 && newItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  No tasks in this checklist yet. Click "+ Add Item" or "+ Voice List" above!
                </div>
              ) : null}

              {/* Existing items with subitems indented under parents */}
              {(() => {
                const topLevel = [];
                const subsByParent = {};
                const unassigned = [];

                for (const item of existingItems) {
                  const parsed = parseSubitem(item.content);
                  if (parsed) {
                    if (parsed.parentId) {
                      if (!subsByParent[parsed.parentId]) subsByParent[parsed.parentId] = [];
                      subsByParent[parsed.parentId].push({ ...item, displayText: parsed.text });
                    } else {
                      if (topLevel.length > 0) {
                        const lastId = topLevel[topLevel.length - 1].id;
                        if (!subsByParent[lastId]) subsByParent[lastId] = [];
                        subsByParent[lastId].push({ ...item, displayText: parsed.text });
                      } else {
                        unassigned.push({ ...item, displayText: parsed.text });
                      }
                    }
                  } else {
                    topLevel.push(item);
                  }
                }

                return (
                  <>
                    {topLevel.map((item) => {
                      const childSubs = subsByParent[item.id] || [];

                      return (
                        <React.Fragment key={item.id}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              backgroundColor: 'var(--bg-card)',
                              padding: '0.45rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <span
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: item.is_completed ? 'var(--color-mustard)' : 'transparent',
                                border: `1.5px solid ${item.is_completed ? 'var(--color-mustard)' : 'var(--text-muted)'}`,
                                color: '#FFFFFF',
                                fontSize: '0.65rem',
                                flexShrink: 0,
                              }}
                            >
                              {item.is_completed && <Check size={11} strokeWidth={3} />}
                            </span>

                            <span
                              style={{
                                flex: 1,
                                fontSize: '0.86rem',
                                color: item.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                textDecoration: item.is_completed ? 'line-through' : 'none',
                                fontWeight: 500,
                              }}
                            >
                              {item.content}
                            </span>

                            {/* Voice option on existing item */}
                            <VoiceRecorder
                              isListening={activeVoiceTarget?.type === 'existing' && activeVoiceTarget?.index === item.id && isListening}
                              formattedDuration={formattedDuration}
                              isSupported={isSupported}
                              error={voiceError}
                              onStart={() => handleStartItemVoice('existing', item.id, '')}
                              onStop={() => handleStopItemVoice('existing', item.id)}
                              compact={true}
                              title="Speak items to add after this task"
                            />

                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => handleDeleteExistingItem(item.id)}
                              title="Delete item and its subitems"
                              style={{ width: '26px', height: '26px', color: 'var(--text-muted)' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Subitems nested directly under this parent */}
                          {childSubs.map((subitem) => (
                            <div
                              key={subitem.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                                marginLeft: '1.4rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                borderLeft: '2px solid var(--color-mustard-border)',
                                padding: '0.35rem 0.6rem',
                                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                borderTop: '1px solid var(--border-color)',
                                borderBottom: '1px solid var(--border-color)',
                                borderRight: '1px solid var(--border-color)',
                              }}
                            >
                              <span className="subitem-branch-icon">↳</span>
                              <span
                                style={{
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '3px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: subitem.is_completed ? 'var(--color-mustard)' : 'transparent',
                                  border: `1.5px solid ${subitem.is_completed ? 'var(--color-mustard)' : 'var(--text-muted)'}`,
                                  color: '#FFFFFF',
                                  fontSize: '0.6rem',
                                  flexShrink: 0,
                                }}
                              >
                                {subitem.is_completed && <Check size={9} strokeWidth={3} />}
                              </span>

                              <span
                                style={{
                                  flex: 1,
                                  fontSize: '0.82rem',
                                  color: subitem.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: subitem.is_completed ? 'line-through' : 'none',
                                }}
                              >
                                {subitem.displayText}
                              </span>

                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => handleDeleteExistingItem(subitem.id)}
                                title="Delete subitem"
                                style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Unassigned subitems */}
                    {unassigned.map((subitem) => (
                      <div
                        key={subitem.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          marginLeft: '1.4rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderLeft: '2px solid var(--color-mustard-border)',
                          padding: '0.35rem 0.6rem',
                          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                          borderTop: '1px solid var(--border-color)',
                          borderBottom: '1px solid var(--border-color)',
                          borderRight: '1px solid var(--border-color)',
                        }}
                      >
                        <span className="subitem-branch-icon">↳</span>
                        <span
                          style={{
                            width: '15px',
                            height: '15px',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: subitem.is_completed ? 'var(--color-mustard)' : 'transparent',
                            border: `1.5px solid ${subitem.is_completed ? 'var(--color-mustard)' : 'var(--text-muted)'}`,
                            color: '#FFFFFF',
                            fontSize: '0.6rem',
                            flexShrink: 0,
                          }}
                        >
                          {subitem.is_completed && <Check size={9} strokeWidth={3} />}
                        </span>

                        <span
                          style={{
                            flex: 1,
                            fontSize: '0.82rem',
                            color: subitem.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: subitem.is_completed ? 'line-through' : 'none',
                          }}
                        >
                          {subitem.displayText}
                        </span>

                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDeleteExistingItem(subitem.id)}
                          title="Delete subitem"
                          style={{ width: '24px', height: '24px', color: 'var(--text-muted)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </>
                );
              })()}

              {/* Newly added items (during this edit session) */}
              {newItems.map((itemText, idx) => (
                <div
                  key={`new-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: 'rgba(212, 167, 44, 0.07)',
                    padding: '0.35rem 0.55rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(212, 167, 44, 0.3)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-mustard)',
                      color: 'var(--color-mustard-contrast)',
                      padding: '0.1rem 0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  >
                    NEW
                  </span>

                  <input
                    type="text"
                    className="form-input-control"
                    style={{ flex: 1, padding: '0.35rem 0.55rem', fontSize: '0.85rem' }}
                    value={itemText}
                    onChange={(e) => handleNewItemChange(idx, e.target.value)}
                    placeholder="Enter new task (or tap mic)..."
                  />

                  {/* Voice option on every new item */}
                  <VoiceRecorder
                    isListening={activeVoiceTarget?.type === 'new' && activeVoiceTarget?.index === idx && isListening}
                    formattedDuration={formattedDuration}
                    isSupported={isSupported}
                    error={voiceError}
                    onStart={() => handleStartItemVoice('new', idx, itemText)}
                    onStop={() => handleStopItemVoice('new', idx)}
                    compact={true}
                    title="Speak items (e.g. 'apples, bananas, oranges, milk')"
                  />

                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleRemoveNewItemField(idx)}
                    title="Remove item"
                    style={{ width: '26px', height: '26px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Icon Picker */}
        <div className="form-field-group">
          <label className="form-label">Checklist Icon</label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-input)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {CHECKLIST_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: icon === emoji ? 'var(--color-mustard-subtle)' : 'transparent',
                  border: `1px solid ${icon === emoji ? 'var(--color-mustard)' : 'transparent'}`,
                  fontSize: '1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="form-field-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Accent Color</label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-input)',
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {DEFAULT_FOLDER_COLORS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: preset,
                  border: color === preset ? '3px solid #FFFFFF' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: color === preset ? '0 0 0 2px var(--color-mustard)' : 'none',
                  cursor: 'pointer',
                  transform: color === preset ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform var(--transition-fast)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="checklist-modal-footer-actions">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="mustard"
            type="submit"
            loading={saving}
            disabled={!title.trim()}
            style={{ fontWeight: 700 }}
          >
            {checklist ? 'Save Changes' : 'Create Checklist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
