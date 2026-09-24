import { useState, useRef, useCallback, useEffect } from 'react';

export function useVoiceRecognition(options = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const defaultCallback = typeof options === 'function' ? options : options?.onTranscript;
  const onTranscriptChangeRef = useRef(defaultCallback);

  useEffect(() => {
    if (typeof defaultCallback === 'function') {
      onTranscriptChangeRef.current = defaultCallback;
    }
  }, [defaultCallback]);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const isListeningRef = useRef(false);
  const initialTextRef = useRef('');
  const accumulatedSessionTextRef = useRef('');
  const currentSessionTextRef = useRef('');
  const latestTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanupRecognition = useCallback((shouldAbort = false) => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        const rec = recognitionRef.current;
        if (shouldAbort) {
          rec.onstart = null;
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.abort();
          recognitionRef.current = null;
        } else {
          rec.stop();
        }
      } catch (e) {}
    }
  }, []);

  const stopListening = useCallback(
    (onStopCallback) => {
      isListeningRef.current = false;
      cleanupRecognition(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Always preserve and lock in the latest full transcript
      const finalText = (latestTranscriptRef.current || transcript || '').trim();
      if (finalText) {
        setTranscript(finalText);
        if (onTranscriptChangeRef.current) {
          onTranscriptChangeRef.current(finalText);
        }
      }

      setIsListening(false);

      const callback = typeof onStopCallback === 'function' ? onStopCallback : options?.onStop;
      if (typeof callback === 'function') {
        callback(finalText);
      }

      return finalText;
    },
    [cleanupRecognition, transcript, options]
  );

  const startSessionInstance = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition ||
      window.msSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in this browser. Please use Chrome, Safari, or Edge.');
      setIsListening(false);
      isListeningRef.current = false;
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.lang = navigator.language || 'en-US';

      currentSessionTextRef.current = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let sessionResult = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item && item[0] && item[0].transcript) {
            sessionResult += item[0].transcript + ' ';
          }
        }

        currentSessionTextRef.current = sessionResult.trim();

        // Combine: initial existing text + previous sessions accumulated + current session
        const parts = [
          initialTextRef.current,
          accumulatedSessionTextRef.current,
          currentSessionTextRef.current,
        ].filter(Boolean);

        const combined = parts.join(' ').replace(/\s+([.,!?:;])/g, '$1').replace(/\s{2,}/g, ' ').trim();

        latestTranscriptRef.current = combined;
        setTranscript(combined);

        // Immediate callback to update input area in real-time!
        if (onTranscriptChangeRef.current) {
          onTranscriptChangeRef.current(combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser.');
          stopListening();
        } else if (event.error === 'network') {
          if (!isListeningRef.current) {
            setError('Speech network issue.');
          }
        } else if (event.error === 'audio-capture') {
          setError('No microphone found.');
          stopListening();
        }
      };

      recognition.onend = () => {
        // Save current session text to accumulated
        if (currentSessionTextRef.current) {
          accumulatedSessionTextRef.current = (
            accumulatedSessionTextRef.current + ' ' + currentSessionTextRef.current
          ).trim();
          currentSessionTextRef.current = '';
        }

        // Auto-restart if user has not explicitly clicked stop
        if (isListeningRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current) {
              startSessionInstance();
            }
          }, 100);
        } else {
          setIsListening(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          const finalText = (latestTranscriptRef.current || transcript || '').trim();
          if (finalText && onTranscriptChangeRef.current) {
            onTranscriptChangeRef.current(finalText);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      if (isListeningRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (isListeningRef.current) {
            startSessionInstance();
          }
        }, 250);
      } else {
        setError('Could not initialize microphone.');
        setIsListening(false);
      }
    }
  }, [stopListening, transcript]);

  const startListening = useCallback(
    async (existingText = '', onTextChange) => {
      setError(null);
      cleanupRecognition(true);

      if (typeof onTextChange === 'function') {
        onTranscriptChangeRef.current = onTextChange;
      }

      // Check / request microphone permission so browser shows native permission dialog
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop tracks immediately so it doesn't lock the audio channel
          stream.getTracks().forEach((track) => track.stop());
        } catch (permErr) {
          console.warn('Microphone permission not granted:', permErr);
          setError('Microphone access was blocked. Please click the icon in your address bar and allow microphone access.');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }
      }

      const startingText = existingText ? existingText.trim() : '';
      initialTextRef.current = startingText;
      accumulatedSessionTextRef.current = '';
      currentSessionTextRef.current = '';
      latestTranscriptRef.current = startingText;
      setTranscript(startingText);

      isListeningRef.current = true;
      setIsListening(true);
      setDuration(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      startSessionInstance();
    },
    [cleanupRecognition, startSessionInstance]
  );

  const resetTranscript = useCallback(() => {
    setTranscript('');
    initialTextRef.current = '';
    accumulatedSessionTextRef.current = '';
    currentSessionTextRef.current = '';
    latestTranscriptRef.current = '';
    setDuration(0);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      cleanupRecognition();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cleanupRecognition]);

  return {
    isListening,
    transcript,
    setTranscript,
    duration,
    formattedDuration: formatDuration(duration),
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

