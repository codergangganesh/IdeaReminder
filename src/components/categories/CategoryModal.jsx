import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

const EMOJI_PRESETS = [
  '💡', '🤖', '💻', '🚀', '📚', '🧪', '💼', '🛠️',
  '🎨', '📱', '🌐', '💰', '📝', '🎯', '🔥', '⚡', '🌟', '🧠'
];

const COLOR_PRESETS = [
  '#D4A72C', // Mustard
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F43F5E', // Rose
  '#14B8A6', // Teal
  '#A855F7', // Violet
  '#64748B', // Slate
];

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💡');
  const [color, setColor] = useState('#D4A72C');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setIcon(category.icon || '💡');
      setColor(category.color || '#D4A72C');
    } else {
      setName('');
      setDescription('');
      setIcon('💡');
      setColor('#D4A72C');
    }
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
      });
      onClose();
    } catch (err) {
      console.error('Save category error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Create New Category'}
      maxWidth="520px"
      drawerMobile={true}
    >
      <form onSubmit={handleSubmit}>
        {/* Name input */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="cat-name">
            Category Name *
          </label>
          <input
            id="cat-name"
            type="text"
            className="form-input-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI Projects, Startup Ideas, Daily Notes..."
            required
            autoFocus
          />
        </div>

        {/* Description input */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="cat-desc">
            Description (Optional)
          </label>
          <textarea
            id="cat-desc"
            className="form-textarea-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of ideas in this category"
          />
        </div>

        {/* Icon Picker */}
        <div className="form-field-group">
          <label className="form-label">Category Icon</label>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
              backgroundColor: 'var(--bg-input)',
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {EMOJI_PRESETS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: icon === emoji ? 'var(--color-mustard-subtle)' : 'transparent',
                  border: `1px solid ${icon === emoji ? 'var(--color-mustard)' : 'transparent'}`,
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
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
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: preset,
                  border: color === preset ? '3px solid #FFFFFF' : '1px solid rgba(0,0,0,0.1)',
                  boxShadow: color === preset ? '0 0 0 2px var(--color-mustard)' : 'none',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-fast)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="mustard" type="submit" loading={saving} disabled={!name.trim()}>
            {category ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
