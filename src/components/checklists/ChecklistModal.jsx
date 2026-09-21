import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DEFAULT_FOLDER_COLORS } from '../../services/checklistService';
import { FolderPlus, Plus, Trash2 } from 'lucide-react';

const CHECKLIST_ICONS = ['📝', '✅', '🎯', '🚀', '⚡', '🛒', '💻', '📌', '💡', '🏷️', '📋', '🔥'];

export function ChecklistModal({
  isOpen,
  onClose,
  checklist,
  folders = [],
  defaultFolderId = null,
  onSave,
  onOpenCreateFolder,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState('');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState('#D4A72C');
  const [initialItems, setInitialItems] = useState(['', '']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (checklist) {
      setTitle(checklist.title || '');
      setDescription(checklist.description || '');
      setFolderId(checklist.folder_id || '');
      setIcon(checklist.icon || '📝');
      setColor(checklist.color || '#D4A72C');
      setInitialItems([]);
    } else {
      setTitle('');
      setDescription('');
      setFolderId(defaultFolderId || '');
      setIcon('📝');
      setColor('#D4A72C');
      setInitialItems(['', '']);
    }
  }, [checklist, defaultFolderId, isOpen]);

  const handleAddItemField = () => {
    setInitialItems((prev) => [...prev, '']);
  };

  const handleItemChange = (index, value) => {
    setInitialItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleRemoveItemField = (index) => {
    setInitialItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const validInitialItems = initialItems
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        folder_id: folderId || null,
        icon,
        color,
        initialItems: checklist ? undefined : validInitialItems,
      });
      onClose();
    } catch (err) {
      console.error('Save checklist error:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={checklist ? 'Edit Checklist' : 'Create New Checklist'}
      subtitle="Organize actionable tasks and items in one place"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-field-group">
          <label className="form-label" htmlFor="checklist-title">
            Checklist Title *
          </label>
          <input
            id="checklist-title"
            type="text"
            className="form-input-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Product Launch Tasks, Grocery List, Weekend Goals..."
            required
            autoFocus
          />
        </div>

        {/* Folder Select */}
        <div className="form-field-group">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
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
            Description / Notes (Optional)
          </label>
          <textarea
            id="checklist-desc"
            className="form-textarea-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context or reminder notes..."
          />
        </div>

        {/* Initial Tasks (only for creation) */}
        {!checklist && (
          <div className="form-field-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Initial Tasks (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddItemField}
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--color-mustard)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {initialItems.map((itemVal, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '18px', textAlign: 'right' }}>
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    className="form-input-control"
                    style={{ flex: 1, padding: '0.5rem 0.75rem' }}
                    value={itemVal}
                    onChange={(e) => handleItemChange(idx, e.target.value)}
                    placeholder={`Task ${idx + 1}...`}
                  />
                  {initialItems.length > 1 && (
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => handleRemoveItemField(idx)}
                      title="Remove row"
                      style={{ width: '28px', height: '28px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
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
              gap: '0.45rem',
              backgroundColor: 'var(--bg-input)',
              padding: '0.65rem',
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
          <Button variant="mustard" type="submit" loading={saving} disabled={!title.trim()}>
            {checklist ? 'Save Changes' : 'Create Checklist'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
