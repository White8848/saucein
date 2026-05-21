import { foodBg } from '../lib/data.js';

// Real image when r.img is provided, otherwise a moody radial-gradient
// placeholder that masquerades as food photography.
//
// Every thumb gets a bottom-to-top dark gradient so titles set against
// the image edge stay readable and the card feels framed. `overflow:
// hidden` is required so the overlay obeys the parent's borderRadius.
export function FoodThumb({ r, style }) {
  const base = r.img
    ? {
        backgroundImage: `url("${r.img}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: r.hue1,
      }
    : { background: foodBg(r), backgroundColor: r.hue1 };

  return (
    <div style={{ ...base, position: 'relative', overflow: 'hidden', ...style }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
