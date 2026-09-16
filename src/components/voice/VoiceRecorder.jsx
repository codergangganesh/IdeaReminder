import React from 'react';
import { Mic, MicOff, Square, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';

export function VoiceRecorder({
  isListening,
  formattedDuration,
  isSupported,
  error,
  onStart,
  onStop,
  onReset,
}) {
  if (!isSupported) {
    return (
      <div
        style={{
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#EF4444',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: '1rem 0',
        }}
      >
        <AlertCircle size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Voice transcription unavailable:</strong> This browser does not support the Web Speech API. For voice dictation, please use Chrome, Edge, or Safari.
        </div>
      </div>
    );
  }

  return (
    <div className={`voice-recorder-container ${isListening ? 'listening' : ''}`}>
      <button
        type="button"
        className={`mic-button-pulse ${isListening ? 'active' : ''}`}
        onClick={isListening ? onStop : onStart}
        aria-label={isListening ? 'Stop recording voice idea' : 'Start speaking voice idea'}
      >
        {isListening ? <Square size={28} /> : <Mic size={32} />}
      </button>

      <div style={{ marginTop: '1rem' }}>
        {isListening ? (
          <div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  display: 'inline-block',
                }}
              />
              Listening... {formattedDuration}
            </div>

            <div className="audio-waveform-bars">
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Speak naturally. Tap the button or "Stop" when done.
            </p>

            <div style={{ marginTop: '0.75rem' }}>
              <Button variant="danger" size="sm" onClick={onStop} icon={Square}>
                Stop Recording
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Tap microphone to speak your idea
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Dictate your thoughts while walking, travelling, or brainstorming.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#EF4444',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
