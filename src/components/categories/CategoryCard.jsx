import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';

export function CategoryCard({
  category,
  ideaCount = 0,
  onSelect,
  onEdit,
  onDelete,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="iv-card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        borderLeft: `4px solid ${category.color || 'var(--color-mustard)'}`,
      }}
      onClick={() => onSelect && onSelect(category)}
    >
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '0.85rem',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {category.icon || '💡'}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Category options"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              style={{
                padding: '0.35rem',
                color: 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  zIndex: 50,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.35rem',
                  minWidth: '120px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit && onEdit(category);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm(`Delete category "${category.name}"? Ideas in this category will become Uncategorized.`)) {
                      onDelete && onDelete(category.id);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    color: '#EF4444',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {category.name}
        </h3>

        {category.description && (
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {category.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.82rem',
          marginTop: 'auto',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--badge-bg)',
            padding: '0.18rem 0.6rem',
            borderRadius: 'var(--radius-full)',
          }}
        >
          {ideaCount} {ideaCount === 1 ? 'idea' : 'ideas'}
        </span>

        <span
          style={{
            color: 'var(--color-mustard)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          View <ArrowRight size={14} />
        </span>
      </div>
    </div>
  );
}
