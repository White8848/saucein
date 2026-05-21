// Recipes data layer.
// `RecipesProvider` fetches the catalog once on mount and exposes it
// via `useRecipes()` to every screen. While loading, the provider holds
// the children back behind a tiny splash so screens never crash on
// `recipes[0]` access. Errors fall back to an empty list and surface a
// console.error — guest UX should still feel "live", not blank.

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, resolveMediaUrl } from './supabase.js';
import { theme } from './theme.js';

const RecipesCtx = createContext({ recipes: [], byId: {}, loading: true, error: null });

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

export function RecipesProvider({ children }) {
  const [state, setState] = useState({ recipes: [], byId: {}, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('sort_order', { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error('[recipes] fetch failed', error);
        setState({ recipes: [], byId: {}, loading: false, error });
        return;
      }
      const recipes = (data || []).map(fromRow);
      const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
      setState({ recipes, byId, loading: false, error: null });
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) return <RecipesSplash />;

  return <RecipesCtx.Provider value={state}>{children}</RecipesCtx.Provider>;
}

export function useRecipes() {
  return useContext(RecipesCtx);
}

// Fetch a single recipe's steps + ingredients on demand (used by detail
// and history screens). Cached per-recipe within the session.
const _detailCache = new Map();
export async function fetchRecipeDetail(id) {
  if (_detailCache.has(id)) return _detailCache.get(id);
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
  return detail;
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
