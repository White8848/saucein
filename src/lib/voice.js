// Browser voice I/O — speech-to-text (Web Speech `SpeechRecognition`) and
// text-to-speech (`speechSynthesis`). Both run entirely client-side, free,
// no API key: the AI itself still goes through the `chat` edge function.
//
// Support is uneven — STT is Chrome/Edge/Safari only (webkit-prefixed),
// absent in Firefox. Callers must branch on `voiceSupported` and offer the
// text chat as a fallback. HTTPS (or localhost) is required for mic access.

import { useCallback, useEffect, useRef, useState } from 'react';

const SR =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const sttSupported = !!SR;
export const ttsSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window;
export const voiceSupported = sttSupported && ttsSupported;

// getVoices() is populated asynchronously — the list is often empty on the
// first call and fills in after a `voiceschanged` event. Prefer a mainland
// Chinese voice, then any Chinese, else let the engine default.
function pickZhVoice() {
  if (!ttsSupported) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /zh[-_]CN/i.test(v.lang)) ||
    voices.find((v) => /^zh/i.test(v.lang)) ||
    null
  );
}

export function speak(text, { onStart, onEnd } = {}) {
  if (!ttsSupported || !text) {
    onEnd?.();
    return;
  }
  // Drop anything still queued so replies don't stack up.
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  const v = pickZhVoice();
  if (v) u.voice = v;
  u.rate = 1;
  u.pitch = 1;
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function cancelSpeech() {
  if (ttsSupported) window.speechSynthesis.cancel();
}

// One-utterance-at-a-time recognition. Auto-stops on a natural pause
// (continuous = false); callers can also stop() early to force-send, or
// cancel() to discard. `onFinal(text)` fires once per utterance with the
// trimmed transcript; `onEmpty()` fires when recognition ended capturing
// nothing (silence / quick cancel) so the UI can return to idle.
export function useSpeechRecognition({ lang = 'zh-CN', onFinal, onEmpty } = {}) {
  const recRef = useRef(null);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const skipRef = useRef(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  // Keep callbacks in refs so the recognizer (built once) always calls the
  // latest version without being torn down on every render.
  const cbRef = useRef({ onFinal, onEmpty });
  cbRef.current = { onFinal, onEmpty };

  useEffect(() => {
    if (!SR) return undefined;
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      let interimText = '';
      let finalText = '';
      for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
        const res = ev.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      if (finalText) finalRef.current += finalText;
      interimRef.current = interimText;
      setInterim((finalRef.current + interimText).trim());
    };

    rec.onend = () => {
      setListening(false);
      // Some engines never flip a result to isFinal before ending — fall
      // back to the last interim text so a stop() doesn't lose the words.
      const text = (finalRef.current || interimRef.current).trim();
      finalRef.current = '';
      interimRef.current = '';
      setInterim('');
      const skip = skipRef.current;
      skipRef.current = false;
      if (skip) return;
      if (text) cbRef.current.onFinal?.(text);
      else cbRef.current.onEmpty?.();
    };

    rec.onerror = () => {
      // 'no-speech' / 'aborted' / 'not-allowed' all land here; onend still
      // fires afterward, which drives the idle transition.
      setListening(false);
    };

    recRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* already stopped */
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec || listening) return;
    finalRef.current = '';
    interimRef.current = '';
    skipRef.current = false;
    setInterim('');
    cancelSpeech(); // don't let TTS bleed into the mic
    try {
      rec.start();
      setListening(true);
    } catch {
      /* start() throws if already running — ignore */
    }
  }, [listening]);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* not running */
    }
  }, []);

  const cancel = useCallback(() => {
    skipRef.current = true;
    try {
      recRef.current?.abort();
    } catch {
      /* not running */
    }
    setListening(false);
    setInterim('');
  }, []);

  return { listening, interim, start, stop, cancel, supported: sttSupported };
}
