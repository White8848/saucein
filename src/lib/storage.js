// Tiny localStorage-backed state. Same API as useState, but values
// survive reloads and SSR/HMR. Errors (quota, private mode) degrade
// gracefully to in-memory state.

import { useCallback, useEffect, useState } from 'react';

const NS = 'saucein:';

function read(key, initial) {
  try {
    const raw = localStorage.getItem(NS + key);
    if (raw == null) return typeof initial === 'function' ? initial() : initial;
    return JSON.parse(raw);
  } catch {
    return typeof initial === 'function' ? initial() : initial;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch {
    /* swallow quota / SecurityError */
  }
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => read(key, initial));

  // Persist on every change. Skipping the first effect would be cute,
  // but writing the initial value on mount is also fine and keeps
  // semantics simple.
  useEffect(() => {
    write(key, value);
  }, [key, value]);

  // Stable setter that supports updater functions, like useState.
  const set = useCallback((next) => {
    setValue((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  return [value, set];
}
