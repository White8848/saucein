// Welcome / Device Pairing / Taste Profile — the first-run flow.

import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { Icon } from '../lib/Icon.jsx';
import { useNav } from '../lib/nav.jsx';

// ─────────────────────────────────────────────────────────────
// Welcome
// ─────────────────────────────────────────────────────────────
export function WelcomeScreen({ t }) {
  const nav = useNav();
  return (
    <PhoneFrame t={t} screen="01 欢迎 Welcome">
      <div
        style={{
          height: '100%',
          padding: '64px 28px 32px',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: 12, color: t.textSec, letterSpacing: 1.6, fontWeight: 600 }}>
          SAUCEIN
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', gap: 32,
          }}
        >
          {/* hero machine */}
          <div style={{ position: 'relative', width: 200, height: 220 }}>
            {/* shadow */}
            <div
              style={{
                position: 'absolute', bottom: -8, left: '15%', right: '15%',
                height: 18, borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.12), transparent 65%)',
              }}
            />
            {/* main body */}
            <div
              style={{
                position: 'absolute', top: 18, left: 30, right: 30, bottom: 6,
                background: t.text, borderRadius: 22,
              }}
            />
            {/* screen */}
            <div
              style={{
                position: 'absolute', top: 32, left: 46, right: 46, height: 70,
                background: t.softer, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  border: `2.5px solid ${t.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: 5, background: t.accent }} />
              </div>
            </div>
            {/* dispenser pipes */}
            <div
              style={{
                position: 'absolute', top: 116, left: 50, right: 50,
                display: 'flex', justifyContent: 'space-between',
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 14,
                    background: t.softer, borderRadius: 3,
                    opacity: 0.85 - i * 0.05,
                  }}
                />
              ))}
            </div>
            {/* drip */}
            <div
              className="drop-fall"
              style={{
                position: 'absolute', top: 132, left: '50%',
                width: 8, height: 12,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: t.accent,
              }}
            />
            {/* base */}
            <div
              style={{
                position: 'absolute', bottom: 6, left: 24, right: 24,
                height: 8, background: t.text, opacity: 0.8, borderRadius: 4,
              }}
            />
          </div>

          {/* copy */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: t.titleWeight, letterSpacing: -0.8, lineHeight: 1.1 }}>
              你的私人<br />调味大师
            </div>
            <div style={{ fontSize: 15, color: t.textSec, marginTop: 14, lineHeight: 1.55, padding: '0 12px' }}>
              10 种内置调料, AI 大厨随时随地<br />为你精准配比, 一键出酱。
            </div>
          </div>
        </div>

        {/* CTA */}
        <div>
          <button
            onClick={() => nav.push('pairing')}
            style={{
              width: '100%', height: 54, borderRadius: 14, border: 'none',
              background: t.accent, color: t.accentText,
              fontSize: 16, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            开始使用
          </button>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: t.textSec }}>
            已有账号?{' '}
            <button
              onClick={() => nav.jump('home')}
              style={{
                color: t.text, fontWeight: 600,
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: t.font, fontSize: 13,
              }}
            >
              登录
            </button>
          </div>
        </div>
        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Device Pairing
// ─────────────────────────────────────────────────────────────
export function PairingScreen({ t }) {
  const nav = useNav();
  return (
    <PhoneFrame t={t} screen="02 设备配对 Pairing">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* nav */}
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="close" onClick={() => nav.jump('home')} />
          <div style={{ flex: 1, fontSize: 12, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
            第 1 步 / 共 3 步
          </div>
          <button
            onClick={() => nav.jump('home')}
            style={{
              fontSize: 13, color: t.textSec, fontWeight: 500,
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: t.font,
            }}
          >
            跳过
          </button>
        </div>

        <div style={{ padding: '12px 28px 0' }}>
          <div style={{ fontSize: 28, fontWeight: t.titleWeight, letterSpacing: -0.6, lineHeight: 1.15 }}>
            把调味机连上
          </div>
          <div style={{ fontSize: 14, color: t.textSec, marginTop: 6, lineHeight: 1.55 }}>
            确认调味机已通电, 顶部指示灯呼吸闪烁。
          </div>
        </div>

        {/* radar */}
        <div
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: 260, height: 260,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* concentric rings */}
            {[260, 200, 140].map((s, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute', width: s, height: s, borderRadius: '50%',
                  border: `1px solid ${t.line}`,
                  opacity: 1 - i * 0.15,
                }}
              />
            ))}
            {/* center machine glyph */}
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: t.accent, color: t.accentText,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${t.accent}40`,
              }}
            >
              <Icon name="machine" size={32} color={t.accentText} stroke={1.6} />
            </div>
            {/* searching dots */}
            <div
              className="radar-ping"
              style={{
                position: 'absolute', top: 24, right: 60,
                width: 10, height: 10, borderRadius: 5, background: t.accent,
              }}
            />
            <div
              className="radar-ping"
              style={{
                position: 'absolute', bottom: 40, left: 50,
                width: 6, height: 6, borderRadius: 3, background: t.accent,
                animationDelay: '1.3s',
              }}
            />
          </div>
        </div>

        {/* found list */}
        <div style={{ padding: '0 20px 8px' }}>
          <div style={{ fontSize: 12, color: t.textSec, letterSpacing: 0.4, fontWeight: 600, marginBottom: 10 }}>
            找到 1 台设备
          </div>
          <div
            style={{
              background: t.card,
              border: `1.5px solid ${t.accent}`,
              borderRadius: 16, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: t.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="machine" size={20} color={t.bg} stroke={1.6} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>SAUCEIN S1</div>
              <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                S/N: SN-2024-08772 · 信号强
              </div>
            </div>
            <Icon name="check" size={20} color={t.accent} stroke={2.4} />
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '12px 20px 36px' }}>
          <button
            onClick={() => nav.push('taste')}
            style={{
              width: '100%', height: 54, borderRadius: 14, border: 'none',
              background: t.accent, color: t.accentText,
              fontSize: 16, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            连接此设备
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Taste Profile
// ─────────────────────────────────────────────────────────────
export function TasteProfileScreen({ t }) {
  const nav = useNav();
  const tastes = [
    { label: '咸', val: 0.55 },
    { label: '甜', val: 0.70 },
    { label: '酸', val: 0.40 },
    { label: '辣', val: 0.25 },
    { label: '麻', val: 0.15 },
    { label: '鲜', val: 0.75 },
  ];
  const avoid = ['芫荽', '过辣', '过咸'];
  const avoidAll = ['芫荽', '茴香', '过辣', '过咸', '过油', '蒜', '内脏'];

  return (
    <PhoneFrame t={t} screen="03 口味偏好 Taste">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, fontSize: 12, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
            第 3 步 / 共 3 步
          </div>
          <button
            onClick={() => nav.jump('home')}
            style={{
              fontSize: 13, color: t.textSec, fontWeight: 500,
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: t.font,
            }}
          >
            跳过
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 110px' }}>
          <div style={{ fontSize: 28, fontWeight: t.titleWeight, letterSpacing: -0.6, lineHeight: 1.15 }}>
            告诉 AI 你的口味
          </div>
          <div style={{ fontSize: 14, color: t.textSec, marginTop: 6, lineHeight: 1.55 }}>
            AI 会基于这套基线为你配比所有酱料, 随时可调。
          </div>

          {/* sliders */}
          <div style={{ marginTop: 24 }}>
            {tastes.map((p) => (
              <div key={p.label} style={{ padding: '14px 0', borderBottom: `0.5px solid ${t.lineSoft}` }}>
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{p.label}</span>
                  <span style={{ fontSize: 12, color: t.textSec, fontWeight: 500 }}>
                    {p.val < 0.3 ? '清淡' : p.val < 0.55 ? '适中' : p.val < 0.75 ? '偏重' : '重口'}
                  </span>
                </div>
                <div style={{ position: 'relative', height: 6, background: t.soft, borderRadius: 3 }}>
                  <div
                    style={{
                      position: 'absolute', top: 0, left: 0, bottom: 0,
                      width: `${p.val * 100}%`, background: t.accent, borderRadius: 3,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute', top: '50%', left: `${p.val * 100}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 20, height: 20, borderRadius: 10,
                      background: '#fff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.08)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* avoidance chips */}
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: t.textSec, fontWeight: 500, letterSpacing: 0.3, marginBottom: 12 }}>
              避开以下口味或食材
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {avoidAll.map((a) => {
                const on = avoid.includes(a);
                return (
                  <div
                    key={a}
                    style={{
                      padding: '8px 14px', borderRadius: 100,
                      background: on ? t.text : 'transparent',
                      color: on ? t.bg : t.text,
                      border: on ? 'none' : `0.5px solid ${t.line}`,
                      fontSize: 13, fontWeight: 500,
                    }}
                  >
                    {a}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 20px 36px',
            background: t.tabbarBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: `0.5px solid ${t.tabbarLine}`,
          }}
        >
          <button
            onClick={() => nav.jump('home')}
            style={{
              width: '100%', height: 54, borderRadius: 14, border: 'none',
              background: t.accent, color: t.accentText,
              fontSize: 16, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            完成设置
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}
