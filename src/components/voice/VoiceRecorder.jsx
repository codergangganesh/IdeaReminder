import React from 'react';
import { Mic, MicOff } from 'lucide-react';

export function VoiceRecorder({
  isListening,
  formattedDuration,
  isSupported = true,
  error,
  onStart,
  onStop,
  title = 'Dictate with voice',
}) {
  if (!isSupported) {
    return (
      <button
        type="button"
        disabled
        className="voice-mic-icon-btn disabled"
        title="Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge."
      >
        <MicOff size={15} />
      </button>
    );
  }

  if (isListening) {
    return (
      <button
        type="button"
        className="voice-listening-wave-btn"
        onClick={onStop}
        title="Listening to your voice... Tap to finish"
        aria-label="Stop voice dictation"
      >
        <Mic size={14} className="voice-mic-pulsing" />
        <div className="voice-wave-bars">
          <span className="wave-bar-mini" style={{ animationDelay: '0s' }} />
          <span className="wave-bar-mini" style={{ animationDelay: '0.2s' }} />
          <span className="wave-bar-mini" style={{ animationDelay: '0.4s' }} />
          <span className="wave-bar-mini" style={{ animationDelay: '0.15s' }} />
        </div>
        <span className="voice-duration-tag">{formattedDuration}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className="voice-mic-icon-btn"
      onClick={onStart}
      title={error || title}
      aria-label="Start voice dictation"
    >
      <Mic size={15} />
    </button>
  );
}



