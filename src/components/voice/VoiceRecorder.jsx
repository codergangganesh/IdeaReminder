import React from 'react';
import { Mic, Square, AlertCircle } from 'lucide-react';

export function VoiceRecorder({
  isListening,
  formattedDuration,
  isSupported,
  error,
  onStart,
  onStop,
  onReset,
  compact = true,
}) {
  if (!isSupported) {
    return (
      <div
        style={{
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#EF4444',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <AlertCircle size={15} style={{ flexShrink: 0 }} />
        <span>Speech API not supported in this browser.</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {isListening ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              animation: 'pulseGlow 1.8s infinite',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#EF4444' }}>
              Listening... {formattedDuration}
            </span>

            {/* Micro Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
              <div className="waveform-bar" style={{ width: '2.5px', height: '12px', backgroundColor: '#EF4444' }} />
              <div className="waveform-bar" style={{ width: '2.5px', height: '16px', backgroundColor: '#EF4444', animationDelay: '0.15s' }} />
              <div className="waveform-bar" style={{ width: '2.5px', height: '10px', backgroundColor: '#EF4444', animationDelay: '0.3s' }} />
              <div className="waveform-bar" style={{ width: '2.5px', height: '14px', backgroundColor: '#EF4444', animationDelay: '0.2s' }} />
            </div>

            <button
              type="button"
              onClick={onStop}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                padding: '0.2rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <Square size={10} /> Stop
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onStart}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-mustard-subtle)',
              border: '1px solid var(--color-mustard-border)',
              color: 'var(--color-mustard)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            title="Dictate with voice"
          >
            <Mic size={14} />
            <span>Voice Dictation</span>
          </button>
        )}

        {error && (
          <span style={{ fontSize: '0.76rem', color: '#EF4444', fontWeight: 500 }}>
            {error}
          </span>
        )}
      </div>
    );
  }

  // Non-compact fallback
  return (
    <div className={`voice-recorder-container ${isListening ? 'listening' : ''}`} style={{ padding: '1rem' }}>
      <button
        type="button"
        className={`mic-button-pulse ${isListening ? 'active' : ''}`}
        onClick={isListening ? onStop : onStart}
        aria-label={isListening ? 'Stop recording voice idea' : 'Start speaking voice idea'}
        style={{ width: '48px', height: '48px' }}
      >
        {isListening ? <Square size={20} /> : <Mic size={22} />}
      </button>

      <div style={{ marginTop: '0.5rem' }}>
        {isListening ? (
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EF4444' }}>
            Listening... {formattedDuration}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tap to speak</div>
        )}
      </div>
    </div>
  );
}
