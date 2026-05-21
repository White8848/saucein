// Sauce library, ratio adjustment, dispensing, save-as-modal, empty state.

import { useState, useRef, useCallback } from 'react';
import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { TabBar } from '../components/TabBar.jsx';
import { Icon } from '../lib/Icon.jsx';
import { SEASONINGS, YUXIANG_RATIO } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { glass, pinkBg } from '../lib/theme.js';

// ─────────────────────────────────────────────────────────────
// Sauce Library
// ─────────────────────────────────────────────────────────────
export function SauceLibraryScreen({ t }) {
  const nav = useNav();
  const sauces = [
    { name: '鱼香汁',     sub: '咸甜微辣 · 经典川味', colors: ['#5B3B1F', '#7B3F2C', '#F2EAD8', '#C9A86A', '#C53A1A'], used: 12, last: '2 天前', mine: false },
    { name: '泰式甜辣',   sub: '酸甜带椒香',          colors: ['#F2EAD8', '#C9A86A', '#C53A1A', '#7B3F2C'],             used: 3,  last: '上周',   mine: true  },
    { name: '葱姜蘸料',   sub: '清淡蘸白切',          colors: ['#B07A2C', '#FFFFFF', '#3A2412'],                         used: 8,  last: '昨天',   mine: false },
    { name: '麻辣红油',   sub: '香辣开胃',            colors: ['#C53A1A', '#7B3F2C', '#2C1810', '#B07A2C'],             used: 5,  last: '4 天前', mine: false },
    { name: '老醋汁',     sub: '酸鲜微甜',            colors: ['#7B3F2C', '#5B3B1F', '#F2EAD8'],                         used: 2,  last: '上月',   mine: true  },
  ];

  return (
    <PhoneFrame t={t} screen="11 酱料库 Library">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
          {/* nav */}
          <div style={{ padding: '64px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4, letterSpacing: 0.4, fontWeight: 500 }}>
                  MY SAUCES
                </div>
                <div style={{ fontSize: t.h1, fontWeight: t.titleWeight, letterSpacing: -0.6 }}>酱料库</div>
              </div>
              <button
                onClick={() => nav.push('ratio')}
                aria-label="新建"
                style={{
                  width: 40, height: 40, borderRadius: 20, ...pinkBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <Icon name="plus" size={18} color={t.accentText} stroke={2.4} />
              </button>
            </div>
          </div>

          {/* tabs */}
          <div
            style={{
              padding: '14px 20px 0', display: 'flex', gap: 16,
              borderBottom: `0.5px solid ${t.lineSoft}`,
            }}
          >
            {['全部 5', '系统配方 3', '我创建的 2'].map((tab, i) => (
              <div
                key={tab}
                style={{
                  padding: '8px 0 12px',
                  borderBottom: i === 0 ? `2px solid ${t.text}` : 'none',
                  fontSize: 13, fontWeight: i === 0 ? 600 : 500,
                  color: i === 0 ? t.text : t.textSec,
                  letterSpacing: -0.1,
                }}
              >
                {tab}
              </div>
            ))}
          </div>

          {/* most used (big dark card) */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 600, marginBottom: 10 }}>
              常用
            </div>
            <div
              style={{
                padding: 18, background: t.text, color: t.bg, borderRadius: 20,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>{sauces[0].name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{sauces[0].sub}</div>
                </div>
                <Icon name="heart-f" size={20} color={t.accent} />
              </div>
              <div style={{ marginTop: 16, height: 8, borderRadius: 100, display: 'flex', overflow: 'hidden' }}>
                {sauces[0].colors.map((c, i) => (
                  <div key={i} style={{ flex: 1, background: c }} />
                ))}
              </div>
              <div
                style={{
                  marginTop: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.65, letterSpacing: 0.3 }}>
                  用过 {sauces[0].used} 次 · {sauces[0].last}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => nav.push('ratio')}
                    style={{
                      padding: '6px 12px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.15)',
                      color: 'inherit',
                      fontSize: 12, fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: t.font,
                    }}
                  >
                    调整
                  </button>
                  <button
                    onClick={() => nav.push('dispense')}
                    style={{
                      padding: '6px 12px', borderRadius: 100,
                      ...pinkBg, color: t.accentText,
                      fontSize: 12, fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: t.font,
                    }}
                  >
                    调一份
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* list */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 600, marginBottom: 10 }}>
              全部
            </div>
            <div
              style={{
                ...glass("card"), border: `0.5px solid ${t.line}`,
                borderRadius: 16, padding: '6px 0',
              }}
            >
              {sauces.slice(1).map((s, i, arr) => (
                <button
                  key={s.name}
                  onClick={() => nav.push('ratio')}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    borderTop: 'none', borderRight: 'none', borderLeft: 'none',
                    borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.lineSoft}`,
                    background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontFamily: t.font, color: t.text,
                  }}
                >
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
                      display: 'flex', flexShrink: 0,
                      border: `0.5px solid ${t.line}`,
                    }}
                  >
                    {s.colors.map((c, ci) => (
                      <div key={ci} style={{ flex: 1, background: c }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>{s.name}</span>
                      {s.mine && (
                        <span
                          style={{
                            fontSize: 9, color: t.accent,
                            padding: '2px 5px',
                            background: t.accentSoft, borderRadius: 4,
                            fontWeight: 600, letterSpacing: 0.3,
                          }}
                        >
                          MY
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                      {s.sub} · 用过 {s.used} 次
                    </div>
                  </div>
                  <Icon name="forward" size={12} color={t.textTer} stroke={2} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <TabBar t={t} active="sauce" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Sauce Library — empty
// ─────────────────────────────────────────────────────────────
export function SauceLibraryEmptyScreen({ t }) {
  const nav = useNav();
  return (
    <PhoneFrame t={t} screen="21 酱料库 · 空状态">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1, overflow: 'hidden', paddingBottom: 110,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ padding: '64px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div
                  style={{
                    fontSize: 12, color: t.textSec, marginBottom: 4,
                    letterSpacing: 0.4, fontWeight: 500,
                  }}
                >
                  MY SAUCES
                </div>
                <div style={{ fontSize: t.h1, fontWeight: t.titleWeight, letterSpacing: -0.6 }}>酱料库</div>
              </div>
              <button
                onClick={() => nav.push('ratio')}
                aria-label="新建"
                style={{
                  width: 40, height: 40, borderRadius: 20, ...pinkBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                }}
              >
                <Icon name="plus" size={18} color={t.accentText} stroke={2.4} />
              </button>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0 40px',
            }}
          >
            {/* glyph */}
            <div style={{ position: 'relative', width: 120, height: 140 }}>
              <div
                style={{
                  position: 'absolute', top: 14, left: 30, right: 30, bottom: 10,
                  ...glass("soft"), borderRadius: 18,
                }}
              />
              <div
                style={{
                  position: 'absolute', top: 0, left: 46, right: 46, height: 22,
                  background: t.text, borderRadius: '4px 4px 12px 12px',
                }}
              />
              <div
                style={{
                  position: 'absolute', top: 30, left: 38, right: 38, bottom: 22,
                  background: 'transparent',
                  border: `1.5px dashed ${t.line}`, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="plus" size={28} color={t.textTer} stroke={1.6} />
              </div>
            </div>
            <div
              style={{
                fontSize: 20, fontWeight: t.titleWeight, letterSpacing: -0.3,
                marginTop: 24, textAlign: 'center',
              }}
            >
              还没有保存的酱料
            </div>
            <div
              style={{
                fontSize: 13, color: t.textSec,
                marginTop: 8, lineHeight: 1.6, textAlign: 'center',
              }}
            >
              试做一份酱, 调到合心意的配比后<br />
              "保存" 一下, 这里就能再找回。
            </div>
            <button
              onClick={() => nav.setTab('ai')}
              style={{
                marginTop: 24, height: 48, padding: '0 22px', borderRadius: 12, border: 'none',
                ...pinkBg, color: t.accentText,
                fontSize: 14, fontWeight: 600, fontFamily: t.font,
                display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer',
              }}
            >
              <Icon name="sparkle" size={16} color={t.accentText} stroke={2} />
              让 AI 推荐配方
            </button>
            <button
              onClick={() => nav.push('ratio')}
              style={{
                marginTop: 14, fontSize: 12, color: t.textSec, fontWeight: 500,
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: t.font,
              }}
            >
              或 浏览 12 种官方配方 ›
            </button>
          </div>
        </div>
        <TabBar t={t} active="sauce" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Sauce Ratio — drag-to-adjust sliders, live taste preview
// ─────────────────────────────────────────────────────────────
export function SauceRatioScreen({ t }) {
  const nav = useNav();
  const [grams, setGrams] = useState(() =>
    Object.fromEntries(YUXIANG_RATIO.map((s) => [s.key, s.grams])),
  );
  const total = Object.values(grams).reduce((a, b) => a + b, 0);

  // taste model — each seasoning contributes to flavor axes
  const tasteModel = {
    soy_light: { 咸: 0.85, 鲜: 0.45 },
    vinegar:   { 酸: 0.95, 鲜: 0.10 },
    sugar:     { 甜: 0.95 },
    cooking_w: { 鲜: 0.35 },
    chili_oil: { 辣: 0.95 },
    starch_w:  {},
  };
  const tastes = ['咸', '甜', '酸', '辣', '鲜'].map((axis) => {
    let v = 0;
    YUXIANG_RATIO.forEach((s) => {
      const w = tasteModel[s.key]?.[axis] || 0;
      v += w * (grams[s.key] / s.max);
    });
    return { label: axis, val: Math.min(1, v) };
  });

  const labelFor = (v) =>
    v < 0.25 ? '清淡' : v < 0.5 ? '适中' : v < 0.75 ? '明显' : '突出';

  return (
    <PhoneFrame t={t} screen="12 配比调节 Ratio">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: t.titleWeight }}>
            配比调节
          </div>
          <button
            onClick={() => nav.openModal('save')}
            aria-label="保存"
            style={{
              width: 32, height: 32, borderRadius: 16,
              ...glass("soft"),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: t.text,
              border: 'none', cursor: 'pointer', fontFamily: t.font,
            }}
          >
            存
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '12px 20px 130px' }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
              正在调整 · 我的鱼香汁
            </div>
            <div
              style={{
                fontSize: 26, fontWeight: t.titleWeight,
                letterSpacing: -0.5, lineHeight: 1.1, marginTop: 4,
              }}
            >
              鱼香汁 · 配比
            </div>
          </div>

          {/* live taste preview */}
          <div
            style={{
              marginTop: 16, padding: 16,
              ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, color: t.textSec, fontWeight: 500, letterSpacing: 0.3 }}>
                预估口感 · 实时
              </div>
              <div style={{ fontSize: 11, color: t.textTer }}>
                总量{' '}
                <span style={{ color: t.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {total} g
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {tastes.map((p) => (
                <div key={p.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: 60, position: 'relative',
                      ...glass("soft"), borderRadius: 6, overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${p.val * 100}%`,
                        ...pinkBg, opacity: 0.85,
                        transition: 'height 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 9, color: t.textTer, marginTop: 1, letterSpacing: 0.2 }}>
                    {labelFor(p.val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* sliders */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 13, color: t.textSec, fontWeight: 500,
                letterSpacing: 0.3, marginBottom: 6,
              }}
            >
              调料用量 · 拖动调整
            </div>
            {YUXIANG_RATIO.map((s) => {
              const seasoning = SEASONINGS.find((x) => x.key === s.key);
              return (
                <SliderRow
                  key={s.key}
                  t={t}
                  s={s}
                  color={seasoning?.color}
                  value={grams[s.key]}
                  onChange={(v) => setGrams((g) => ({ ...g, [s.key]: v }))}
                />
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 20px 32px',
            ...glass("tabbar"),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: `0.5px solid ${t.tabbarLine}`,
            display: 'flex', gap: 10,
          }}
        >
          <button
            onClick={() => nav.push('dispense')}
            style={{
              height: 54, padding: '0 18px', borderRadius: 14,
              border: `0.5px solid ${t.line}`, background: 'transparent',
              color: t.text, fontSize: 14, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            试调 5 g
          </button>
          <button
            onClick={() => nav.push('dispense')}
            style={{
              flex: 1, height: 54, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 16, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            调一份 {total} g
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

function SliderRow({ t, s, color, value, onChange }) {
  const trackRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const updateFromX = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      onChangeRef.current(Math.round(ratio * s.max));
    },
    [s.max],
  );

  const onPointerDown = useCallback(
    (e) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      updateFromX(e.clientX);
    },
    [updateFromX],
  );
  const onPointerMove = useCallback(
    (e) => {
      if (e.buttons !== 1 && e.pressure === 0) return;
      updateFromX(e.clientX);
    },
    [updateFromX],
  );

  const pct = value / s.max;
  return (
    <div style={{ padding: '14px 0', borderBottom: `0.5px solid ${t.lineSoft}` }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 20, height: 20, borderRadius: 4,
              background: color,
              border: color === '#FFFFFF' ? `1px solid ${t.line}` : 'none',
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
        </div>
        <div
          style={{
            fontSize: 14, fontWeight: 600,
            fontVariantNumeric: 'tabular-nums', letterSpacing: -0.2,
          }}
        >
          {value} <span style={{ fontSize: 11, color: t.textSec, fontWeight: 500 }}>g</span>
        </div>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        style={{
          position: 'relative', height: 22, padding: '8px 0',
          touchAction: 'none', cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute', top: 8, left: 0, right: 0,
            height: 6, ...glass("soft"), borderRadius: 3,
          }}
        />
        <div
          style={{
            position: 'absolute', top: 8, left: 0,
            height: 6, width: `${pct * 100}%`,
            ...pinkBg, borderRadius: 3,
          }}
        />
        <div
          style={{
            position: 'absolute', top: 11, left: `${pct * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 22, height: 22, borderRadius: 11,
            background: '#fff',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.08)',
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dispensing — progress ring, current ingredient, ordered list
// ─────────────────────────────────────────────────────────────
export function DispensingScreen({ t }) {
  const nav = useNav();
  return (
    <PhoneFrame t={t} screen="13 出料中 Dispensing">
      <div style={{ height: '100%', background: t.bg, display: 'flex', flexDirection: 'column' }}>
        {/* nav */}
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="close" onClick={nav.pop} />
          <div
            style={{
              flex: 1, textAlign: 'center',
              fontSize: 13, color: t.textSec, fontWeight: 500, letterSpacing: 0.4,
            }}
          >
            正在调配酱料
          </div>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ flex: 1, padding: '8px 20px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
              正在为「鱼香肉丝」调配
            </div>
            <div
              style={{
                fontSize: 30, fontWeight: t.titleWeight,
                letterSpacing: -0.6, lineHeight: 1.1, marginTop: 4,
              }}
            >
              鱼香汁
            </div>
          </div>

          {/* big visual */}
          <div
            style={{
              margin: '20px -4px 0',
              ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 24,
              padding: '32px 20px',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}
          >
            {/* progress ring */}
            <div style={{ position: 'relative', width: 180, height: 180 }}>
              <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="90" cy="90" r="78" fill="none" stroke={t.soft} strokeWidth="6" />
                <circle
                  className="anim-ring-fill"
                  cx="90" cy="90" r="78"
                  fill="none" stroke={t.accent} strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 78}`}
                  strokeDashoffset={2 * Math.PI * 78}
                  strokeLinecap="round"
                />
              </svg>
              <div
                style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 36, fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: -1, lineHeight: 1,
                  }}
                >
                  50
                  <span style={{ fontSize: 16, color: t.textSec, fontWeight: 600 }}>%</span>
                </div>
                <div
                  style={{
                    fontSize: 11, color: t.textSec, marginTop: 6,
                    letterSpacing: 0.4, fontWeight: 500,
                  }}
                >
                  3 / 6 调料
                </div>
              </div>
            </div>

            {/* current */}
            <div
              style={{
                marginTop: 24, padding: '12px 16px',
                ...glass("softer"), borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%',
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: SEASONINGS.find((s) => s.key === 'soy_light').color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="drop" size={18} color="#fff" stroke={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.3, fontWeight: 500 }}>
                  正在注入
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, marginTop: 1 }}>
                  生抽 · 15 g
                </div>
              </div>
              <div className="anim-wave-pulse">
                <Icon name="wave" size={22} color={t.accent} stroke={2} className="wave-shift" />
              </div>
            </div>
          </div>

          {/* steps list */}
          <div style={{ marginTop: 16 }}>
            {YUXIANG_RATIO.map((s, i) => {
              const seasoning = SEASONINGS.find((x) => x.key === s.key);
              const done = i < 2;
              const current = i === 2;
              return (
                <div
                  key={s.key}
                  className="anim-step-in"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0',
                    opacity: i > 2 ? 0.5 : 1,
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <div
                    style={{
                      width: 22, height: 22, borderRadius: 11,
                      background: done ? t.success : current ? t.accent : t.soft,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: done || current ? 'none' : `1px solid ${t.line}`,
                      boxShadow: current ? `0 0 0 4px ${t.accent}22` : 'none',
                    }}
                  >
                    {done && <Icon name="check" size={12} color="#fff" stroke={2.5} />}
                    {current && (
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fff' }} />
                    )}
                  </div>
                  <div
                    style={{
                      width: 12, height: 12, borderRadius: 3,
                      background: seasoning?.color,
                      border: seasoning?.color === '#FFFFFF' ? `1px solid ${t.line}` : 'none',
                    }}
                  />
                  <div style={{ flex: 1, fontSize: 14, fontWeight: current ? 600 : 500 }}>
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 13, color: current ? t.text : t.textSec,
                      fontWeight: current ? 600 : 500,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {s.grams} g
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          {/* cancel */}
          <div style={{ padding: '12px 0 32px' }}>
            <button
              onClick={nav.pop}
              style={{
                width: '100%', height: 50, borderRadius: 14,
                border: `0.5px solid ${t.line}`, background: 'transparent',
                color: t.textSec, fontSize: 14, fontWeight: 500, fontFamily: t.font,
                cursor: 'pointer',
              }}
            >
              取消调配
            </button>
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Save Custom Sauce — bottom-sheet modal
// ─────────────────────────────────────────────────────────────
export function SaveSauceScreen({ t }) {
  const nav = useNav();
  return (
    <PhoneFrame t={t} screen="20 保存酱料 Save">
      {/* ratio screen ghost behind */}
      <div style={{ position: 'absolute', inset: 0, background: t.bg, opacity: 0.5, zIndex: 1 }} />
      <div
        style={{
          position: 'absolute', top: 54, left: 20, right: 20, zIndex: 0,
          opacity: 0.35,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.5 }}>鱼香汁 · 配比</div>
        <div style={{ marginTop: 16, height: 60, ...glass("card"), borderRadius: 12 }} />
        <div style={{ marginTop: 16, height: 200, ...glass("card"), borderRadius: 12 }} />
      </div>
      {/* dimmer — tapping it closes the sheet */}
      <button
        onClick={nav.closeModal}
        aria-label="关闭"
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 5,
          border: 'none', cursor: 'pointer', padding: 0,
        }}
      />

      {/* bottom sheet */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
          background: t.bg,
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: '12px 24px 40px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: t.line }} />
        </div>

        <div style={{ fontSize: 22, fontWeight: t.titleWeight, letterSpacing: -0.4, lineHeight: 1.2 }}>
          保存为我的配方
        </div>
        <div style={{ fontSize: 13, color: t.textSec, marginTop: 4, lineHeight: 1.5 }}>
          这一份酱料的配比会存到我的酱料库, 下次可一键调出。
        </div>

        {/* preview card */}
        <div
          style={{
            marginTop: 16, padding: 14,
            ...glass("card"), border: `0.5px solid ${t.line}`,
            borderRadius: 14,
          }}
        >
          <div style={{ display: 'flex', height: 8, borderRadius: 100, overflow: 'hidden' }}>
            {YUXIANG_RATIO.map((s) => {
              const seasoning = SEASONINGS.find((x) => x.key === s.key);
              return <div key={s.key} style={{ flex: s.grams, background: seasoning?.color }} />;
            })}
          </div>
          <div
            style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 10, fontSize: 10, color: t.textSec,
            }}
          >
            <span>总量 71 g</span>
            <span>6 种调料</span>
            <span>咸甜微辣</span>
          </div>
        </div>

        {/* input */}
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 11, color: t.textSec, fontWeight: 600,
              letterSpacing: 0.4, marginBottom: 6,
            }}
          >
            配方名
          </div>
          <div
            style={{
              height: 48, borderRadius: 12, ...glass("card"),
              border: `1.5px solid ${t.accent}`,
              padding: '0 14px',
              display: 'flex', alignItems: 'center',
              fontSize: 15, fontWeight: 500,
            }}
          >
            老陈版鱼香汁
            <span
              style={{
                width: 2, height: 18, ...pinkBg,
                marginLeft: 2, animation: 'caretBlink 1s steps(2) infinite',
              }}
            />
          </div>
        </div>

        {/* tags */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: 11, color: t.textSec, fontWeight: 600,
              letterSpacing: 0.4, marginBottom: 8,
            }}
          >
            标签 (可选)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { l: '咸甜', on: true },
              { l: '微辣', on: true },
              { l: '下饭', on: true },
              { l: '酸甜' }, { l: '麻辣' }, { l: '清淡' }, { l: '蘸料' },
            ].map((c) => (
              <div
                key={c.l}
                style={{
                  padding: '6px 12px', borderRadius: 100,
                  background: c.on ? t.text : 'transparent',
                  color: c.on ? t.bg : t.text,
                  border: c.on ? 'none' : `0.5px solid ${t.line}`,
                  fontSize: 12, fontWeight: 500,
                }}
              >
                {c.on ? '✓ ' : ''}{c.l}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
          <button
            onClick={nav.closeModal}
            style={{
              flex: 1, height: 52, borderRadius: 14,
              border: `0.5px solid ${t.line}`, background: 'transparent',
              color: t.text, fontSize: 15, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            取消
          </button>
          <button
            onClick={() => { nav.closeModal(); nav.jump('library'); }}
            style={{
              flex: 1.4, height: 52, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            保存到酱料库
          </button>
        </div>
      </div>

      <HomeIndicator t={t} />
    </PhoneFrame>
  );
}
