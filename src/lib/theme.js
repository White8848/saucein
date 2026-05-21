// 粉系毛玻璃 — the new palette: pink-tone frosted glass.
// Cards are semi-transparent white; the page background is a soft pink
// (#f3e8ec) so the glass cards have something to blur against on margins
// and at hero edges. Inside content areas, cards over white look like
// barely-there outlined cards — intentional, the glass only "shows" over
// colorful regions (food heroes, pink accents, dark profile cards).

export const theme = {
  name: '粉系毛玻璃',
  desc: '近白底 + 半透白卡 + 玫红强调',
  font: '"PingFang SC", "HarmonyOS Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  bg: '#FFFFFF',
  card: 'rgba(255,255,255,0.55)',
  soft: 'rgba(255,255,255,0.4)',
  softer: 'rgba(255,255,255,0.35)',
  text: '#1F1216',
  textSec: '#7A5D67',
  textTer: '#B7A4AB',
  line: 'rgba(0,0,0,0.08)',
  lineSoft: 'rgba(238,74,129,0.06)',
  accent: '#EE4A81',
  accentSoft: 'rgba(238,74,129,0.12)',
  accentText: '#FFFFFF',
  accent2: '#2C68ED',
  accent2Soft: 'rgba(44,104,237,0.10)',
  chipBg: 'rgba(255,255,255,0.5)',
  cardSolid: 'rgba(255,255,255,0.92)',
  danger: '#EE4A81',
  success: '#2C68ED',
  tabbarBg: 'rgba(255,255,255,0.55)',
  tabbarLine: 'rgba(255,255,255,0.7)',
  iconWeight: 1.5,
  titleWeight: 600,
  h1: 28,
  h2: 20,
  body: 15,
  small: 12,
};

// ─── Glassmorphism helpers ────────────────────────────────────
// Spread these into inline style objects to get the translucent card
// look + matching backdrop-filter + soft edge in one shot:
//
//     style={{ ...glass(t), borderRadius: 18, padding: 16, ... }}
//
// `kind` picks the opacity tier:
//   • 'card'   — main glass surface (rgba 0.55, blur 24)
//   • 'soft'   — chip / button bg     (rgba 0.4, blur 16)
//   • 'softer' — faint panel          (rgba 0.35, blur 16)
//   • 'chip'   — same as soft but rgba 0.5
//   • 'solid'  — strong glass over hero (rgba 0.92, blur 28)
//   • 'tabbar' — bottom bar           (rgba 0.55, blur 20)
const GLASS_KINDS = {
  card:   { bg: 'rgba(255,255,255,0.55)', blur: 24, sat: 180, edge: true  },
  soft:   { bg: 'rgba(255,255,255,0.4)',  blur: 16, sat: 160, edge: true  },
  softer: { bg: 'rgba(255,255,255,0.35)', blur: 16, sat: 160, edge: false },
  chip:   { bg: 'rgba(255,255,255,0.5)',  blur: 16, sat: 160, edge: false },
  solid:  { bg: 'rgba(255,255,255,0.92)', blur: 28, sat: 180, edge: false },
  tabbar: { bg: 'rgba(255,255,255,0.55)', blur: 20, sat: 180, edge: false },
};

export function glass(kind = 'card') {
  const g = GLASS_KINDS[kind] || GLASS_KINDS.card;
  const filter = `blur(${g.blur}px) saturate(${g.sat}%)`;
  return {
    background: g.bg,
    backdropFilter: filter,
    WebkitBackdropFilter: filter,
    ...(g.edge && {
      boxShadow:
        'inset 0 0 0 1px rgba(0,0,0,0.05), 0 4px 24px rgba(238,74,129,0.06)',
    }),
  };
}

// ─── Pink button gradient + glow ──────────────────────────────
// Spread into solid-accent buttons / pills / hero accents:
//
//     style={{ ...pinkBg, color: '#fff', height: 44, ... }}
//
// 135° pink ramp + drop glow + top highlight. NOTE: omit on tiny dots /
// thin progress fills — the gradient direction is invisible at <30px
// and the glow looks like a bug rather than a polish.
export const pinkBg = {
  background:
    'linear-gradient(135deg, #FF8FB4 0%, #F26A98 40%, #EE4A81 70%, #DA3D72 100%)',
  boxShadow:
    '0 4px 14px rgba(238,74,129,0.32), inset 0 1px 0 rgba(255,255,255,0.25)',
};
