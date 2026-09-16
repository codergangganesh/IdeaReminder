import React from 'react';
import { Button } from './Button';
import bulbNotepadImg from '../../assets/login-bulb-notepad.jpg';

export function EmptyState({
  icon: Icon,
  emoji,
  image = bulbNotepadImg,
  title = 'No ideas yet',
  description = 'Capture your next idea before you forget it.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        textAlign: 'center',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--border-color)',
        margin: '1.5rem 0',
      }}
    >
      {image ? (
        <div style={{ marginBottom: '1.25rem' }}>
          <img
            src={image}
            alt="Empty State"
            style={{
              width: '96px',
              height: 'auto',
              borderRadius: '16px',
              opacity: 0.72,
              filter: 'contrast(0.9)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              display: 'block',
              margin: '0 auto',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-mustard-subtle)',
            border: '1px solid var(--color-mustard-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            marginBottom: '1.25rem',
          }}
        >
          {Icon ? <Icon size={28} color="var(--color-mustard)" /> : emoji || '💡'}
        </div>
      )}

      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.92rem',
          color: 'var(--text-muted)',
          maxWidth: '400px',
          lineHeight: 1.5,
          marginBottom: actionLabel ? '1.5rem' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && (
        <Button variant="mustard" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
