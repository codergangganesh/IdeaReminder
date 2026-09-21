import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  MoreVertical,
  Pin,
  Folder as FolderIcon,
  CheckCircle2,
  Circle,
  Edit2,
  Layers,
} from 'lucide-react';

export function ChecklistCard({
  checklist,
  folders = [],
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onEditChecklist,
  onDeleteChecklist,
  onTogglePin,
  onClearCompleted,
  onOpenDetail,
}) {
  const [newItemText, setNewItemText] = useState('');
  const [adding, setAdding] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const folder = folders.find((f) => f.id === checklist.folder_id);
  const items = checklist.items || [];
  const totalItems = items.length;
  const completedItems = items.filter((it) => it.is_completed).length;
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isAllComplete = totalItems > 0 && completedItems === totalItems;

  const handleAddItemSubmit = async (e) => {
    e?.preventDefault();
    if (!newItemText.trim() || adding) return;

    setAdding(true);
    try {
      await onAddItem(checklist.id, newItemText.trim());
      setNewItemText('');
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className={`iv-card checklist-card ${checklist.is_pinned ? 'checklist-card-pinned' : ''}`}
      style={{
        borderLeft: `4px solid ${checklist.color || 'var(--color-mustard)'}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{checklist.icon || '📝'}</span>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={checklist.title}
          >
            {checklist.title}
          </h3>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', position: 'relative' }}>
          {/* Pin action */}
          <button
            type="button"
            className="btn-icon"
            onClick={() => onTogglePin?.(checklist.id)}
            title={checklist.is_pinned ? 'Unpin checklist' : 'Pin checklist'}
            style={{
              width: '28px',
              height: '28px',
              color: checklist.is_pinned ? 'var(--color-mustard)' : 'var(--text-muted)',
            }}
          >
            <Pin size={14} fill={checklist.is_pinned ? 'var(--color-mustard)' : 'none'} />
          </button>

          {/* More menu trigger */}
          <button
            type="button"
            className="btn-icon"
            onClick={() => setMenuOpen(!menuOpen)}
            title="Options"
            style={{ width: '28px', height: '28px' }}
          >
            <MoreVertical size={14} />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 30 }}
                onClick={() => setMenuOpen(false)}
              />
              <div
                className="checklist-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 35,
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.35rem',
                  minWidth: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                }}
              >
                {onOpenDetail && (
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenDetail(checklist);
                    }}
                  >
                    <Layers size={13} />
                    <span>Expand view</span>
                  </button>
                )}

                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditChecklist?.(checklist);
                  }}
                >
                  <Edit2 size={13} />
                  <span>Edit Checklist</span>
                </button>

                {completedItems > 0 && onClearCompleted && (
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      onClearCompleted(checklist.id);
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Clear completed ({completedItems})</span>
                  </button>
                )}

                <button
                  type="button"
                  className="dropdown-item dropdown-item-danger"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm(`Delete checklist "${checklist.title}" and all its tasks?`)) {
                      onDeleteChecklist?.(checklist.id);
                    }
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Folder Pill / Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {folder ? (
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
        ) : (
          <span
            className="checklist-folder-pill"
            style={{
              backgroundColor: 'var(--bg-subtle)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            <FolderIcon size={11} />
            <span>Unfiled</span>
          </span>
        )}

        {checklist.description && (
          <span
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '220px',
            }}
          >
            {checklist.description}
          </span>
        )}
      </div>

      {/* Progress Bar & Counter */}
      <div style={{ marginBottom: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '0.3rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
            {completedItems} of {totalItems} tasks completed
          </span>
          <span
            style={{
              fontWeight: 700,
              color: isAllComplete ? '#10B981' : 'var(--color-mustard)',
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: isAllComplete ? '#10B981' : checklist.color || 'var(--color-mustard)',
              borderRadius: 'var(--radius-full)',
              transition: 'width var(--transition-normal)',
            }}
          />
        </div>
      </div>

      {/* Task Items List */}
      <div
        className="checklist-items-scroll-wrap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
          marginBottom: '0.75rem',
          maxHeight: '280px',
          overflowY: 'auto',
          paddingRight: '0.2rem',
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              padding: '0.85rem 0.5rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.82rem',
              fontStyle: 'italic',
            }}
          >
            No tasks yet. Add your first item below!
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`checklist-item-row ${item.is_completed ? 'is-completed' : ''}`}
              onClick={() => onToggleItem?.(checklist.id, item.id)}
            >
              {/* Checkbox button */}
              <button
                type="button"
                className={`task-checkbox-box ${item.is_completed ? 'is-checked' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleItem?.(checklist.id, item.id);
                }}
                aria-label={item.is_completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.is_completed ? <Check size={12} strokeWidth={3} /> : null}
              </button>

              {/* Task Content text */}
              <span className="task-content-text" title={item.content}>
                {item.content}
              </span>

              {/* Remove button (appears on hover) */}
              <button
                type="button"
                className="task-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem?.(checklist.id, item.id);
                }}
                title="Delete task"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Task Inline Input */}
      <form onSubmit={handleAddItemSubmit} style={{ marginTop: 'auto' }}>
        <div className="task-quick-add-wrap">
          <input
            type="text"
            className="task-quick-input"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="+ Add a task (press Enter)..."
            disabled={adding}
          />
          <button
            type="submit"
            className="task-quick-submit-btn"
            disabled={!newItemText.trim() || adding}
            title="Add task"
          >
            <Plus size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
