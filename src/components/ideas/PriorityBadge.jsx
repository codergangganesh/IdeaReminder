import React from 'react';

export function PriorityBadge({ priority = 'Medium' }) {
  const normalized = (priority || 'Medium').toLowerCase();

  const config = {
    low: {
      color: 'var(--priority-low)',
      bg: 'var(--priority-low-bg)',
      label: 'Low',
    },
    medium: {
      color: 'var(--priority-medium)',
      bg: 'var(--priority-medium-bg)',
      label: 'Medium',
    },
    high: {
      color: 'var(--priority-high)',
      bg: 'var(--priority-high-bg)',
      label: 'High',
    },
  }[normalized] || {
    color: 'var(--priority-medium)',
    bg: 'var(--priority-medium-bg)',
    label: 'Medium',
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}33`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'inline-block',
        }}
      />
      {config.label}
    </span>
  );
}
