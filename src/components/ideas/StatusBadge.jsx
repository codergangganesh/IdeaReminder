import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const STATUS_LIST = [
  { label: 'New', emoji: '💭', color: 'var(--status-new)', bg: 'var(--status-new-bg)' },
  { label: 'Exploring', emoji: '🔍', color: 'var(--status-exploring)', bg: 'var(--status-exploring-bg)' },
  { label: 'In Progress', emoji: '🚧', color: 'var(--status-inprogress)', bg: 'var(--status-inprogress-bg)' },
  { label: 'Completed', emoji: '✅', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  { label: 'Archived', emoji: '📦', color: 'var(--status-archived)', bg: 'var(--status-archived-bg)' },
];

export function StatusBadge({ status = 'New', onChange, interactive = false }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = STATUS_LIST.find((s) => s.label.toLowerCase() === (status || '').toLowerCase()) || STATUS_LIST[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (!interactive || !onChange) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.22rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: current.color,
          backgroundColor: current.bg,
          border: `1px solid ${current.color}33`,
        }}
      >
        <span>{current.emoji}</span>
        <span>{current.label}</span>
      </span>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.22rem 0.65rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: current.color,
          backgroundColor: current.bg,
          border: `1px solid ${current.color}44`,
          cursor: 'pointer',
        }}
      >
        <span>{current.emoji}</span>
        <span>{current.label}</span>
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 50,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '0.35rem',
            minWidth: '140px',
          }}
        >
          {STATUS_LIST.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onChange(item.label);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.45rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: item.label === current.label ? 700 : 500,
                color: item.label === current.label ? 'var(--color-mustard)' : 'var(--text-primary)',
                background: item.label === current.label ? 'var(--color-mustard-subtle)' : 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
