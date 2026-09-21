import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DEFAULT_FOLDER_ICONS, DEFAULT_FOLDER_COLORS } from '../../services/checklistService';

export function FolderModal({
  isOpen,
  onClose,
  folder,
  onSave,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#D4A72C');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (folder) {
      setName(folder.name || '');
      setDescription(folder.description || '');
      setIcon(folder.icon || '📁');
      setColor(folder.color || '#D4A72C');
    } else {
      setName('');
      setDescription('');
      setIcon('📁');
      setColor('#D4A72C');
    }
  }, [folder, isOpen]);

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
      console.error('Save folder error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={folder ? 'Edit Folder' : 'Create New Folder'}
      subtitle="Organize your checklists into categorized workspaces"
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit}>
        {/* Name input */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="folder-name">
            Folder Name *
          </label>
          <input
            id="folder-name"
            type="text"
            className="form-input-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work Sprints, Launch Prep, Daily Tasks..."
            required
            autoFocus
          />
        </div>

        {/* Description input */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="folder-desc">
            Description (Optional)
          </label>
          <textarea
            id="folder-desc"
            className="form-textarea-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary of checklists in this folder"
          />
        </div>

        {/* Icon Picker */}
        <div className="form-field-group">
          <label className="form-label">Folder Icon</label>
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
            {DEFAULT_FOLDER_ICONS.map((emoji) => (
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
          <label className="form-label">Folder Accent Color</label>
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
            {DEFAULT_FOLDER_COLORS.map((preset) => (
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
                  transform: color === preset ? 'scale(1.15)' : 'scale(1)',
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
            {folder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
