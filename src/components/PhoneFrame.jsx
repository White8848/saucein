// 390×844 iPhone-shaped chrome (status bar + dynamic island).
// All themed via the `t` prop; everything inside renders into the screen area.

export function PhoneFrame({ t, children, screen = '' }) {
  return (
    <div
      data-screen-label={screen}
      style={{
        width: 390,
        height: 844,
        background: t.bg,
        color: t.text,
        fontFamily: t.font,
        overflow: 'hidden',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased',
        borderRadius: 44,
        boxShadow: '0 1px 1px rgba(0,0,0,0.04), 0 24px 56px -16px rgba(20,18,14,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
      }}
    >
      <PhoneStatusBar t={t} />
      {/* dynamic island */}
      <div
        style={{
          position: 'absolute',
          top: 11,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 122,
          height: 35,
          borderRadius: 22,
          background: '#000',
          zIndex: 30,
        }}
      />
      <div style={{ height: '100%', position: 'relative' }}>{children}</div>
    </div>
  );
}

function PhoneStatusBar({ t }) {
  const c = t.text;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 54,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '0 30px 12px',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: '-apple-system, "SF Pro", system-ui',
          fontWeight: 600,
          fontSize: 16,
          color: c,
          letterSpacing: -0.2,
        }}
      >
        9:41
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="11" viewBox="0 0 18 11">
          <rect x="0"  y="7"   width="3" height="4"   rx="0.6" fill={c} />
          <rect x="5"  y="4.5" width="3" height="6.5" rx="0.6" fill={c} />
          <rect x="10" y="2"   width="3" height="9"   rx="0.6" fill={c} />
          <rect x="15" y="0"   width="3" height="11"  rx="0.6" fill={c} />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11">
          <path
            d="M8 3a7 7 0 0 1 5.6 2.8L15 4.4A9 9 0 0 0 8 1a9 9 0 0 0-7 3.4l1.4 1.4A7 7 0 0 1 8 3z"
            fill={c}
          />
          <circle cx="8" cy="9.5" r="1.4" fill={c} />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={c} strokeOpacity="0.4" fill="none" />
          <rect x="2"   y="2"   width="14" height="8"  rx="1.5" fill={c} />
          <path d="M24 3.5v5c.7-.3 1.2-1.1 1.2-2.5s-.5-2.2-1.2-2.5z" fill={c} fillOpacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

// Home-indicator pill shown at the bottom of full-bleed screens.
export function HomeIndicator({ t, color }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      <div
        style={{
          width: 134, height: 5, borderRadius: 3,
          background: color || t.text,
          opacity: 0.85,
        }}
      />
    </div>
  );
}
