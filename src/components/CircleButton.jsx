import { Icon } from '../lib/Icon.jsx';

// 32×32 round button — used for back/close/inline action icons in headers.
// Pass `icon` (Icon name) and `onClick`. `glass` makes it a translucent dark
// glass pill for use over photo heroes.

export function CircleButton({ t, icon = 'back', onClick, glass = false, size = 32, iconSize = 16, iconStroke = 1.8, iconColor }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: size / 2,
        background: glass ? 'rgba(0,0,0,0.35)' : t.soft,
        backdropFilter: glass ? 'blur(20px)' : undefined,
        WebkitBackdropFilter: glass ? 'blur(20px)' : undefined,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', cursor: 'pointer',
        padding: 0, fontFamily: t.font,
      }}
    >
      <Icon
        name={icon}
        size={iconSize}
        color={iconColor || (glass ? '#fff' : t.text)}
        stroke={iconStroke}
      />
    </button>
  );
}
