// Lightweight toast pill — bottom-center, auto-dismiss after ~2.4s.
// Wrap <App/> with <ToastProvider/>, render <ToastHost/> once, then
// fire from anywhere with `const toast = useToast(); toast('saved');`.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { theme } from './theme.js';

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  const show = useCallback((message, opts = {}) => {
    const id = ++idRef.current;
    setItems((xs) => [...xs, { id, message, tone: opts.tone || 'default' }]);
    setTimeout(() => setItems((xs) => xs.filter((t) => t.id !== id)), opts.duration || 2400);
  }, []);

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <ToastHost items={items} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}

function ToastHost({ items }) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 110px)',
        transform: 'translateX(-50%)',
        zIndex: 200,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
      }}
    >
      {items.map((t) => (
        <div
          key={t.id}
          className="anim-bubble-in"
          style={{
            padding: '10px 18px',
            borderRadius: 100,
            background: t.tone === 'accent' ? theme.accent : 'rgba(31, 18, 22, 0.92)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 0.2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            maxWidth: 320,
            textAlign: 'center',
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
