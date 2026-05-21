// SAUCEIN · 极简白完整版 — single-phone interactive shell.
// Renders one screen at a time inside a phone frame; nav state drives which.

import { useState, useEffect, useRef } from 'react';
// (useState/useEffect retained for DevMenu — Stage no longer needs them.)
import { theme } from './lib/theme.js';
import { NavProvider, useNav } from './lib/nav.jsx';

import { CoverScreen } from './screens/CoverScreen.jsx';
import {
  WelcomeScreen, PairingScreen, TasteProfileScreen,
} from './screens/OnboardingScreens.jsx';
import {
  HomeScreen, HomeLowStockScreen, HomeOfflineScreen,
} from './screens/HomeScreens.jsx';
import {
  AiChatScreen, AiRecommendScreen, AiStepScreen, CompleteScreen, AiVoiceScreen,
} from './screens/AiScreens.jsx';
import {
  RecipeListScreen, RecipeDetailScreen, SearchResultsScreen,
} from './screens/RecipeScreens.jsx';
import {
  SauceLibraryScreen, SauceLibraryEmptyScreen,
  SauceRatioScreen, DispensingScreen, SaveSauceScreen,
} from './screens/SauceScreens.jsx';
import {
  MeScreen, DeviceDetailScreen, HistoryDetailScreen,
  SettingsScreen, ShoppingListScreen,
} from './screens/PersonalScreens.jsx';

// Route key → screen component map.
const SCREENS = {
  cover:     CoverScreen,
  welcome:   WelcomeScreen,
  pairing:   PairingScreen,
  taste:     TasteProfileScreen,
  home:      HomeScreen,
  lowstock:  HomeLowStockScreen,
  offline:   HomeOfflineScreen,
  chat:      AiChatScreen,
  recommend: AiRecommendScreen,
  step:      AiStepScreen,
  complete:  CompleteScreen,
  voice:     AiVoiceScreen,
  list:      RecipeListScreen,
  detail:    RecipeDetailScreen,
  search:    SearchResultsScreen,
  library:   SauceLibraryScreen,
  empty:     SauceLibraryEmptyScreen,
  ratio:     SauceRatioScreen,
  dispense:  DispensingScreen,
  save:      SaveSauceScreen,
  me:        MeScreen,
  device:    DeviceDetailScreen,
  history:   HistoryDetailScreen,
  settings:  SettingsScreen,
  shopping:  ShoppingListScreen,
};

// Dev-menu groupings — every screen reachable, including the unreachable
// state-variants and the design-system cover.
const DEV_GROUPS = [
  {
    title: '设计系统',
    items: [{ route: 'cover', label: '封面' }],
  },
  {
    title: '① 启动与配对',
    items: [
      { route: 'welcome', label: '欢迎' },
      { route: 'pairing', label: '设备配对' },
      { route: 'taste',   label: '口味偏好' },
    ],
  },
  {
    title: '② 主入口 + 边缘',
    items: [
      { route: 'home',     label: '首页' },
      { route: 'lowstock', label: '首页 · 缺料' },
      { route: 'offline',  label: '首页 · 离线' },
    ],
  },
  {
    title: '③ AI',
    items: [
      { route: 'chat',      label: 'AI 对话' },
      { route: 'recommend', label: 'AI 推荐' },
      { route: 'step',      label: '引导烹饪' },
      { route: 'complete',  label: '烹饪完成' },
      { route: 'voice',     label: 'AI 语音' },
    ],
  },
  {
    title: '④ 食谱',
    items: [
      { route: 'list',   label: '列表' },
      { route: 'detail', label: '详情' },
      { route: 'search', label: '搜索结果' },
    ],
  },
  {
    title: '⑤ 酱料',
    items: [
      { route: 'library',  label: '酱料库' },
      { route: 'empty',    label: '酱料库 · 空' },
      { route: 'ratio',    label: '配比调节' },
      { route: 'dispense', label: '出料中' },
      { route: 'save',     label: '保存酱料' },
    ],
  },
  {
    title: '⑥ 个人',
    items: [
      { route: 'me',       label: '我的' },
      { route: 'device',   label: '设备详情' },
      { route: 'history',  label: '烹饪记录' },
      { route: 'settings', label: '设置' },
      { route: 'shopping', label: '购物清单' },
    ],
  },
];

export function App() {
  return (
    <NavProvider initial="home">
      <Shell />
    </NavProvider>
  );
}

function Shell() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        // Background comes from body (`#f3e8ec` soft pink) — leaving Shell
        // transparent so the pink shows around the centered phone column on
        // desktop. PhoneFrame paints its own white interior over this.
        background: 'transparent',
        fontFamily: theme.font,
        position: 'relative',
      }}
    >
      <Stage />
      <DevMenu />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Stage — renders the current route as the whole web app.
// No phone-shaped wrapper, no page transitions; modals still slide up.
// ─────────────────────────────────────────────────────────────
function Stage() {
  const { route, modal } = useNav();
  const Screen = SCREENS[route] || HomeScreen;
  const Modal = modal ? SCREENS[modal] : null;

  return (
    <>
      <Screen t={theme} />
      {Modal && (
        <div
          key={`modal-${modal}`}
          style={{
            position: 'fixed', inset: 0,
            display: 'flex', justifyContent: 'center',
            pointerEvents: 'auto',
            animation: 'modal-up 0.34s cubic-bezier(0.32, 0.72, 0, 1)',
            zIndex: 50,
          }}
        >
          <Modal t={theme} />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Dev menu — small floating button → drawer that jumps to any screen.
// Kept in here so it's never visible inside the phone frame itself.
// ─────────────────────────────────────────────────────────────
function DevMenu() {
  const { route, jump } = useNav();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  // Click-outside / Escape closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <>
      {/* trigger button */}
      <button
        aria-label="演示菜单"
        onClick={() => setOpen((x) => !x)}
        style={{
          position: 'fixed', top: 20, right: 20, zIndex: 100,
          width: 44, height: 44, borderRadius: 22,
          background: open ? theme.accent : '#1A1714',
          color: open ? '#fff' : '#EAE6DD',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          fontFamily: theme.font,
          fontSize: 18,
        }}
      >
        ☰
      </button>

      {/* drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed', top: 0, right: open ? 0 : -340, bottom: 0,
          width: 320, zIndex: 99,
          background: '#1A1714', color: '#EAE6DD',
          transition: 'right 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
          boxShadow: open ? '-8px 0 32px rgba(0,0,0,0.3)' : 'none',
          padding: '76px 0 32px',
          fontFamily: theme.font,
        }}
      >
        <div style={{ padding: '0 24px 20px' }}>
          <div
            style={{
              fontSize: 10, letterSpacing: 2.2, color: theme.accent,
              fontWeight: 700, marginBottom: 6,
            }}
          >
            SAUCEIN · 演示
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
            跳转任意屏幕
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(234,230,221,0.55)',
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            25 张主屏 · 含状态变体 + 设计系统封面。
            <br />
            可点击交互, 或用菜单直接跳屏。
          </div>
        </div>

        {DEV_GROUPS.map((g) => (
          <div key={g.title} style={{ padding: '12px 0' }}>
            <div
              style={{
                padding: '0 24px',
                fontSize: 10, letterSpacing: 1.4,
                color: 'rgba(234,230,221,0.45)',
                fontWeight: 600, textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              {g.title}
            </div>
            {g.items.map((it) => {
              const on = route === it.route;
              return (
                <button
                  key={it.route}
                  onClick={() => {
                    jump(it.route);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '8px 24px',
                    background: on ? 'rgba(199,82,42,0.16)' : 'transparent',
                    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                    borderLeft: `2px solid ${on ? theme.accent : 'transparent'}`,
                    color: on ? '#fff' : 'rgba(234,230,221,0.78)',
                    fontSize: 13, fontWeight: on ? 600 : 500,
                    fontFamily: theme.font,
                    cursor: 'pointer',
                  }}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

