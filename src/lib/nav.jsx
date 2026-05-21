// Nav state machine. Single history stack + active tab + optional modal overlay.
// Routes are short string keys (matching the SECTIONS map in App.jsx).

import { createContext, useContext, useState, useCallback } from 'react';

const NavCtx = createContext(null);

export function NavProvider({ children, initial = 'home' }) {
  const [route, setRoute] = useState(initial);
  const [stack, setStack] = useState([]);
  const [modal, setModal] = useState(null); // overlays the current route
  const [tab, setActiveTab] = useState(routeToTab(initial));

  // Push a new route, remember the current one in the back-stack
  const push = useCallback((r) => {
    setStack((s) => [...s, route]);
    setRoute(r);
  }, [route]);

  // Pop the last route off the stack
  const pop = useCallback(() => {
    setStack((s) => {
      if (s.length === 0) return s;
      const last = s[s.length - 1];
      setRoute(last);
      return s.slice(0, -1);
    });
  }, []);

  // Jump to a tab — resets the per-tab stack
  const setTab = useCallback((t) => {
    const root = tabRoot(t);
    setStack([]);
    setRoute(root);
    setActiveTab(t);
  }, []);

  // Hard-jump to any route (used by the dev menu); resets stack + tab
  const jump = useCallback((r) => {
    setStack([]);
    setModal(null);
    setRoute(r);
    setActiveTab(routeToTab(r));
  }, []);

  const openModal = useCallback((r) => setModal(r), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <NavCtx.Provider
      value={{
        route, stack, modal, tab,
        push, pop, setTab, jump,
        openModal, closeModal,
        canBack: stack.length > 0,
      }}
    >
      {children}
    </NavCtx.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error('useNav must be used inside <NavProvider>');
  return ctx;
}

// Map a route key to the tab it belongs under (so visiting a detail screen
// keeps the right tab highlighted).
function routeToTab(route) {
  if (TAB_OF[route]) return TAB_OF[route];
  return 'home';
}

// Each tab's default landing route.
function tabRoot(tab) {
  switch (tab) {
    case 'home':  return 'home';
    case 'book':  return 'list';
    case 'ai':    return 'chat';      // AI tab opens chat as a full-screen modal
    case 'sauce': return 'library';
    case 'me':    return 'me';
    default:      return 'home';
  }
}

// Reverse lookup — which tab does each route live under
const TAB_OF = {
  // home
  home: 'home', lowstock: 'home', offline: 'home', device: 'home',
  // recipes
  list: 'book', detail: 'book', search: 'book',
  // ai (full-screen / modal feel)
  chat: 'ai', recommend: 'ai', step: 'ai', complete: 'ai', voice: 'ai',
  // sauce
  library: 'sauce', empty: 'sauce', ratio: 'sauce', dispense: 'sauce', save: 'sauce',
  // me
  me: 'me', history: 'me', settings: 'me', shopping: 'me',
  // onboarding + cover — no tab
};
