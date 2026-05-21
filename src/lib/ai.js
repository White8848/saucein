// Client-side AI helper. Calls the `chat` Supabase Edge Function which
// proxies to Moonshot Kimi. The Kimi key lives only on the server side
// as a Supabase Edge Function secret (KIMI_KEY) — never in the
// browser bundle, never in git.

import { supabase } from './supabase.js';

// Hard turn limit for guest sessions, mirrored from the server. Lets the
// UI surface "X / 5" before the server returns a 429.
export const MAX_TURNS = 5;

// LimitReachedError — thrown when the server rejects on turn-limit grounds.
// AiChatScreen catches this and switches into "start new conversation" mode.
export class LimitReachedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'LimitReachedError';
    this.limitReached = true;
  }
}

// Send a conversation to 陈师傅. Returns a normalized shape:
//
//   { intro: string, recipes: string[], reply: string, turnsUsed: number }
//
// If `recipes.length > 0`, render `intro` as a bubble + one card per id.
// Otherwise render `reply` as a plain bubble. The server has already
// validated recipe ids against the live catalog, so callers can trust them.
export async function chat(messages) {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: { messages },
  });

  // supabase-js wraps non-2xx into `error`, but the JSON body may still be
  // present in `data` — peek there for the limit_reached signal before
  // bailing.
  const limitHit = data?.limit_reached === true;
  if (limitHit) {
    throw new LimitReachedError(data?.error || `已达 ${MAX_TURNS} 个来回上限`);
  }
  if (error) {
    const detail = data?.error || error.message || 'AI service unavailable';
    throw new Error(detail);
  }
  if (data?.error) throw new Error(data.error);

  return {
    intro: data?.intro || '',
    recipes: Array.isArray(data?.recipes) ? data.recipes : [],
    reply: data?.reply || '',
    turnsUsed: typeof data?.turns_used === 'number' ? data.turns_used : 0,
  };
}
