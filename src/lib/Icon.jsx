// Single-source inline SVG icons. Color via `stroke=currentColor` by default
// so themes can recolor them through `color` prop.

export function Icon({ name, size = 22, stroke = 1.6, color = 'currentColor', className, style }) {
  const p = {
    className, style,
    width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth: stroke,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (name) {
    case 'home':    return <svg {...p}><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>;
    case 'book':    return <svg {...p}><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22.5"/><path d="M4 4.5v18"/></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/></svg>;
    case 'me':      return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>;
    case 'back':    return <svg {...p}><path d="M15 4l-8 8 8 8"/></svg>;
    case 'forward': return <svg {...p}><path d="M9 4l8 8-8 8"/></svg>;
    case 'plus':    return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'mic':     return <svg {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>;
    case 'send':    return <svg {...p}><path d="M4 12L20 4l-3 16-5-7-8-1z"/></svg>;
    case 'heart':   return <svg {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
    case 'flame':   return <svg {...p}><path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1 2-2 3-4 3 0-3-2-5-3-7-1 4-4 6-4 11 0 4 3 7 7 7z"/></svg>;
    case 'clock':   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'search':  return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'filter':  return <svg {...p}><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case 'tune':    return <svg {...p}><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>;
    case 'pause':   return <svg {...p}><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>;
    case 'play':    return <svg {...p}><path d="M7 4l13 8-13 8z"/></svg>;
    case 'check':   return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>;
    case 'close':   return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'drop':    return <svg {...p}><path d="M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z"/></svg>;
    case 'bowl':    return <svg {...p}><path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M5 7c0-1 1-2 2-2M17 5c1 0 2 1 2 2"/></svg>;
    case 'machine': return <svg {...p}><rect x="4" y="3" width="16" height="14" rx="2"/><rect x="8" y="17" width="8" height="4" rx="1"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/></svg>;
    case 'wave':    return <svg {...p}><path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/></svg>;
    case 'heart-f': return <svg {...p} fill={color} stroke="none"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
    case 'star':    return <svg {...p}><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.8 1-6L3.3 9.4l6-.9z"/></svg>;
    case 'arrow-r': return <svg {...p}><path d="M5 12h14M14 6l6 6-6 6"/></svg>;
    default: return null;
  }
}
