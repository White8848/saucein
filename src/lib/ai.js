// Client-side AI helper. Calls the `chat` Supabase Edge Function which
// proxies to Moonshot Kimi. The Kimi key lives only on the server side
// as a Supabase Edge Function secret (KIMI_API_KEY) — never in the
// browser bundle, never in git.

import { supabase } from './supabase.js';

// Send a conversation to 陈师傅 and return the assistant's reply text.
// `messages` is the full prior history: [{ role: 'user'|'assistant', content }].
// The system prompt is prepended on the server.
//
// Throws on failure — caller is responsible for catching and surfacing
// to the UI (e.g. an error bubble in the chat thread).
export async function chat(messages) {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: { messages },
  });
  if (error) {
    // supabase-js wraps non-2xx responses in `error`. The function may
    // still have put detail in the JSON body — preserve both if possible.
    const detail = data?.error || error.message || 'AI service unavailable';
    throw new Error(detail);
  }
  if (data?.error) throw new Error(data.error);
  if (!data?.reply) throw new Error('Empty response from AI');
  return data.reply;
}
