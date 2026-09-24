import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { aiService } from '../../services/aiService';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { VoiceRecorder } from '../voice/VoiceRecorder';
import { useToast } from '../../context/ToastContext';
import { parseSpokenItems } from '../../utils/voiceListParser';
import {
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Filter,
  Edit2,
  Loader2,
  Lightbulb,
  X,
  Mic,
} from 'lucide-react';

export function ChecklistDetailModal({
  isOpen,
  onClose,
  checklist,
  folders = [],
  onToggleItem,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onClearCompleted,
  onOpenEditChecklist,
}) {
  const { showToast } = useToast();
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [adding, setAdding] = useState(false);

  // Subitem inline creator state
  const [openSubitemParentId, setOpenSubitemParentId] = useState(null);
  const [subitemInputText, setSubitemInputText] = useState('');
  const [addingSubitems, setAddingSubitems] = useState(false);

  // Active voice target: 'top' | 'subitem-<id>' | null
  const [activeVoiceTarget, setActiveVoiceTarget] = useState(null);

  // AI suggestions state
  const [suggesting, setSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Voice recognition
  const {
    isListening,
    formattedDuration,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Reset suggestions and subitem inputs when switching checklists
  useEffect(() => {
    setAiSuggestions([]);
    setNewItemText('');
    setOpenSubitemParentId(null);
    setSubitemInputText('');
    setActiveVoiceTarget(null);
    resetTranscript();
  }, [checklist?.id, resetTranscript]);

  if (!checklist) return null;

  const folder = folders.find((f) => f.id === checklist.folder_id);
  const items = checklist.items || [];
  const totalItems = items.length;
  const completedItems = items.filter((it) => it.is_completed).length;
  const pendingItems = totalItems - completedItems;
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Subitem parser helper
  const parseSubitem = (content) => {
    if (!content || typeof content !== 'string') return null;
    if (!content.startsWith('↳')) return null;

    // Check if encoded: "↳ <parentId>:::<text>"
    const match = content.match(/^↳\s*([a-zA-Z0-9_-]+):::(.*)$/);
    if (match) {
      return {
        isSubitem: true,
        parentId: match[1],
        text: match[2].trim(),
      };
    }
    // Fallback: "↳ <text>"
    return {
      isSubitem: true,
      parentId: null,
      text: content.replace(/^↳\s*/, '').trim(),
    };
  };

  // Top voice start & stop (creates multiple items if spoken as list)
  const handleStartTopVoice = () => {
    setActiveVoiceTarget('top');
    startListening(newItemText, (liveText) => {
      setNewItemText(liveText);
    });
  };

  const handleStopTopVoice = () => {
    stopListening((finalSpeech) => {
      setActiveVoiceTarget(null);
      const text = (finalSpeech || newItemText).trim();
      if (!text) return;
      const parsed = parseSpokenItems(text);
      if (parsed.length > 1) {
        (async () => {
          setAdding(true);
          try {
            for (const itemText of parsed) {
              await onAddItem(checklist.id, itemText);
            }
            setNewItemText('');
            resetTranscript();
            showToast(`✓ Created ${parsed.length} checklist items!`, 'success');
          } catch (err) {
            console.error('Multi-item add error:', err);
          } finally {
            setAdding(false);
          }
        })();
      } else if (parsed.length === 1) {
        setNewItemText(parsed[0]);
      }
    });
  };

  // Subitem inline input toggle
  const handleOpenSubitemInput = (parentId) => {
    if (openSubitemParentId === parentId) {
      setOpenSubitemParentId(null);
      setSubitemInputText('');
      if (isListening) stopListening();
    } else {
      setOpenSubitemParentId(parentId);
      setSubitemInputText('');
      if (isListening) stopListening();
    }
  };

  const handleCancelSubitemInput = () => {
    setOpenSubitemParentId(null);
    setSubitemInputText('');
    if (isListening) stopListening();
  };

  const handleStartSubitemVoice = (parentId) => {
    setActiveVoiceTarget(`subitem-${parentId}`);
    startListening(subitemInputText, (liveText) => {
      setSubitemInputText(liveText);
    });
  };

  const handleStopSubitemVoice = (parentId) => {
    stopListening((finalSpeech) => {
      setActiveVoiceTarget(null);
      const textToUse = (finalSpeech || subitemInputText).trim();
      if (!textToUse) return;
      handleSaveSubitems(parentId, textToUse);
    });
  };

  const handleSaveSubitems = async (parentId, textOverride) => {
    const rawText = (textOverride || subitemInputText).trim();
    if (!rawText || addingSubitems) return;

    if (isListening) {
      stopListening();
    }

    setAddingSubitems(true);
    try {
      const parsed = parseSpokenItems(rawText);
      for (const itemText of parsed) {
        await onAddItem(checklist.id, `↳ ${parentId}:::${itemText}`);
      }
      setSubitemInputText('');
      setOpenSubitemParentId(null);
      showToast(`✓ Added ${parsed.length} subitem${parsed.length > 1 ? 's' : ''}!`, 'success');
    } catch (err) {
      console.error('Save subitems error:', err);
      showToast('Failed to add subitems: ' + (err.message || 'Error'), 'error');
    } finally {
      setAddingSubitems(false);
    }
  };

  const handleDeleteParentAndSubitems = async (parentId) => {
    try {
      const relatedSubitems = items.filter((it) => {
        const p = parseSubitem(it.content);
        return p?.parentId === parentId;
      });

      await onDeleteItem(checklist.id, parentId);
      for (const sub of relatedSubitems) {
        try {
          await onDeleteItem(checklist.id, sub.id);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  const handleAddItem = async (e) => {
    e?.preventDefault();
    const text = newItemText.trim();
    if (!text || adding) return;

    if (isListening) {
      stopListening();
    }

    setAdding(true);
    try {
      const parsed = parseSpokenItems(text);
      if (parsed.length > 1) {
        for (const itemText of parsed) {
          await onAddItem(checklist.id, itemText);
        }
        showToast(`✓ Added ${parsed.length} checklist items!`, 'success');
      } else {
        await onAddItem(checklist.id, text);
      }
      setNewItemText('');
      resetTranscript();
      setActiveVoiceTarget(null);
    } catch (err) {
      console.error('Add task error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingItemId(item.id);
    setEditingText(item.content);
  };

  const handleSaveEdit = async (itemId) => {
    if (!editingText.trim()) return;
    try {
      await onEditItem(checklist.id, itemId, { content: editingText.trim() });
      setEditingItemId(null);
    } catch (err) {
      console.error('Save edit error:', err);
    }
  };

  // AI Task Suggester
  const handleAISuggest = async () => {
    setSuggesting(true);
    try {
      const suggestions = await aiService.suggestAdditionalTasks({
        title: checklist.title,
        description: checklist.description || '',
        existingTasks: items,
      });

      if (Array.isArray(suggestions) && suggestions.length > 0) {
        setAiSuggestions(suggestions);
        showToast(`AI suggested ${suggestions.length} action items!`, 'info');
      } else {
        showToast('All caught up! No additional tasks suggested.', 'info');
      }
    } catch (err) {
      console.error('AI suggest error:', err);
      showToast('Could not suggest tasks: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSuggesting(false);
    }
  };

  const handleAcceptSuggestion = async (suggestionText) => {
    try {
      await onAddItem(checklist.id, suggestionText);
      setAiSuggestions((prev) => prev.filter((s) => s !== suggestionText));
      showToast(`✓ Added "${suggestionText.slice(0, 30)}..."`, 'success');
    } catch (err) {
      console.error('Add suggestion error:', err);
    }
  };

  const handleAcceptAllSuggestions = async () => {
    const toAdd = [...aiSuggestions];
    setAiSuggestions([]);
    try {
      for (const text of toAdd) {
        await onAddItem(checklist.id, text);
      }
      showToast(`✓ Added ${toAdd.length} tasks to checklist!`, 'success');
    } catch (err) {
      console.error('Add all suggestions error:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{checklist.icon || '📝'}</span>
          <span>{checklist.title}</span>
        </div>
      }
      subtitle={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
          {folder && (
            <span
              className="checklist-folder-pill"
              style={{
                backgroundColor: `${folder.color || '#D4A72C'}18`,
                color: folder.color || 'var(--color-mustard)',
                border: `1px solid ${folder.color || '#D4A72C'}33`,
              }}
            >
              <span>{folder.icon || '📁'}</span>
              <span>{folder.name}</span>
            </span>
          )}
          {checklist.description && <span>{checklist.description}</span>}
        </div>
      }
      maxWidth="640px"
    >
      <div>
        {/* Progress bar and summary */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.45rem' }}>
            <span style={{ fontWeight: 600 }}>
              {completedItems} of {totalItems} completed
            </span>
            <span style={{ fontWeight: 700, color: 'var(--color-mustard)' }}>
              {pct}% Done
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--bg-app)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: pct === 100 ? '#10B981' : checklist.color || 'var(--color-mustard)',
                borderRadius: 'var(--radius-full)',
                transition: 'width var(--transition-normal)',
              }}
            />
          </div>
        </div>

        {/* Filter buttons & quick actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              className={`pill-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All ({totalItems})
            </button>
            <button
              type="button"
              className={`pill-filter-btn ${filterMode === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterMode('pending')}
            >
              Pending ({pendingItems})
            </button>
            <button
              type="button"
              className={`pill-filter-btn ${filterMode === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterMode('completed')}
            >
              Completed ({completedItems})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {completedItems > 0 && (
              <button
                type="button"
                className="btn-text-action"
                onClick={() => onClearCompleted(checklist.id)}
                title="Remove completed items"
              >
                <CheckCircle2 size={13} />
                Clear Completed
              </button>
            )}

            {onOpenEditChecklist && (
              <button
                type="button"
                className="btn-text-action"
                onClick={() => {
                  onClose();
                  onOpenEditChecklist(checklist);
                }}
              >
                <Edit2 size={13} />
                Edit / AI Assist
              </button>
            )}
          </div>
        </div>

        {/* Add item form + AI Suggest + Voice */}
        <div style={{ marginBottom: '1.25rem' }}>
          <form onSubmit={handleAddItem} className="checklist-detail-add-form">
            <div
              className="task-quick-add-wrap"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '0.4rem 0.6rem',
                borderColor: activeVoiceTarget === 'top' && isListening ? 'var(--color-mustard)' : undefined,
              }}
            >
              <input
                type="text"
                className="task-quick-input"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder={
                  activeVoiceTarget === 'top' && isListening
                    ? 'Listening... (say list: "apples, bananas, milk")'
                    : '+ Add a task (or speak: "apples, bananas, milk")...'
                }
                disabled={adding}
                style={{ minWidth: 0 }}
                autoFocus
              />

              {/* Voice Dictation Button */}
              <VoiceRecorder
                isListening={activeVoiceTarget === 'top' && isListening}
                formattedDuration={formattedDuration}
                isSupported={isSupported}
                error={voiceError}
                onStart={handleStartTopVoice}
                onStop={handleStopTopVoice}
                compact={true}
                iconOnly={true}
                title="Speak tasks (e.g. 'apples, bananas, oranges, milk')"
              />

              <Button
                variant="mustard"
                size="sm"
                type="submit"
                disabled={!newItemText.trim() || adding}
                loading={adding}
                icon={Plus}
                style={{ flexShrink: 0 }}
              >
                Add
              </Button>
            </div>

            {/* AI Suggest Button */}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAISuggest}
              disabled={suggesting}
              loading={suggesting}
              title="Suggest new tasks with AI"
              style={{ flexShrink: 0, padding: '0.45rem 0.75rem', fontWeight: 600 }}
            >
              AI Suggest
            </Button>
          </form>

          {/* AI Suggestions Chips */}
          {aiSuggestions.length > 0 && (
            <div
              style={{
                marginTop: '0.65rem',
                padding: '0.65rem 0.75rem',
                backgroundColor: 'rgba(212, 167, 44, 0.08)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(212, 167, 44, 0.25)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.45rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: 'var(--color-mustard)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Lightbulb size={12} />
                  AI Suggested Next Steps:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    onClick={handleAcceptAllSuggestions}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--color-mustard)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    + Add All ({aiSuggestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiSuggestions([])}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                    title="Dismiss suggestions"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.25rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-mustard)';
                      e.currentTarget.style.color = 'var(--color-mustard)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                  >
                    <Plus size={11} color="var(--color-mustard)" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', maxHeight: '380px', overflowY: 'auto' }}>
          {(() => {
            // Build tree of parent items with their subitems
            const topLevelItems = [];
            const subitemsByParent = {};
            const unassignedSubitems = [];

            for (const item of items) {
              const parsed = parseSubitem(item.content);
              if (parsed) {
                if (parsed.parentId) {
                  if (!subitemsByParent[parsed.parentId]) {
                    subitemsByParent[parsed.parentId] = [];
                  }
                  subitemsByParent[parsed.parentId].push({ ...item, displayText: parsed.text });
                } else {
                  if (topLevelItems.length > 0) {
                    const lastParentId = topLevelItems[topLevelItems.length - 1].id;
                    if (!subitemsByParent[lastParentId]) {
                      subitemsByParent[lastParentId] = [];
                    }
                    subitemsByParent[lastParentId].push({ ...item, displayText: parsed.text });
                  } else {
                    unassignedSubitems.push({ ...item, displayText: parsed.text });
                  }
                }
              } else {
                topLevelItems.push(item);
              }
            }

            const filteredParents = topLevelItems.filter((parent) => {
              if (filterMode === 'all') return true;
              const parentSubs = subitemsByParent[parent.id] || [];
              if (filterMode === 'pending') {
                return !parent.is_completed || parentSubs.some((s) => !s.is_completed);
              }
              if (filterMode === 'completed') {
                return parent.is_completed || (parentSubs.length > 0 && parentSubs.every((s) => s.is_completed));
              }
              return true;
            });

            if (filteredParents.length === 0 && unassignedSubitems.length === 0) {
              return (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem',
                  }}
                >
                  {filterMode === 'completed'
                    ? 'No completed tasks yet.'
                    : filterMode === 'pending'
                      ? '🎉 All caught up! No pending tasks.'
                      : 'No tasks in this checklist yet.'}
                </div>
              );
            }

            return (
              <>
                {filteredParents.map((parentItem) => {
                  const parentSubs = subitemsByParent[parentItem.id] || [];
                  const isCreatorOpen = openSubitemParentId === parentItem.id;

                  return (
                    <div key={parentItem.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {/* Parent Item Row */}
                      <div
                        className={`checklist-item-row ${parentItem.is_completed ? 'is-completed' : ''}`}
                        style={{ padding: '0.65rem 0.85rem' }}
                      >
                        <button
                          type="button"
                          className={`task-checkbox-box ${parentItem.is_completed ? 'is-checked' : ''}`}
                          onClick={() => onToggleItem(checklist.id, parentItem.id)}
                          aria-label={parentItem.is_completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {parentItem.is_completed ? <Check size={12} strokeWidth={3} /> : null}
                        </button>

                        {editingItemId === parentItem.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                            <input
                              type="text"
                              className="form-input-control"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.88rem' }}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(parentItem.id);
                                if (e.key === 'Escape') setEditingItemId(null);
                              }}
                              autoFocus
                            />
                            <Button variant="mustard" size="sm" onClick={() => handleSaveEdit(parentItem.id)}>
                              Save
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingItemId(null)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span
                              className="task-content-text"
                              onClick={() => onToggleItem(checklist.id, parentItem.id)}
                              style={{
                                flex: 1,
                                cursor: 'pointer',
                                fontWeight: 600,
                                textDecoration: parentItem.is_completed ? 'line-through' : 'none',
                                color: parentItem.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                              }}
                            >
                              {parentItem.content}
                            </span>

                            <div className="task-row-actions">
                              {/* Dedicated + Subitem Button */}
                              <button
                                type="button"
                                className="btn-subitem-action"
                                onClick={() => handleOpenSubitemInput(parentItem.id)}
                                title="Add subitems under this task"
                              >
                                <Plus size={11} />
                                <span>Subitem</span>
                              </button>

                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => handleStartEdit(parentItem)}
                                title="Edit text"
                                style={{ width: '26px', height: '26px' }}
                              >
                                <Edit2 size={12} />
                              </button>

                              <button
                                type="button"
                                className="btn-icon"
                                onClick={() => handleDeleteParentAndSubitems(parentItem.id)}
                                title="Delete task and its subitems"
                                style={{ width: '26px', height: '26px' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Subitems nested directly under this parent item */}
                      {parentSubs.map((subitem) => (
                        <div
                          key={subitem.id}
                          className={`checklist-item-row is-subitem ${subitem.is_completed ? 'is-completed' : ''}`}
                        >
                          <span className="subitem-branch-icon">↳</span>
                          <button
                            type="button"
                            className={`task-checkbox-box subitem-checkbox ${subitem.is_completed ? 'is-checked' : ''}`}
                            onClick={() => onToggleItem(checklist.id, subitem.id)}
                            aria-label={subitem.is_completed ? 'Mark incomplete' : 'Mark complete'}
                          >
                            {subitem.is_completed ? <Check size={10} strokeWidth={3} /> : null}
                          </button>

                          <span
                            className="task-content-text"
                            onClick={() => onToggleItem(checklist.id, subitem.id)}
                            style={{
                              flex: 1,
                              cursor: 'pointer',
                              textDecoration: subitem.is_completed ? 'line-through' : 'none',
                              color: subitem.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                              fontSize: '0.84rem',
                            }}
                          >
                            {subitem.displayText}
                          </span>

                          <div className="task-row-actions">
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => onDeleteItem(checklist.id, subitem.id)}
                              title="Delete subitem"
                              style={{ width: '24px', height: '24px' }}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Inline Subitem Input for this parent item */}
                      {isCreatorOpen && (
                        <div className="inline-subitem-creator-box">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span className="subitem-branch-icon">↳</span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--color-mustard)', fontWeight: 700 }}>
                              Add Subitems for "{parentItem.content}":
                            </span>
                          </div>

                          <div className="inline-subitem-input-wrap">
                            <input
                              type="text"
                              className="task-quick-input"
                              style={{ minWidth: 0, padding: '0.35rem 0.5rem', fontSize: '0.84rem' }}
                              value={subitemInputText}
                              onChange={(e) => setSubitemInputText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveSubitems(parentItem.id);
                                } else if (e.key === 'Escape') {
                                  handleCancelSubitemInput();
                                }
                              }}
                              placeholder={
                                activeVoiceTarget === `subitem-${parentItem.id}` && isListening
                                  ? 'Listening... say subitems ("apples, bananas, milk")'
                                  : 'Type or speak subitems (e.g. "apples, bananas, milk")...'
                              }
                              disabled={addingSubitems}
                              autoFocus
                            />

                            {/* Mic option inside this subitem input */}
                            <VoiceRecorder
                              isListening={activeVoiceTarget === `subitem-${parentItem.id}` && isListening}
                              formattedDuration={formattedDuration}
                              isSupported={isSupported}
                              error={voiceError}
                              onStart={() => handleStartSubitemVoice(parentItem.id)}
                              onStop={() => handleStopSubitemVoice(parentItem.id)}
                              compact={true}
                              iconOnly={true}
                              title="Speak subitems (e.g. 'apples, bananas, oranges, milk')"
                            />
                          </div>

                          <div className="inline-subitem-btn-bar">
                            <Button
                              type="button"
                              variant="mustard"
                              size="sm"
                              disabled={!subitemInputText.trim() || addingSubitems}
                              loading={addingSubitems}
                              onClick={() => handleSaveSubitems(parentItem.id)}
                              style={{ fontSize: '0.76rem', padding: '0.25rem 0.7rem', fontWeight: 700 }}
                            >
                              Add Subitems
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={addingSubitems}
                              onClick={handleCancelSubitemInput}
                              style={{ fontSize: '0.76rem', padding: '0.25rem 0.5rem' }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Any unassigned legacy subitems */}
                {unassignedSubitems.map((subitem) => (
                  <div
                    key={subitem.id}
                    className={`checklist-item-row is-subitem ${subitem.is_completed ? 'is-completed' : ''}`}
                  >
                    <span className="subitem-branch-icon">↳</span>
                    <button
                      type="button"
                      className={`task-checkbox-box subitem-checkbox ${subitem.is_completed ? 'is-checked' : ''}`}
                      onClick={() => onToggleItem(checklist.id, subitem.id)}
                      aria-label={subitem.is_completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {subitem.is_completed ? <Check size={10} strokeWidth={3} /> : null}
                    </button>
                    <span
                      className="task-content-text"
                      onClick={() => onToggleItem(checklist.id, subitem.id)}
                      style={{
                        flex: 1,
                        cursor: 'pointer',
                        textDecoration: subitem.is_completed ? 'line-through' : 'none',
                        color: subitem.is_completed ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontSize: '0.84rem',
                      }}
                    >
                      {subitem.displayText}
                    </span>
                    <div className="task-row-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => onDeleteItem(checklist.id, subitem.id)}
                        title="Delete subitem"
                        style={{ width: '24px', height: '24px' }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      </div>
    </Modal>
  );
}
