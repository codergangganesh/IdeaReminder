import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { VoiceRecorder } from '../voice/VoiceRecorder';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { generateSmartTitle, suggestCategory, extractSuggestedTags } from '../../services/smartSuggestions';
import { Sparkles, Check, Tag, ChevronDown, Flag, AlertCircle } from 'lucide-react';

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
      // Find matching category in categories list
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
    if (!content.trim()) return;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Capture Idea"
      subtitle="Speak or type your thought. Organize it later."
      maxWidth="620px"
      drawerMobile={true}
    >
      <form onSubmit={handleSubmit}>
        {/* Toggle Voice / Text input */}
        <div style={{ marginBottom: '1rem' }}>
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
          />
        </div>

        {/* Content text area */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="quick-capture-content">
            What are you thinking about?
          </label>
          <textarea
            id="quick-capture-content"
            className="form-textarea-control"
            rows={4}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setTranscript(e.target.value);
            }}
            placeholder="e.g. Create an AI tool that compares student performance across courses..."
            autoFocus
            style={{ fontSize: '1rem', lineHeight: '1.5' }}
          />
        </div>

        {/* Smart Generated Title */}
        <div className="form-field-group" style={{ marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="form-label" htmlFor="quick-capture-title">
              Idea Title
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-mustard)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={12} /> Auto-generated
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
            placeholder="Idea title (generated automatically if left blank)"
          />
        </div>

        {/* Smart Category Suggestion Badge */}
        {suggestedCat && !selectedCategoryId && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-mustard-subtle)',
              border: '1px solid var(--color-mustard-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="var(--color-mustard)" />
              <span>Suggested category:</span>
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
                gap: '0.25rem',
                backgroundColor: 'var(--color-mustard)',
                color: 'var(--color-mustard-contrast)',
                padding: '0.25rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <Check size={12} /> Accept
            </button>
          </div>
        )}

        {/* Category Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="form-field-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="quick-capture-category">
              Category
            </label>
            <select
              id="quick-capture-category"
              className="form-select-control"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Select later (Default)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="quick-capture-priority">
              Priority
            </label>
            <select
              id="quick-capture-priority"
              className="form-select-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          </div>
        </div>

        {/* Tags Input */}
        <div className="form-field-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label" htmlFor="quick-capture-tags">
            Tags (press Enter or comma)
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              alignItems: 'center',
              padding: '0.4rem 0.6rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="tag-chip mustard"
                style={{ cursor: 'pointer' }}
                onClick={() => handleRemoveTag(tag)}
                title="Click to remove"
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
              placeholder={tags.length === 0 ? 'Type #AI, #Startup...' : ''}
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                flex: 1,
                minWidth: '100px',
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="mustard"
            type="submit"
            loading={saving}
            disabled={!content.trim()}
          >
            Save Idea
          </Button>
        </div>
      </form>
    </Modal>
  );
}
