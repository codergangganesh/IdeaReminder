import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Star, Trash2 } from 'lucide-react';

export function IdeaEditorModal({
  isOpen,
  onClose,
  idea,
  categories = [],
  onSave,
  onDelete,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('New');
  const [priority, setPriority] = useState('Medium');
  const [isFavorite, setIsFavorite] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (idea) {
      setTitle(idea.title || '');
      setContent(idea.content || '');
      setCategoryId(idea.category_id || '');
      setStatus(idea.status || 'New');
      setPriority(idea.priority || 'Medium');
      setIsFavorite(Boolean(idea.is_favorite));
      setTags(Array.isArray(idea.tags) ? idea.tags : []);
      setTagInput('');
    }
  }, [idea]);

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

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await onSave(idea.id, {
        title: title.trim() || 'Untitled Idea',
        content: content.trim(),
        category_id: categoryId || null,
        status,
        priority,
        is_favorite: isFavorite,
        tags,
      });
      onClose();
    } catch (err) {
      console.error('Update idea error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={idea ? 'Edit Idea' : 'New Idea'}
      maxWidth="680px"
    >
      <form onSubmit={handleSubmit}>
        {/* Title & Favorite Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="editor-title">
              Title
            </label>
            <input
              id="editor-title"
              type="text"
              className="form-input-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Idea title"
            />
          </div>

          <div>
            <label className="form-label">Favorite</label>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              style={{
                height: '42px',
                padding: '0 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isFavorite ? 'var(--color-mustard-subtle)' : 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                color: isFavorite ? 'var(--color-mustard)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Star size={16} fill={isFavorite ? 'var(--color-mustard)' : 'none'} />
              {isFavorite ? 'Starred' : 'Star'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="editor-content">
            Idea Description / Content
          </label>
          <textarea
            id="editor-content"
            className="form-textarea-control"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write details, thoughts, research notes, action items..."
          />
        </div>

        {/* Metadata Controls: Category, Status, Priority */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div className="form-field-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="editor-category">
              Category
            </label>
            <select
              id="editor-category"
              className="form-select-control"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">None (Uncategorized)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="editor-status">
              Status
            </label>
            <select
              id="editor-status"
              className="form-select-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="New">💭 New</option>
              <option value="Exploring">🔍 Exploring</option>
              <option value="In Progress">🚧 In Progress</option>
              <option value="Completed">✅ Completed</option>
              <option value="Archived">📦 Archived</option>
            </select>
          </div>

          <div className="form-field-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="editor-priority">
              Priority
            </label>
            <select
              id="editor-priority"
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

        {/* Tags */}
        <div className="form-field-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="editor-tags">
            Tags (press Enter or comma)
          </label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              alignItems: 'center',
              padding: '0.45rem 0.65rem',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {tags.map((t) => (
              <span
                key={t}
                className="tag-chip mustard"
                style={{ cursor: 'pointer' }}
                onClick={() => handleRemoveTag(t)}
                title="Click to remove"
              >
                #{t} ×
              </span>
            ))}
            <input
              id="editor-tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                flex: 1,
                minWidth: '90px',
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {idea && onDelete ? (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this idea?')) {
                  onDelete(idea.id);
                  onClose();
                }
              }}
            >
              Delete Idea
            </Button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="mustard"
              type="submit"
              loading={saving}
              disabled={!content.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
