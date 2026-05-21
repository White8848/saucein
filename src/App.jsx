// SAUCEIN · 极简白完整版 — single-phone interactive shell.
// Renders one screen at a time inside a phone frame; nav state drives which.

import { theme } from './lib/theme.js';
import { NavProvider, useNav } from './lib/nav.jsx';
import { RecipesProvider } from './lib/recipes.jsx';
import { ToastProvider } from './lib/toast.jsx';

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

export function App() {
  return (
    <RecipesProvider>
      <ToastProvider>
        <NavProvider initial="home">
          <Shell />
        </NavProvider>
      </ToastProvider>
    </RecipesProvider>
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


