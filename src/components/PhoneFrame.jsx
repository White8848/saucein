// App container — fills the viewport (mobile-first, capped at 440px on
// wider screens so the layout doesn't stretch into a weird tablet shape).
// No iPhone chrome (no status bar / dynamic island / home indicator) —
// users experience this as a real web app, not a phone screenshot.

export function PhoneFrame({ t, children, screen = '' }) {
  return (
    <div
      data-screen-label={screen}
      style={{
        width: '100%',
        maxWidth: 440,
        height: '100dvh',           // dvh handles mobile URL-bar resizing
        minHeight: '100vh',         // fallback for old browsers
        margin: '0 auto',
        background: t.bg,
        color: t.text,
        fontFamily: t.font,
        overflow: 'hidden',
        position: 'relative',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div style={{ height: '100%', position: 'relative' }}>{children}</div>
    </div>
  );
}

// Kept for source-compat with screens that still import it.
// The home-indicator pill was iPhone chrome — gone now.
export function HomeIndicator() { return null; }
