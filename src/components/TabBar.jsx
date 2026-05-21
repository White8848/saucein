import { Icon } from '../lib/Icon.jsx';
import { useNav } from '../lib/nav.jsx';

// Bottom tab bar with the AI button bumped up and breathing.
// `active` prop is used as a fallback when nav context isn't available
// (defensive — every screen runs under NavProvider in this app).

export function TabBar({ t, active = 'home' }) {
  const nav = useNav();
  const activeKey = nav?.tab || active;

  const items = [
    { key: 'home',  label: '首页', icon: 'home' },
    { key: 'book',  label: '食谱', icon: 'book' },
    { key: 'ai',    label: 'AI',   icon: 'sparkle' },
    { key: 'sauce', label: '配比', icon: 'drop' },
    { key: 'me',    label: '我的', icon: 'me' },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingBottom: 28,
        paddingTop: 10,
        paddingLeft: 14,
        paddingRight: 14,
        background: t.tabbarBg,
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: `0.5px solid ${t.tabbarLine}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        zIndex: 25,
      }}
    >
      {items.map((it) => {
        if (it.key === 'ai') {
          return (
            <button
              key={it.key}
              onClick={() => nav.setTab('ai')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, flex: 1, position: 'relative', marginTop: -22,
                background: 'transparent', border: 'none',
                padding: 0, cursor: 'pointer',
                fontFamily: t.font,
              }}
            >
              <div style={{ position: 'relative', width: 56, height: 56 }}>
                {/* breathing halo */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 28,
                    pointerEvents: 'none',
                    '--sm-breath': t.accent,
                    animation: 'sm-breath 2.4s ease-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    width: 56, height: 56, borderRadius: 28,
                    background: t.accent, color: t.accentText,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 6px 18px ${t.accent}40, 0 2px 4px rgba(0,0,0,0.08)`,
                  }}
                >
                  <Icon name="sparkle" size={26} color={t.accentText} stroke={1.8} />
                </div>
              </div>
              <div style={{ fontSize: 10, color: t.textSec, fontWeight: 500 }}>AI 大厨</div>
            </button>
          );
        }
        const isActive = activeKey === it.key;
        const color = isActive ? t.text : t.textTer;
        return (
          <button
            key={it.key}
            onClick={() => nav.setTab(it.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, flex: 1, paddingTop: 4, paddingBottom: 4,
              background: 'transparent', border: 'none',
              cursor: 'pointer',
              fontFamily: t.font,
            }}
          >
            <Icon name={it.icon} size={22} color={color} stroke={t.iconWeight} />
            <div style={{ fontSize: 10, color, fontWeight: isActive ? 600 : 500 }}>{it.label}</div>
          </button>
        );
      })}
      {/* home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 8, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: 134, height: 5, borderRadius: 3, background: t.text, opacity: 0.85 }} />
      </div>
    </div>
  );
}
