import { Icon } from '../lib/Icon.jsx';

// Design-system cover: palette, type ladder, component preview.

export function CoverScreen({ t }) {
  return (
    <div
      style={{
        width: '100%', height: '100%',
        background: t.bg, color: t.text,
        fontFamily: t.font,
        padding: '64px 28px 32px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 1.8, fontWeight: 600 }}>
        SAUCEIN · iOS
      </div>
      <div
        style={{
          fontSize: 44,
          fontWeight: t.titleWeight,
          letterSpacing: -1.2,
          lineHeight: 1,
          marginTop: 8,
        }}
      >
        极简<br />厨房感
      </div>
      <div style={{ fontSize: 14, color: t.textSec, marginTop: 14, lineHeight: 1.55 }}>
        近白底 · 黑字 · 一抹陶土红强调。<br />
        克制 · 食材为主 · AI 大厨为辅。
      </div>

      {/* palette */}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 10, color: t.textTer, letterSpacing: 0.6, fontWeight: 600, marginBottom: 8 }}>
          调色板
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { c: t.bg,     n: '#FAFAF7', l: '底' },
            { c: t.card,   n: '#FFFFFF', l: '卡片' },
            { c: t.soft,   n: '#F2F1EC', l: '柔和' },
            { c: t.text,   n: '#1A1A1A', l: '文字' },
            { c: t.accent, n: '#C7522A', l: '强调' },
          ].map((s) => (
            <div key={s.n} style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  height: 48, borderRadius: 6,
                  background: s.c,
                  border: `0.5px solid ${t.line}`,
                }}
              />
              <div
                style={{
                  fontSize: 9, color: t.textSec, marginTop: 6,
                  fontVariantNumeric: 'tabular-nums', letterSpacing: 0.2,
                }}
              >
                {s.n}
              </div>
              <div style={{ fontSize: 9, color: t.textTer, marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* type ladder */}
      <div style={{ marginTop: 24, paddingTop: 18, borderTop: `0.5px solid ${t.line}` }}>
        <div style={{ fontSize: 10, color: t.textTer, letterSpacing: 0.6, fontWeight: 600, marginBottom: 10 }}>
          字体阶梯
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.6, lineHeight: 1.05 }}>
          大标题 · 32
        </div>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.2, marginTop: 8 }}>
          章节标题 · 20
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, marginTop: 8 }}>正文 · 15 / 1.5</div>
        <div style={{ fontSize: 12, color: t.textSec, marginTop: 6 }}>辅助 · 12 / textSec</div>
      </div>

      <div style={{ flex: 1 }} />

      {/* component preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              flex: 1, height: 44, borderRadius: 12,
              background: t.accent, color: t.accentText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, gap: 6,
            }}
          >
            <Icon name="sparkle" size={16} color={t.accentText} stroke={2} />
            主操作
          </div>
          <div
            style={{
              padding: '0 18px', height: 44, borderRadius: 12,
              border: `0.5px solid ${t.line}`,
              display: 'flex', alignItems: 'center',
              fontSize: 14, fontWeight: 500,
            }}
          >
            次操作
          </div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: t.soft, position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: '60%', background: t.accent, borderRadius: 3,
            }}
          />
          <div
            style={{
              position: 'absolute', top: '50%', left: '60%',
              transform: 'translate(-50%, -50%)',
              width: 18, height: 18, borderRadius: 9,
              background: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['全部', '川菜', '家常', '凉菜'].map((c, i) => (
            <div
              key={c}
              style={{
                padding: '6px 12px', borderRadius: 100,
                background: i === 1 ? t.text : 'transparent',
                color: i === 1 ? t.bg : t.text,
                border: i === 1 ? 'none' : `0.5px solid ${t.line}`,
                fontSize: 12, fontWeight: 500,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
