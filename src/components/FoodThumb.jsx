import { foodBg } from '../lib/data.js';

// Real image when r.img is provided, otherwise a moody radial-gradient
// placeholder that masquerades as food photography.
export function FoodThumb({ r, style }) {
  if (r.img) {
    return (
      <div
        style={{
          backgroundImage: `url("${r.img}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: r.hue1,
          position: 'relative',
          ...style,
        }}
      />
    );
  }
  return (
    <div
      style={{
        background: foodBg(r),
        backgroundColor: r.hue1,
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 110%, rgba(0,0,0,0.5), transparent 60%)',
        }}
      />
    </div>
  );
}
