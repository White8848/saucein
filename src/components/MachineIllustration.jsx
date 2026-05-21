import { glass } from '../lib/theme.js';

// Tiny SAUCEIN S1 front view — shared by Home and Device Detail.
export function MachineIllustration({ t }) {
  return (
    <div style={{ width: 92, height: 84, position: 'relative' }}>
      <div
        style={{ position: 'absolute', inset: 0, background: t.text, borderRadius: 10, opacity: 0.92 }}
      />
      <div
        style={{
          position: 'absolute', top: 8, left: 8, right: 8, height: 38,
          ...glass("softer"), borderRadius: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 24, height: 24, borderRadius: 12,
            border: `2px solid ${t.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: 3, background: t.accent }} />
        </div>
      </div>
      {/* dispenser tube */}
      <div
        style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 16, ...glass("softer"), borderRadius: 3,
        }}
      />
      {/* feet */}
      <div style={{ position: 'absolute', bottom: -3, left: 6,  width: 8, height: 4, background: t.text, borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: -3, right: 6, width: 8, height: 4, background: t.text, borderRadius: 2 }} />
    </div>
  );
}
