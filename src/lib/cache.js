// localStorage-backed cache for the small, mostly-static data we pull from
// Supabase. Versioned keys (`saucein:<scope>:v1`) — bumping the version
// retires stale shapes after schema changes without asking users to clear
// browser storage. All operations swallow exceptions because localStorage
// throws in private-browsing mode and when quota is exceeded; cache misses
// must never crash the app.

const NAMESPACE = 'saucein';

export function cacheKey(scope, version = 'v1') {
  return `${NAMESPACE}:${scope}:${version}`;
}

export function loadCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Private-browsing / quota — drop silently; the network path still works.
  }
}
