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

// getVoices() is populated asynchronously — the list is usually empty on the
// first call and fills in after a `voiceschanged` event. Warm a cache at load
// so the first reply isn't read in a wrong-language fallback voice.
let cachedVoices = [];
function loadVoices() {
  if (ttsSupported) cachedVoices = window.speechSynthesis.getVoices() || [];
}
if (ttsSupported) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

// Prefer a mainland Chinese voice, then any Chinese, else the engine default.
function pickZhVoice() {
  const voices = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /zh[-_]CN/i.test(v.lang)) ||
    voices.find((v) => /^zh/i.test(v.lang)) ||
    null
  );
}

let resumeTimer = null;
let pendingSpeak = null;
let safetyTimer = null;

function clearTimers() {
  if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
  if (pendingSpeak) { clearTimeout(pendingSpeak); pendingSpeak = null; }
  if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
}

export function speak(text, { onStart, onEnd } = {}) {
  if (!ttsSupported || !text) {
    onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  clearTimers();

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    if (resumeTimer) { clearInterval(resumeTimer); resumeTimer = null; }
    if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
    onEnd?.();
  };

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  const v = pickZhVoice();
  if (v) u.voice = v;
  u.rate = 1;
  u.pitch = 1;
  u.onstart = () => onStart?.();
  u.onend = finish;
  u.onerror = finish;

  const begin = () => {
    pendingSpeak = null;
    synth.speak(u);
    // Chrome silently pauses synthesis after ~15s; a periodic resume() keeps
    // long replies talking so onend actually fires.
    resumeTimer = setInterval(() => {
      if (!synth.speaking) { clearInterval(resumeTimer); resumeTimer = null; return; }
      synth.resume();
    }, 8000);
    // Hard safety: if the engine never fires onend (a real Chrome failure
    // mode), release the caller anyway so the UI can't get stuck "speaking".
    safetyTimer = setTimeout(finish, Math.max(5000, text.length * 380));
  };

  const wasActive = synth.speaking || synth.pending;
  synth.cancel();
  // cancel()-then-speak() in the same tick is dropped by some Chrome builds —
  // defer a tick when we actually interrupted something.
  if (wasActive) pendingSpeak = setTimeout(begin, 80);
  else begin();
}

export function cancelSpeech() {
  clearTimers();
  if (ttsSupported) window.speechSynthesis.cancel();
}

// One-utterance-at-a-time recognition. Browser auto-end on a pause is flaky
// (especially on deployed HTTPS), so we run our own silence timer: once any
// speech has been heard, a gap of `SILENCE_MS` with no new result force-stops
// recognition, which fires onend → onFinal. Callers can also stop() to send
// immediately or cancel() to discard. `onFinal(text)` fires with the trimmed
// transcript; `onEmpty()` fires when nothing was captured.
const SILENCE_MS = 1600;

export function useSpeechRecognition({ lang = 'zh-CN', onFinal, onEmpty } = {}) {
  const recRef = useRef(null);
  const finalRef = useRef('');
  const interimRef = useRef('');
  const skipRef = useRef(false);
  const silenceRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const cbRef = useRef({ onFinal, onEmpty });
  cbRef.current = { onFinal, onEmpty };

  useEffect(() => {
    if (!SR) return undefined;
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    const clearSilence = () => {
      if (silenceRef.current) {
        clearTimeout(silenceRef.current);
        silenceRef.current = null;
      }
    };
    const armSilence = () => {
      clearSilence();
      silenceRef.current = setTimeout(() => {
        try {
          rec.stop();
        } catch {
          /* already stopping */
        }
      }, SILENCE_MS);
    };

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
      const shown = (finalRef.current + interimText).trim();
      setInterim(shown);
      // Only arm once we've actually heard something — otherwise the timer
      // would cut off a user who's still gathering their thoughts.
      if (shown) armSilence();
    };

    rec.onend = () => {
      clearSilence();
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
      clearSilence();
      setListening(false);
    };

    recRef.current = rec;
    return () => {
      clearSilence();
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
