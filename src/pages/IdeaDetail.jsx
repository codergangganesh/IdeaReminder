import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/ideas/StatusBadge';
import { PriorityBadge } from '../components/ideas/PriorityBadge';
import {
  ArrowLeft,
  Star,
  Trash2,
  Edit3,
  Calendar,
  Mic,
  Clock,
  Check,
  Tag,
} from 'lucide-react';

export function IdeaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    ideas,
    categories,
    onEditIdea,
    onDeleteIdea,
    onToggleFavorite,
    onChangeStatus,
  } = useOutletContext();

  const idea = ideas.find((i) => i.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (idea) {
      setTitle(idea.title || '');
      setContent(idea.content || '');
      setCategoryId(idea.category_id || '');
      setPriority(idea.priority || 'Medium');
      setTags(Array.isArray(idea.tags) ? idea.tags : []);
    }
  }, [idea]);

  if (!idea) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Idea not found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          This idea may have been deleted or does not exist.
        </p>
        <Button variant="mustard" onClick={() => navigate('/ideas')}>
          Back to Ideas
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === idea.category_id);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await onEditIdea(idea.id, {
        title: title.trim() || 'Untitled Idea',
        content: content.trim(),
        category_id: categoryId || null,
        priority,
        tags,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save idea edit:', err);
    } finally {
      setSaving(false);
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

  const handleRemoveTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Top Navigation & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/ideas')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Ideas
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onToggleFavorite(idea.id)}
            title={idea.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
            style={{ color: idea.is_favorite ? 'var(--color-mustard)' : 'inherit' }}
          >
            <Star
              size={18}
              fill={idea.is_favorite ? 'var(--color-mustard)' : 'none'}
            />
          </button>

          {!isEditing ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Edit3}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          ) : (
            <Button
              variant="mustard"
              size="sm"
              icon={Check}
              loading={saving}
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          )}

          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this idea?')) {
                onDeleteIdea(idea.id);
                navigate('/ideas');
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Detail Card */}
      <div
        className="iv-card-elevated"
        style={{
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Metadata Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          {isEditing ? (
            <select
              className="form-select-control"
              style={{ width: 'auto', height: '36px', fontSize: '0.85rem' }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Uncategorized</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          ) : category ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: category.color || 'var(--color-mustard)',
                backgroundColor: 'var(--color-mustard-subtle)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${category.color || 'var(--color-mustard)'}33`,
              }}
            >
              <span>{category.icon || '💡'}</span>
              <span>{category.name}</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              Uncategorized
            </span>
          )}

          <StatusBadge
            status={idea.status}
            interactive={true}
            onChange={(newStatus) => onChangeStatus(idea.id, newStatus)}
          />

          {isEditing ? (
            <select
              className="form-select-control"
              style={{ width: 'auto', height: '36px', fontSize: '0.85rem' }}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High</option>
            </select>
          ) : (
            <PriorityBadge priority={idea.priority} />
          )}

          {idea.voice_captured && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--color-mustard)',
                backgroundColor: 'var(--color-mustard-subtle)',
                padding: '0.22rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Mic size={13} /> Voice Captured
            </span>
          )}

          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <Calendar size={14} />
            <span>
              {new Date(idea.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Title */}
        {isEditing ? (
          <div className="form-field-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-input-control"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        ) : (
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              lineHeight: 1.3,
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            {idea.title}
          </h1>
        )}

        {/* Content Body */}
        {isEditing ? (
          <div className="form-field-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Content</label>
            <textarea
              className="form-textarea-control"
              rows={8}
              style={{ fontSize: '1rem', lineHeight: '1.6' }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        ) : (
          <div
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              marginBottom: '2rem',
            }}
          >
            {idea.content}
          </div>
        )}

        {/* Tags Section */}
        <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
            <Tag size={15} color="var(--color-mustard)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Tags
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {tags.map((t) => (
              <span
                key={t}
                className="tag-chip mustard"
                style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}
                onClick={() => isEditing && handleRemoveTag(t)}
              >
                #{t} {isEditing && '×'}
              </span>
            ))}

            {isEditing && (
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="+ Add tag (Enter)"
                style={{
                  border: '1px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  padding: '0.25rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            )}

            {!isEditing && tags.length === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No tags added.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
