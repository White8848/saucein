# SAUCEIN · 极简白完整版

iOS-style web app prototype for a smart sauce-mixing machine. 25 screens,
guest-only (no auth), reads recipes from Supabase, deploys to GitHub Pages.

## Stack
- React 18 + Vite 5 (`npm run dev` / `build` / `preview`)
- `@supabase/supabase-js` for data
- No CSS framework — inline styles + helpers in `src/lib/theme.js`

## Run / deploy
- Dev:  `npm run dev` → http://localhost:5173/saucein/
- Build: `npm run build` (uses `VITE_*` env vars)
- Live:  https://white8848.github.io/saucein/
- Deploys auto on push to `main` via `.github/workflows/deploy.yml`
- Vite `base` is `/saucein/` (matches the GH Pages path) — don't change without updating asset URLs

## Env vars (Vite only exposes `VITE_*`)
- Local: `.env.local` (gitignored) — already has dev values
- Prod:  GitHub Secrets `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`
- Anon key is safe in the client bundle — RLS gates table access

## Supabase
- MCP server configured in `.mcp.json`; project_ref `ofvbmzccgqgmnmivwnhc`
- Tools: `mcp__plugin_supabase_supabase__{list_tables,apply_migration,execute_sql,get_advisors,...}`
- Schema: `recipes`, `recipe_steps`, `recipe_ingredients`
- RLS: **anon SELECT only, no writes** — preserve this when adding tables
- `image_url` / `video_url` accept relative paths (`images/yuxiang.jpg`) OR full URLs; `resolveMediaUrl()` in `src/lib/supabase.js` handles both

## Architecture cheatsheet
- `src/App.jsx` — shell: `<RecipesProvider><NavProvider><Stage/></NavProvider></RecipesProvider>`
- `src/lib/nav.jsx` — single history stack with `params`. Use `nav.push(route, { recipeId })`, `nav.pop()`, `nav.setTab('home')`, `nav.openModal('save')`
- `src/lib/recipes.jsx` — fetches catalog on mount, gates render until ready. `useRecipes()` → `{ recipes, byId, loading }`. `fetchRecipeDetail(id)` → cached steps + ingredients
- `src/lib/theme.js` — single theme + `glass(kind)` + `pinkBg` style helpers. **Spread them**, don't re-derive:
  ```js
  style={{ ...glass('card'), borderRadius: 18, padding: 16 }}
  style={{ ...pinkBg, color: t.accentText, height: 44 }}
  ```
- `src/components/PhoneFrame.jsx` — fills viewport (max 440 px on desktop, no iPhone chrome)
- `src/screens/*Screens.jsx` — 7 grouped files. Every screen takes `{ t }` prop

## Conventions / gotchas
- Don't reintroduce the `[style*="..."]` CSS substring hack — use `glass()` / `pinkBg` instead
- Tiny dots & thin progress fills keep solid `t.accent` (no gradient — direction invisible at <30 px)
- Every `nav.push('detail', ...)` MUST pass `{ recipeId: r.id }` (or `recipes[0].id` for hero callers)
- `100dvh` (not `100vh`) to handle iOS Safari URL-bar resize
- Backdrop-filter is heavy — Playwright screenshots may time out, prefer DOM assertions

## Version control rules
- **Commit style**: imperative, present tense, ≤72-char summary. Body explains "why" in 1–3 paragraphs. Example:
  ```
  Tap-to-detail now opens the actual recipe, not always 鱼香肉丝

  nav.push now carries a params object. RecipeDetailScreen reads
  nav.params.recipeId and falls back to recipes[0]. ...
  ```
- **Never commit**: `node_modules/`, `dist/`, `.env*` (except `.env.example`), `.claude/worktrees/`, secrets in any form
- **Always run `npm run build` locally** before opening a PR — catch errors before CI
- **AI-assisted commits**: append `Co-Authored-By: Claude <noreply@anthropic.com>` trailer
- **Don't `--amend` published commits**; create a new commit and let history reflect reality
- **Don't `git push --force` to `main`** — ever. Force-pushing to feature branches is fine while the PR is open

## Branch collaboration rules
- `main` is **always deployable** — every merge to `main` auto-deploys to GH Pages
- **All changes go through a PR** — no direct push to `main`, even for solo work, even for one-line fixes. This keeps deploys reviewable in one place (GitHub) and makes rollback a one-click revert.
- Branch naming: `feat/<slug>` · `fix/<slug>` · `chore/<slug>` · `refactor/<slug>` · `docs/<slug>`
- **Merge strategy: squash** — every PR collapses to one commit on `main`. Keeps history linear and one commit ≈ one shippable change.
- PR title = the squash commit message (imperative summary, ≤72 chars). PR body = what + why + how-to-verify.
- Branch off latest `main`; if it's stale, rebase before opening the PR (or merge `main` in if rebase is messy — both fine, history is squashed anyway).
- Delete the branch after merge (GitHub does this automatically if you check the box).
- Worktrees (subagent scratch dirs) live under `.claude/worktrees/` and are gitignored — never commit them.

## Quick commands
- `gh pr create --fill --base main` — open a PR from the current branch
- `gh pr merge --squash --delete-branch` — squash, merge, clean up
- `gh run watch <run-id> --repo White8848/saucein --exit-status` — watch a deploy
- `gh secret list --repo White8848/saucein` — verify env vars in CI
