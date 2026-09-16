import React from 'react';
import { Star, Mic, Calendar, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSecs = Math.floor((now - date) / 1000);

  if (diffInSecs < 60) return 'Just now';
  if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
  if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
  if (diffInSecs < 172800) return 'Yesterday';
  if (diffInSecs < 604800) return `${Math.floor(diffInSecs / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function IdeaCard({
  idea,
  category,
  onEdit,
  onDelete,
  onToggleFavorite,
  onChangeStatus,
  onOpenDetail,
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div
      className="iv-card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      onClick={() => onOpenDetail && onOpenDetail(idea)}
    >
      {/* Top Bar: Category & Favorite */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
          {category ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: category.color || 'var(--color-mustard)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${category.color || 'var(--color-mustard)'}33`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span>{category.icon || '💡'}</span>
              <span>{category.name}</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Uncategorized
            </span>
          )}

          {idea.voice_captured && (
            <span
              title="Voice captured idea"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--color-mustard)',
                backgroundColor: 'var(--color-mustard-subtle)',
                padding: '0.2rem 0.45rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Mic size={11} />
              <span>Voice</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            aria-label={idea.is_favorite ? 'Remove from favorites' : 'Mark as favorite'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(idea.id);
            }}
            style={{
              padding: '0.35rem',
              color: idea.is_favorite ? 'var(--color-mustard)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-full)',
              transition: 'all var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Star
              size={18}
              fill={idea.is_favorite ? 'var(--color-mustard)' : 'none'}
              stroke={idea.is_favorite ? 'var(--color-mustard)' : 'currentColor'}
            />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Idea actions"
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
                  minWidth: '130px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit && onEdit(idea);
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
                  <Edit3 size={14} /> Edit Idea
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm('Are you sure you want to delete this idea?')) {
                      onDelete && onDelete(idea.id);
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
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Idea Title */}
      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.45rem',
          lineHeight: 1.35,
        }}
      >
        {idea.title}
      </h3>

      {/* Content Preview */}
      <p
        style={{
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {idea.content}
      </p>

      {/* Tags */}
      {idea.tags && idea.tags.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            marginBottom: '1rem',
          }}
        >
          {idea.tags.map((tag) => (
            <span key={tag} className="tag-chip mustard">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Status, Priority, Date */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
          <StatusBadge
            status={idea.status}
            interactive={true}
            onChange={(newStatus) => onChangeStatus && onChangeStatus(idea.id, newStatus)}
          />
          <PriorityBadge priority={idea.priority} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={12} />
          <span>{formatTimeAgo(idea.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
