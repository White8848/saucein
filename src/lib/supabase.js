// Supabase client. URL + anon key come from Vite env vars — set in
// .env.local for dev and via GitHub Actions Secrets for production.
// The anon key is safe to expose: data access is gated by RLS on each
// table, and right now anon can only SELECT.

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabase] Missing env vars — set VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY in .env.local (dev) or GitHub Secrets (CI).',
  );
}

export const supabase = createClient(url || '', anonKey || '', {
  auth: { persistSession: false },          // guest-only, no Auth
});

// Resolve an image_url from the DB into something the browser can fetch:
//   • Already a full URL (Storage CDN etc.) → use as-is.
//   • Relative path like 'images/yuxiang.jpg' → prepend Vite BASE_URL so
//     it works both in dev (/) and prod (/saucein/).
export function resolveMediaUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.BASE_URL || '/';
  return base + url.replace(/^\//, '');
}
