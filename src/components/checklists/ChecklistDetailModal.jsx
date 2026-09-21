import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  Check,
  Plus,
  Trash2,
  CheckCircle2,
  Filter,
  Edit2,
  Pin,
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
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'pending' | 'completed'
  const [newItemText, setNewItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [adding, setAdding] = useState(false);

  if (!checklist) return null;

  const folder = folders.find((f) => f.id === checklist.folder_id);
  const items = checklist.items || [];
  const totalItems = items.length;
  const completedItems = items.filter((it) => it.is_completed).length;
  const pendingItems = totalItems - completedItems;
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const filteredItems = items.filter((it) => {
    if (filterMode === 'pending') return !it.is_completed;
    if (filterMode === 'completed') return it.is_completed;
    return true;
  });

  const handleAddItem = async (e) => {
    e?.preventDefault();
    if (!newItemText.trim() || adding) return;

    setAdding(true);
    try {
      await onAddItem(checklist.id, newItemText.trim());
      setNewItemText('');
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
                Edit Info
              </button>
            )}
          </div>
        </div>

        {/* Add item form */}
        <form onSubmit={handleAddItem} style={{ marginBottom: '1.25rem' }}>
          <div className="task-quick-add-wrap" style={{ padding: '0.4rem 0.6rem' }}>
            <input
              type="text"
              className="task-quick-input"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="+ Add a new item (press Enter)..."
              disabled={adding}
              autoFocus
            />
            <Button
              variant="mustard"
              size="sm"
              type="submit"
              disabled={!newItemText.trim() || adding}
              loading={adding}
              icon={Plus}
            >
              Add
            </Button>
          </div>
        </form>

        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '360px', overflowY: 'auto' }}>
          {filteredItems.length === 0 ? (
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
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={`checklist-item-row ${item.is_completed ? 'is-completed' : ''}`}
                style={{ padding: '0.65rem 0.85rem' }}
              >
                <button
                  type="button"
                  className={`task-checkbox-box ${item.is_completed ? 'is-checked' : ''}`}
                  onClick={() => onToggleItem(checklist.id, item.id)}
                  aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {item.is_completed ? <Check size={12} strokeWidth={3} /> : null}
                </button>

                {editingItemId === item.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                    <input
                      type="text"
                      className="form-input-control"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.88rem' }}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(item.id);
                        if (e.key === 'Escape') setEditingItemId(null);
                      }}
                      autoFocus
                    />
                    <Button variant="mustard" size="sm" onClick={() => handleSaveEdit(item.id)}>
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
                      onClick={() => onToggleItem(checklist.id, item.id)}
                      style={{ flex: 1, cursor: 'pointer' }}
                    >
                      {item.content}
                    </span>

                    <div className="task-row-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleStartEdit(item)}
                        title="Edit text"
                        style={{ width: '26px', height: '26px' }}
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => onDeleteItem(checklist.id, item.id)}
                        title="Delete task"
                        style={{ width: '26px', height: '26px' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
