// Nav state machine. Single history stack + active tab + optional modal
// overlay. Every entry carries a `params` object so screens can read what
// they were opened with (e.g. RecipeDetailScreen wants params.recipeId).

import { createContext, useContext, useState, useCallback } from 'react';

const NavCtx = createContext(null);

export function NavProvider({ children, initial = 'home' }) {
  const [route, setRoute] = useState(initial);
  const [params, setParams] = useState({});
  const [stack, setStack] = useState([]); // each entry: { route, params }
  const [modal, setModal] = useState(null);
  const [tab, setActiveTab] = useState(routeToTab(initial));

  // Push a new route; remember the current route+params on the back stack.
  const push = useCallback(
    (r, p = {}) => {
      setStack((s) => [...s, { route, params }]);
      setRoute(r);
      setParams(p);
    },
    [route, params],
  );

  // Pop the last entry, restoring its route + params.
  const pop = useCallback(() => {
    setStack((s) => {
      if (s.length === 0) return s;
      const last = s[s.length - 1];
      setRoute(last.route);
      setParams(last.params || {});
      return s.slice(0, -1);
    });
  }, []);

  // Jump to a tab — resets the per-tab stack + params.
  const setTab = useCallback((t) => {
    const root = tabRoot(t);
    setStack([]);
    setRoute(root);
    setParams({});
    setActiveTab(t);
  }, []);

  // Hard-jump to any route (used by the dev menu). Optional params.
  const jump = useCallback((r, p = {}) => {
    setStack([]);
    setModal(null);
    setRoute(r);
    setParams(p);
    setActiveTab(routeToTab(r));
  }, []);

  const openModal = useCallback((r) => setModal(r), []);
  const closeModal = useCallback(() => setModal(null), []);

  return (
    <NavCtx.Provider
      value={{
        route, params, stack, modal, tab,
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

function routeToTab(route) {
  if (TAB_OF[route]) return TAB_OF[route];
  return 'home';
}

function tabRoot(tab) {
  switch (tab) {
    case 'home':  return 'home';
    case 'book':  return 'list';
    case 'ai':    return 'chat';
    case 'sauce': return 'library';
    case 'me':    return 'me';
    default:      return 'home';
  }
}

const TAB_OF = {
  home: 'home', lowstock: 'home', offline: 'home', device: 'home',
  list: 'book', detail: 'book', search: 'book',
  chat: 'ai', recommend: 'ai', step: 'ai', complete: 'ai', voice: 'ai',
  library: 'sauce', empty: 'sauce', ratio: 'sauce', dispense: 'sauce', save: 'sauce',
  me: 'me', history: 'me', settings: 'me', shopping: 'me',
};
