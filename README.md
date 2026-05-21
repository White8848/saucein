# SAUCEIN · 极简白完整版

> iOS-style web app prototype for **SAUCEIN**, a smart sauce-mixing kitchen machine. Pink-frosted-glass UI, AI cooking assistant ("陈师傅"), 6 seeded recipes with real ingredient/step data, guest-only — no login.

🔗 **Live demo**: <https://white8848.github.io/saucein/>

---

## What it does

- **25 screens** — onboarding, pairing, home feed, recipe detail, dispensing animation, AI chat & voice, save-sauce sheet, profile, settings. Wired together with a single nav history stack — feels like a real app, not a click-through prototype.
- **AI assistant** — Chat with 陈师傅, powered by Moonshot Kimi (proxied through a Supabase Edge Function so the API key never touches the browser).
  - Recipe-aware: mention any catalog dish (e.g. "我想吃鱼香肉丝") and the bot **pops a recipe card** instead of explaining it in text.
  - Off-topic refusal: anything that isn't cooking gets politely turned away.
  - 5-turn cap per guest conversation — enforced server-side.
- **Real data** — Recipes, steps, ingredients, images come from Supabase (Postgres + RLS). Add a recipe in the DB → it shows up in chat suggestions + home feed without a redeploy.
- **Static deploy** — Pure SPA pushed to GitHub Pages via Actions on every merge to `main`.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + Vite 5, **no CSS framework** — inline styles + helpers in `src/lib/theme.js` (`glass()`, `pinkBg`) |
| Routing | Custom — `src/lib/nav.jsx`, single history stack with route params |
| Data | Supabase (`@supabase/supabase-js`), anon key in the bundle, RLS-gated SELECTs only |
| AI | Moonshot Kimi (`moonshot-v1-8k`, JSON response format) via a Supabase Edge Function proxy in `supabase/functions/chat/` |
| Hosting | GitHub Pages — Vite `base: '/saucein/'`, auto-deploy via `.github/workflows/deploy.yml` |

## Run locally

```bash
git clone git@github.com:White8848/saucein.git
cd saucein
npm install

# 1) Create .env.local with your Supabase project URL + anon key
cat > .env.local <<'EOF'
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
EOF

# 2) Start dev server (note the /saucein/ base path)
npm run dev
# → http://localhost:5173/saucein/
```

The seeded recipe schema lives under `supabase/` — apply the migrations to your own Supabase project (or use the MCP server config in `.mcp.json`) before running.

## Architecture sketch

```
src/
├─ App.jsx                  shell: <RecipesProvider><NavProvider><Stage/>...
├─ lib/
│  ├─ nav.jsx               history stack + route params
│  ├─ recipes.jsx           fetch catalog on mount; useRecipes() / fetchRecipeDetail(id)
│  ├─ supabase.js           client + resolveMediaUrl() helper
│  ├─ ai.js                 chat() — calls Edge Function, throws LimitReachedError at 5 turns
│  └─ theme.js              single theme + glass(kind) + pinkBg style helpers
├─ components/              PhoneFrame, TabBar, FoodThumb, MachineIllustration, …
└─ screens/                 7 grouped files, one per area (Cover, Home, Recipe, Sauce, Ai, Personal, Onboarding)

supabase/
└─ functions/chat/index.ts  Deno edge function — loads catalog, calls Kimi w/ JSON output, validates recipe ids
```

Deep architecture notes (conventions, gotchas, branch rules) live in [CLAUDE.md](./CLAUDE.md).

## Deploy

Merge to `main` → GitHub Actions builds with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` from repo secrets → pushes `dist/` to Pages.

The Kimi key is **not** in the bundle. It's a Supabase Edge Function secret (`KIMI_KEY`) set via the dashboard. Deploy the function with:

```bash
# requires Supabase CLI logged in, or use the Supabase MCP `deploy_edge_function` tool
supabase functions deploy chat --project-ref <ref>
```

## Contributing

This is a personal prototype, but if you spot a bug or have an idea, PRs welcome. See [CLAUDE.md](./CLAUDE.md) for branch / commit conventions (squash-merge, all-PR workflow, no force-push to main).
