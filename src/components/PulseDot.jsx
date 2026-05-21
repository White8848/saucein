// Pulsing status dot — used in "已连接" indicators.
export function PulseDot({ color = '#5A7A3C', size = 6 }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size / 2,
        background: color,
        '--sm-status': color,
        animation: 'sm-status-pulse 1.8s ease-out infinite',
      }}
    />
  );
}
