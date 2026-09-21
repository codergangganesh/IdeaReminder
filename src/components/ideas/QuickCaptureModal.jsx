import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { VoiceRecorder } from '../voice/VoiceRecorder';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { generateSmartTitle, suggestCategory, extractSuggestedTags } from '../../services/smartSuggestions';
import { Sparkles, Check, Tag } from 'lucide-react';

export function QuickCaptureModal({
  isOpen,
  onClose,
  onSave,
  categories = [],
}) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [customTitleEdited, setCustomTitleEdited] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [suggestedCat, setSuggestedCat] = useState(null);
  const [priority, setPriority] = useState('Medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);

  const textareaRef = useRef(null);

  const {
    isListening,
    transcript,
    setTranscript,
    formattedDuration,
    isSupported,
    error: voiceError,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition();

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setTitle('');
      setCustomTitleEdited(false);
      setSelectedCategoryId('');
      setSuggestedCat(null);
      setPriority('Medium');
      setTags([]);
      setTagInput('');
      resetTranscript();
    }
  }, [isOpen, resetTranscript]);

  // Sync voice transcript to content
  useEffect(() => {
    if (transcript) {
      setContent(transcript);
    }
  }, [transcript]);

  // Smart suggestions as content updates
  useEffect(() => {
    if (!content.trim()) {
      if (!customTitleEdited) setTitle('');
      setSuggestedCat(null);
      return;
    }

    if (!customTitleEdited) {
      setTitle(generateSmartTitle(content));
    }

    const suggestion = suggestCategory(content, categories);
    setSuggestedCat(suggestion);

    // Auto extract suggested tags if user hasn't added custom tags yet
    const autoTags = extractSuggestedTags(content);
    if (tags.length === 0 && autoTags.length > 0) {
      setTags(autoTags);
    }
  }, [content, categories, customTitleEdited, tags.length]);

  const handleApplySuggestedCategory = () => {
    if (suggestedCat && suggestedCat.id) {
      setSelectedCategoryId(suggestedCat.id);
    } else if (suggestedCat) {
      const matched = categories.find(
        (c) => c.name.toLowerCase() === suggestedCat.name.toLowerCase()
      );
      if (matched) setSelectedCategoryId(matched.id);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      if (isListening) {
        stopListening();
      }

      await onSave({
        title: title.trim() || generateSmartTitle(content),
        content: content.trim(),
        category_id: selectedCategoryId || (suggestedCat?.id ? suggestedCat.id : null),
        priority,
        status: 'New',
        tags,
        voice_captured: voiceMode || Boolean(transcript),
      });

      onClose();
    } catch (err) {
      console.error('Quick capture error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+Enter to save immediately
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Capture Idea"
      subtitle="Quickly jot down or dictate a new thought"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
        {/* Main Thought Box with embedded Voice Dictation */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
            }}
          >
            <label className="form-label" htmlFor="quick-capture-content" style={{ marginBottom: 0 }}>
              What's on your mind? *
            </label>

            {/* Compact Voice Dictation Pill */}
            <VoiceRecorder
              isListening={isListening}
              formattedDuration={formattedDuration}
              isSupported={isSupported}
              error={voiceError}
              onStart={() => {
                setVoiceMode(true);
                startListening(content);
              }}
              onStop={stopListening}
              onReset={resetTranscript}
              compact={true}
            />
          </div>

          <textarea
            ref={textareaRef}
            id="quick-capture-content"
            className="form-textarea-control"
            rows={4}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setTranscript(e.target.value);
            }}
            placeholder="e.g. Build an AI-assisted checklist organizer that syncs with personal projects..."
            autoFocus
            style={{
              fontSize: '0.94rem',
              lineHeight: '1.5',
              padding: '0.75rem',
              resize: 'vertical',
              minHeight: '90px',
            }}
          />
        </div>

        {/* Compact Auto-Generated Title */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Idea Title
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--color-mustard)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={11} /> Auto-suggested
            </span>
          </div>

          <input
            id="quick-capture-title"
            type="text"
            className="form-input-control"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setCustomTitleEdited(true);
            }}
            placeholder="Title will generate automatically from your note..."
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.88rem' }}
          />
        </div>

        {/* Category Suggestion Banner (if present and not selected yet) */}
        {suggestedCat && !selectedCategoryId && (
          <div
            style={{
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-mustard-subtle)',
              border: '1px solid var(--color-mustard-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color="var(--color-mustard)" />
              <span>Suggested:</span>
              <strong style={{ color: 'var(--color-mustard)' }}>
                {suggestedCat.icon} {suggestedCat.name}
              </strong>
            </div>
            <button
              type="button"
              onClick={handleApplySuggestedCategory}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                backgroundColor: 'var(--color-mustard)',
                color: 'var(--color-mustard-contrast)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Check size={11} /> Apply
            </button>
          </div>
        )}

        {/* Compact Grid: Category & Priority */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '0.65rem',
            marginBottom: '0.85rem',
          }}
        >
          {/* Category */}
          <div>
            <label className="form-label" htmlFor="quick-capture-category" style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
              Category
            </label>
            <select
              id="quick-capture-category"
              className="form-select-control"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              style={{ padding: '0.5rem 0.65rem', fontSize: '0.86rem' }}
            >
              <option value="">📁 Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="form-label" htmlFor="quick-capture-priority" style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
              Priority
            </label>
            <select
              id="quick-capture-priority"
              className="form-select-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{ padding: '0.5rem 0.65rem', fontSize: '0.86rem' }}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
        </div>

        {/* Compact Tags Row */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="quick-capture-tags" style={{ fontSize: '0.78rem', marginBottom: '0.25rem' }}>
            Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(press Enter to add)</span>
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.35rem',
              alignItems: 'center',
              padding: '0.35rem 0.55rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              minHeight: '38px',
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="tag-chip mustard"
                style={{
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  padding: '0.15rem 0.45rem',
                }}
                onClick={() => handleRemoveTag(tag)}
                title="Click to remove tag"
              >
                #{tag} ×
              </span>
            ))}
            <input
              id="quick-capture-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? 'e.g. #AI, #Productivity...' : ''}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                flex: 1,
                minWidth: '100px',
                padding: '2px 4px',
              }}
            />
          </div>
        </div>

        {/* Action Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Tip: Press <kbd style={{ padding: '2px 4px', borderRadius: '4px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>Ctrl+Enter</kbd> to save
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="mustard"
              size="sm"
              type="submit"
              loading={saving}
              disabled={!content.trim()}
              style={{ fontWeight: 700, padding: '0.5rem 1.1rem' }}
            >
              Save Idea
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
