import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clampNarrationRate,
  isWebSpeechSupported,
  selectPreferredVoice,
  type NarrationRate,
  type NarrationSegment,
} from '../lib/poemSpeech';

export type NarrationStatus =
  | 'idle'
  | 'speaking'
  | 'paused'
  | 'unsupported'
  | 'unavailable';

export interface UsePoemNarrationOptions {
  queue: readonly NarrationSegment[];
  resetKey: string;
}

export interface PoemNarrationControls {
  supported: boolean;
  status: NarrationStatus;
  activeSegmentIndex: number | null;
  activeSegment: NarrationSegment | null;
  totalSegments: number;
  rate: NarrationRate;
  voiceLabel: string | null;
  hasBengaliVoice: boolean;
  usingVisualCadence: boolean;
  togglePlayPause: () => void;
  stop: () => void;
  setRate: (rate: NarrationRate) => void;
  jumpToSegment: (segmentIndex: number) => void;
}

export function usePoemNarration({
  queue,
  resetKey,
}: UsePoemNarrationOptions): PoemNarrationControls {
  const [supported] = useState<boolean>(() => isWebSpeechSupported());
  const [status, setStatus] = useState<NarrationStatus>(() =>
    isWebSpeechSupported() ? 'idle' : 'unsupported'
  );
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(
    null
  );
  const [rate, setRateState] = useState<NarrationRate>(0.92);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [usingVisualCadence, setUsingVisualCadence] = useState(false);

  const sessionIdRef = useRef(0);
  const fallbackTimerRef = useRef<number | null>(null);
  const startWatchdogRef = useRef<number | null>(null);
  const queueRef = useRef(queue);
  const rateRef = useRef(rate);
  const voicesRef = useRef(voices);
  const statusRef = useRef(status);
  const activeIdxRef = useRef(activeSegmentIndex);

  queueRef.current = queue;
  rateRef.current = rate;
  voicesRef.current = voices;
  statusRef.current = status;
  activeIdxRef.current = activeSegmentIndex;

  const clearTimers = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (startWatchdogRef.current !== null) {
      window.clearTimeout(startWatchdogRef.current);
      startWatchdogRef.current = null;
    }
  }, []);

  const cancelSynthesis = useCallback(() => {
    clearTimers();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser speech synthesis cancellation edge errors
      }
    }
  }, [clearTimers]);

  const stop = useCallback(() => {
    sessionIdRef.current += 1;
    cancelSynthesis();
    setUsingVisualCadence(false);
    setActiveSegmentIndex(null);
    setStatus(supported ? 'idle' : 'unsupported');
  }, [cancelSynthesis, supported]);

  // Subscribe to browser speech voices
  useEffect(() => {
    if (!supported || typeof window === 'undefined') return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      try {
        const list = synth.getVoices();
        if (list.length > 0) {
          setVoices(list);
        }
      } catch {
        // Ignore voice lookup errors
      }
    };

    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, [supported]);

  // Stop narration when poem/slide key changes or page unmounts
  useEffect(() => {
    stop();
    return () => {
      sessionIdRef.current += 1;
      cancelSynthesis();
    };
  }, [resetKey, stop, cancelSynthesis]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePageHide = () => {
      sessionIdRef.current += 1;
      cancelSynthesis();
    };
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [cancelSynthesis]);

  const speakAt = useCallback(
    (segmentIdx: number, sessionId: number, currentRate: NarrationRate) => {
      if (sessionId !== sessionIdRef.current) return;
      const items = queueRef.current;

      if (segmentIdx < 0 || segmentIdx >= items.length) {
        clearTimers();
        setUsingVisualCadence(false);
        setActiveSegmentIndex(null);
        setStatus(supported ? 'idle' : 'unsupported');
        return;
      }

      if (!supported) {
        setStatus('unsupported');
        return;
      }

      const segment = items[segmentIdx];
      setActiveSegmentIndex(segmentIdx);
      setStatus('speaking');

      const synth = window.speechSynthesis;
      const preferredVoice = selectPreferredVoice(voicesRef.current, [
        'bn-BD',
        'bn-IN',
        'bn',
      ]);

      const scheduleCadenceAdvance = () => {
        clearTimers();
        setUsingVisualCadence(true);
        const estimatedMs = Math.min(
          5200,
          Math.max(1900, Math.round((segment.spokenText.length * 85) / currentRate))
        );
        fallbackTimerRef.current = window.setTimeout(() => {
          if (
            sessionId !== sessionIdRef.current ||
            statusRef.current !== 'speaking'
          ) {
            return;
          }
          speakAt(segmentIdx + 1, sessionId, rateRef.current);
        }, estimatedMs);
      };

      try {
        const utterance = new SpeechSynthesisUtterance(segment.spokenText);
        utterance.lang = preferredVoice?.lang || 'bn-BD';
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        utterance.rate = currentRate;
        utterance.pitch = 1;

        let nativeStarted = false;

        utterance.onstart = () => {
          if (sessionId !== sessionIdRef.current) return;
          nativeStarted = true;
          clearTimers();
          setUsingVisualCadence(false);
        };

        utterance.onend = () => {
          if (sessionId !== sessionIdRef.current) return;
          clearTimers();
          if (statusRef.current === 'paused') return;
          speakAt(segmentIdx + 1, sessionId, rateRef.current);
        };

        utterance.onerror = (event) => {
          if (sessionId !== sessionIdRef.current) return;
          clearTimers();
          const reason = event?.error;
          if (reason === 'canceled' || reason === 'interrupted') {
            return;
          }
          // Fall back cleanly to paced visual reading cadence if OS has no speech engine
          if (!nativeStarted) {
            scheduleCadenceAdvance();
          } else {
            setStatus('unavailable');
            setActiveSegmentIndex(null);
          }
        };

        // If browser exposes 0 system voices or fails to fire onstart (e.g., Linux headless Chromium),
        // seamlessly engage paced line progression after a brief grace window.
        startWatchdogRef.current = window.setTimeout(() => {
          if (
            sessionId !== sessionIdRef.current ||
            nativeStarted ||
            statusRef.current !== 'speaking'
          ) {
            return;
          }
          if (voicesRef.current.length === 0 || !synth.speaking) {
            scheduleCadenceAdvance();
          }
        }, 850);

        synth.speak(utterance);
      } catch {
        scheduleCadenceAdvance();
      }
    },
    [clearTimers, supported]
  );

  const jumpToSegment = useCallback(
    (segmentIndex: number) => {
      if (!supported) {
        setStatus('unsupported');
        return;
      }
      if (queueRef.current.length === 0) return;

      const bounded = Math.max(
        0,
        Math.min(queueRef.current.length - 1, segmentIndex)
      );
      sessionIdRef.current += 1;
      const nextSession = sessionIdRef.current;
      cancelSynthesis();
      speakAt(bounded, nextSession, rateRef.current);
    },
    [cancelSynthesis, speakAt, supported]
  );

  const togglePlayPause = useCallback(() => {
    if (!supported) {
      setStatus('unsupported');
      return;
    }

    if (queueRef.current.length === 0) return;

    if (statusRef.current === 'speaking') {
      clearTimers();
      if (!usingVisualCadence) {
        try {
          window.speechSynthesis.pause();
        } catch {
          // Some browsers do not implement pause reliably; stop timers cleanly
        }
      }
      setStatus('paused');
      return;
    }

    if (statusRef.current === 'paused') {
      if (usingVisualCadence) {
        const resumeIdx = activeIdxRef.current ?? 0;
        sessionIdRef.current += 1;
        speakAt(resumeIdx, sessionIdRef.current, rateRef.current);
        return;
      }
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setStatus('speaking');
          return;
        }
      } catch {
        // Fallback to re-speaking the active line if resume fails
      }
      const resumeIdx = activeIdxRef.current ?? 0;
      sessionIdRef.current += 1;
      cancelSynthesis();
      speakAt(resumeIdx, sessionIdRef.current, rateRef.current);
      return;
    }

    sessionIdRef.current += 1;
    cancelSynthesis();
    speakAt(0, sessionIdRef.current, rateRef.current);
  }, [cancelSynthesis, clearTimers, speakAt, supported, usingVisualCadence]);

  const setRate = useCallback(
    (nextRawRate: NarrationRate) => {
      const clamped = clampNarrationRate(nextRawRate);
      setRateState(clamped);
      rateRef.current = clamped;

      if (statusRef.current === 'speaking' && activeIdxRef.current !== null) {
        const currentIdx = activeIdxRef.current;
        sessionIdRef.current += 1;
        const nextSession = sessionIdRef.current;
        cancelSynthesis();
        speakAt(currentIdx, nextSession, clamped);
      }
    },
    [cancelSynthesis, speakAt]
  );

  const selectedVoice = selectPreferredVoice(voices, ['bn-BD', 'bn-IN', 'bn']);
  const hasBengaliVoice = Boolean(
    selectedVoice && selectedVoice.lang.toLowerCase().startsWith('bn')
  );
  const activeSegment =
    activeSegmentIndex !== null ? queue[activeSegmentIndex] ?? null : null;

  return {
    supported,
    status,
    activeSegmentIndex,
    activeSegment,
    totalSegments: queue.length,
    rate,
    voiceLabel: selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : null,
    hasBengaliVoice,
    usingVisualCadence,
    togglePlayPause,
    stop,
    setRate,
    jumpToSegment,
  };
}
