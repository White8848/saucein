// Recipes data layer.
// `RecipesProvider` reads a cached catalog from localStorage on mount —
// if anything is there, screens render instantly (no splash). It always
// refetches from Supabase in the background and only re-renders when the
// new payload differs from what's already on screen. Stale-while-
// revalidate: the user never waits twice for the same data, but stays
// in sync with whatever the DB says.
// `fetchRecipeDetail` does the same per-recipe with steps + ingredients.

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, resolveMediaUrl } from './supabase.js';
import { cacheKey, loadCache, saveCache } from './cache.js';
import { theme } from './theme.js';

const RecipesCtx = createContext({ recipes: [], byId: {}, loading: true, error: null });

const RECIPES_KEY = cacheKey('recipes');
const DETAIL_KEY = (id) => `${cacheKey('recipe-detail')}:${id}`;

// Reshape DB rows into the shape screens already expect (`name`, `category`,
// `tags`, `hue1`, `hue2`, `img`, `time`, `difficulty`, `english`). Bridges
// the schema's `time_minutes` → `time`, `image_url` → `img`, etc.
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    english: row.english,
    category: row.category,
    difficulty: row.difficulty,
    time: row.time_minutes,
    tags: row.tags || [],
    hue1: row.hue1,
    hue2: row.hue2,
    img: resolveMediaUrl(row.image_url),
    video: resolveMediaUrl(row.video_url),
    description: row.description,
    hot: row.hot,
  };
}

function buildById(recipes) {
  return Object.fromEntries(recipes.map((r) => [r.id, r]));
}

export function RecipesProvider({ children }) {
  // Seed from cache synchronously so the first paint can skip the splash.
  // Validate shape because anyone can hand-edit localStorage.
  const [state, setState] = useState(() => {
    const cached = loadCache(RECIPES_KEY);
    if (cached && Array.isArray(cached.recipes) && cached.recipes.length > 0) {
      return {
        recipes: cached.recipes,
        byId: buildById(cached.recipes),
        loading: false,
        error: null,
      };
    }
    return { recipes: [], byId: {}, loading: true, error: null };
  });

  useEffect(() => {
    let cancelled = false;
    async function revalidate() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[recipes] fetch failed', error);
        // If we already have a cached list on screen, leave it. Only fall
        // through to the empty/error state when there's nothing to show.
        setState((prev) =>
          prev.recipes.length > 0
            ? prev
            : { recipes: [], byId: {}, loading: false, error },
        );
        return;
      }
      const recipes = (data || []).map(fromRow);
      const nextJson = JSON.stringify(recipes);
      const cached = loadCache(RECIPES_KEY);
      if (cached?.json === nextJson) return; // nothing changed
      setState({ recipes, byId: buildById(recipes), loading: false, error: null });
      saveCache(RECIPES_KEY, { recipes, json: nextJson });
    }
    revalidate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Warm the browser HTTP cache for every thumbnail as soon as the list is
  // known. GH Pages gives us no Cache-Control knob, so the cheapest win is
  // preloading: by the time the user taps a card, the image is already in
  // the browser's HTTP cache and the detail screen renders instantly.
  useEffect(() => {
    if (typeof Image === 'undefined') return;
    state.recipes.forEach((r) => {
      if (r.img) new Image().src = r.img;
    });
  }, [state.recipes]);

  if (state.loading) return <RecipesSplash />;

  return <RecipesCtx.Provider value={state}>{children}</RecipesCtx.Provider>;
}

export function useRecipes() {
  return useContext(RecipesCtx);
}

// Fetch a single recipe's steps + ingredients on demand (used by detail
// and history screens). Three-layer lookup: in-memory Map → localStorage
// → network. localStorage hits return synchronously to the caller and
// kick off a background refresh; reopening the screen later picks up
// any new data the DB has.
const _detailCache = new Map();

async function refreshDetail(id) {
  const [{ data: steps }, { data: ingredients }] = await Promise.all([
    supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', id)
      .order('step_index', { ascending: true }),
    supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', id)
      .order('ord', { ascending: true }),
  ]);
  const detail = {
    steps: steps || [],
    ingredients: ingredients || [],
  };
  _detailCache.set(id, detail);
  saveCache(DETAIL_KEY(id), detail);
  return detail;
}

export async function fetchRecipeDetail(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);

  const persisted = loadCache(DETAIL_KEY(id));
  if (persisted && Array.isArray(persisted.steps) && Array.isArray(persisted.ingredients)) {
    _detailCache.set(id, persisted);
    // Fire-and-forget — keep the cache fresh for the next visit. Errors
    // here don't matter; the user is already seeing the cached version.
    refreshDetail(id).catch(() => {});
    return persisted;
  }

  return await refreshDetail(id);
}

// Splash shown while the initial recipe fetch is in flight. Same soft-pink
// page color so it doesn't flash a different theme on first paint.
function RecipesSplash() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 18,
        fontFamily: theme.font,
        color: theme.textSec,
        background: 'transparent',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          border: `2px solid ${theme.accentSoft}`,
          borderTopColor: theme.accent,
          animation: 'sm-spin 0.8s linear infinite',
        }}
      />
      <div style={{ fontSize: 12, letterSpacing: 0.4 }}>正在加载菜谱⋯</div>
    </div>
  );
}
