// Personal area: Me, Device, History, Settings + Shopping list utility.

import { Children } from 'react';
import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { TabBar } from '../components/TabBar.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { MachineIllustration } from '../components/MachineIllustration.jsx';
import { Icon } from '../lib/Icon.jsx';
import { SEASONINGS } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { useRecipes } from "../lib/recipes.jsx";
import { glass, pinkBg } from '../lib/theme.js';

// ─────────────────────────────────────────────────────────────
// Me — editorial profile: hero greeting + monthly highlight +
//       bottle row + 2×2 action grid + recents
// ─────────────────────────────────────────────────────────────
export function MeScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  const avgRemain = Math.round(
    SEASONINGS.reduce((a, b) => a + b.remain, 0) / SEASONINGS.length
  );
  const lowCount = SEASONINGS.filter((s) => s.remain < 40).length;

  return (
    <PhoneFrame t={t} screen="14 我的 Me">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 120 }}>

          {/* hero greeting */}
          <div style={{ padding: '64px 24px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: t.textSec, letterSpacing: 0.6, fontWeight: 500, marginBottom: 6 }}>
                  晚上好
                </div>
                <div style={{ fontSize: 30, fontWeight: t.titleWeight, letterSpacing: -0.6, lineHeight: 1.05 }}>
                  陈先生
                </div>
                <div style={{ fontSize: 12, color: t.textTer, marginTop: 6, letterSpacing: 0.2 }}>
                  家厨 · 已使用 142 天 · 第 86 次烹饪
                </div>
              </div>
              <button
                onClick={() => nav.push('settings')}
                aria-label="设置"
                style={{
                  width: 64, height: 64, borderRadius: 32, flexShrink: 0,
                  background: `linear-gradient(135deg, #FFB4CD 0%, ${t.accent} 100%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: t.accentText,
                  fontSize: 26, fontWeight: 700, letterSpacing: -0.5,
                  boxShadow: `0 8px 24px ${t.accent}33`,
                  position: 'relative',
                  border: 'none', cursor: 'pointer', padding: 0, fontFamily: t.font,
                }}
              >
                <span>陈</span>
                <div
                  style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 22, height: 22, borderRadius: 11, background: '#FFFFFF',
                    border: `1px solid ${t.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon name="tune" size={11} color={t.text} stroke={2} />
                </div>
              </button>
            </div>
          </div>

          {/* monthly highlight */}
          <div style={{ padding: '24px 24px 0' }}>
            <div
              style={{
                background: t.text, color: '#FFFFFF',
                borderRadius: 24, padding: '20px 22px 22px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 160, height: 160, borderRadius: '50%',
                  background: `radial-gradient(circle, ${t.accent}66 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  fontSize: 11, opacity: 0.6, letterSpacing: 0.8, fontWeight: 600,
                  position: 'relative',
                }}
              >
                2026 · 5 月
              </div>
              <div
                style={{
                  marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 8,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: 56, fontWeight: 700, letterSpacing: -2,
                    lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  23
                </div>
                <div style={{ fontSize: 14, opacity: 0.75 }}>道菜 · 共 8h 32m</div>
              </div>
              <div
                style={{
                  marginTop: 18, display: 'flex', gap: 14,
                  paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.12)',
                  position: 'relative',
                }}
              >
                <SubStat n="86" lab="总烹饪" />
                <SubStat n="24" lab="收藏菜谱" />
                <SubStat n="11" lab="我的配方" />
              </div>
            </div>
          </div>

          {/* seasoning inventory — bottle row */}
          <div style={{ padding: '28px 24px 0' }}>
            <div
              style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 17, fontWeight: t.titleWeight, letterSpacing: -0.3 }}>调料库存</div>
                <div style={{ fontSize: 11, color: t.textTer, marginTop: 3, letterSpacing: 0.2 }}>
                  平均 {avgRemain}%
                  {lowCount > 0 && (
                    <span style={{ color: t.accent, fontWeight: 600 }}> · {lowCount} 种偏少</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => nav.push('shopping')}
                style={{
                  padding: '6px 12px', borderRadius: 100,
                  background: t.accentSoft, color: t.accent,
                  fontSize: 11, fontWeight: 600, letterSpacing: 0.2,
                  border: 'none', cursor: 'pointer', fontFamily: t.font,
                }}
              >
                购买补充 ›
              </button>
            </div>
            <div
              style={{
                display: 'flex', gap: 8, alignItems: 'flex-end',
                padding: '20px 12px 14px',
                ...glass("softer"), borderRadius: 20,
              }}
            >
              {SEASONINGS.map((s) => <Bottle key={s.key} t={t} s={s} />)}
            </div>
          </div>

          {/* 2×2 quick actions */}
          <div style={{ padding: '20px 24px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <ActionCard t={t} icon="machine" title="我的设备" sub="SAUCEIN S1 · 已连接" onClick={() => nav.push('device')}   />
              <ActionCard t={t} icon="drop"    title="我的配方" sub="11 条收藏"          onClick={() => nav.setTab('sauce')}  />
              <ActionCard t={t} icon="clock"   title="烹饪历史" sub="86 次记录"          onClick={() => nav.push('history')}  />
              <ActionCard t={t} icon="tune"    title="偏好设置" sub="少辣 · 少盐"        onClick={() => nav.push('settings')} />
            </div>
          </div>

          {/* recent dishes — 4 across */}
          <div style={{ padding: '24px 24px 0' }}>
            <div
              style={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: t.titleWeight, letterSpacing: -0.3 }}>最近做过</div>
              <button
                onClick={() => nav.push('history')}
                style={{
                  fontSize: 12, color: t.textSec,
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: t.font,
                }}
              >
                全部 86 次 ›
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {recipes.slice(0, 4).map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => nav.push('detail', { recipeId: r.id })}
                  style={{
                    flex: 1, minWidth: 0, padding: 0,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: t.font, color: t.text,
                  }}
                >
                  <FoodThumb r={r} style={{ width: '100%', height: 78, borderRadius: 12 }} />
                  <div
                    style={{
                      fontSize: 12, fontWeight: 600, marginTop: 7, letterSpacing: -0.1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10, color: t.textTer, marginTop: 2 }}>
                    {['今天', '昨天', '3 天前', '上周'][i]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* version badge */}
          <div style={{ padding: '28px 24px 0', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex', padding: '8px 16px', borderRadius: 100,
                ...glass("soft"),
                fontSize: 12, color: t.textSec, fontWeight: 500,
                gap: 6, alignItems: 'center',
              }}
            >
              <Icon name="machine" size={12} color={t.textSec} stroke={1.8} />
              SAUCEIN v2.4.1
            </div>
          </div>

        </div>
        <TabBar t={t} active="me" />
      </div>
    </PhoneFrame>
  );
}

// Bottle: small rounded rectangle with fill rising from the bottom.
// White/cream fills get a thin top border so they don't merge with the
// bottle body. Low-stock (<40%) gets a pink inset ring.
function Bottle({ t, s }) {
  const low = s.remain < 40;
  const palePour = ['#FFFFFF', '#F2EAD8', '#EEEDE6'].includes(s.color);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: '100%', height: 48,
          background: '#FFFFFF',
          borderRadius: '6px 6px 4px 4px',
          border: '1px solid rgba(0,0,0,0.06)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: `${s.remain}%`,
            background: s.color, opacity: 0.9,
            borderTop: palePour ? '1px solid rgba(0,0,0,0.08)' : 'none',
          }}
        />
        {low && (
          <div
            style={{
              position: 'absolute', inset: 0,
              borderRadius: '6px 6px 4px 4px',
              boxShadow: `inset 0 0 0 1.5px ${t.accent}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      <div
        style={{
          fontSize: 9, color: low ? t.accent : t.textTer,
          fontWeight: low ? 700 : 500,
          fontVariantNumeric: 'tabular-nums', letterSpacing: 0.1,
        }}
      >
        {s.remain}
      </div>
    </div>
  );
}

function ActionCard({ t, icon, title, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...glass("card"), borderRadius: 16, border: `0.5px solid ${t.line}`,
        padding: '14px 14px 12px',
        display: 'flex', flexDirection: 'column', gap: 18,
        minHeight: 92,
        textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
        fontFamily: t.font, color: t.text,
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: 10,
          ...glass("softer"),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={17} color={t.text} stroke={1.7} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{title}</div>
        <div
          style={{
            fontSize: 11, color: t.textSec, marginTop: 3, letterSpacing: 0.1,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}

function SubStat({ n, lab }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 20, fontWeight: 700, letterSpacing: -0.4,
          fontVariantNumeric: 'tabular-nums', color: '#fff',
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1, color: '#fff' }}>{lab}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Device Detail
// ─────────────────────────────────────────────────────────────
export function DeviceDetailScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="15 设备 Device">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: t.titleWeight }}>
            我的调味机
          </div>
          <CircleButton t={t} icon="tune" onClick={() => nav.push('settings')} />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 32px' }}>
          {/* device card */}
          <div
            style={{
              padding: 20, ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 16,
            }}
          >
            <MachineIllustration t={t} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: t.success }} />
                <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
                  已连接 · WiFi
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>SAUCEIN S1</div>
              <div style={{ fontSize: 11, color: t.textSec, marginTop: 4 }}>
                S/N: SN-2024-08772<br />
                固件 v2.4.1 · 2025/05/12
              </div>
            </div>
          </div>

          {/* slot grid */}
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2 }}>
                调料槽 · 10 槽
              </div>
              <div style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>批量补充 ›</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SEASONINGS.map((s, i) => (
                <div
                  key={s.key}
                  style={{
                    ...glass("card"), border: `0.5px solid ${t.line}`,
                    borderRadius: 12, padding: 12,
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 28, height: 44, borderRadius: 4,
                      ...glass("softer"),
                      position: 'relative', overflow: 'hidden',
                      border: `0.5px solid ${t.line}`,
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${s.remain}%`,
                        background: s.color, opacity: 0.9,
                        borderTop: s.color === '#FFFFFF' ? `0.5px solid ${t.line}` : 'none',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: t.textSec, letterSpacing: 0.3 }}>槽 {i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.1, marginTop: 1 }}>
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: s.remain < 40 ? t.accent : t.textSec,
                        fontWeight: 600, marginTop: 2,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.remain}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* actions */}
          <div
            style={{
              marginTop: 22, ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 16, padding: '4px 0',
            }}
          >
            {[
              { l: '清洁循环', s: '建议每周一次', i: 'wave'  },
              { l: '更换调料', s: '自定义槽位',  i: 'drop'  },
              { l: '校准出量', s: '上次 2025/04', i: 'tune' },
              { l: '检查固件', s: '已是最新',    i: 'check' },
            ].map((it, i, arr) => (
              <div
                key={it.l}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.lineSoft}`,
                }}
              >
                <div
                  style={{
                    width: 30, height: 30, borderRadius: 8, ...glass("soft"),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Icon name={it.i} size={16} color={t.text} stroke={1.8} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{it.l}</span>
                <span style={{ fontSize: 12, color: t.textSec, marginRight: 6 }}>{it.s}</span>
                <Icon name="forward" size={12} color={t.textTer} stroke={2} />
              </div>
            ))}
          </div>

          <button
            onClick={() => nav.setTab('home')}
            style={{
              width: '100%',
              marginTop: 18, padding: '14px 16px', textAlign: 'center',
              fontSize: 13, color: t.accent, fontWeight: 500,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: t.font,
            }}
          >
            从账户解绑此设备
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// History Detail — timeline of one cooking session
// ─────────────────────────────────────────────────────────────
export function HistoryDetailScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  const r = recipes.find((x) => x.id === 'yuxiang');
  const events = [
    { time: '19:24', label: '开始烹饪',                  kind: 'start' },
    { time: '19:25', label: '调一份鱼香汁 · 71 g',       kind: 'sauce', meta: '6 种调料' },
    { time: '19:27', label: '腌制肉丝 · 10 min',          kind: 'step'  },
    { time: '19:38', label: '加热中火',                  kind: 'step'  },
    { time: '19:40', label: '滑炒肉丝 · 1:30',            kind: 'step'  },
    { time: '19:42', label: '下配料翻炒 · 1:00',          kind: 'step'  },
    { time: '19:44', label: '倒入鱼香汁勾芡',            kind: 'sauce' },
    { time: '19:45', label: '完成',                      kind: 'done', meta: '总耗时 21 分钟' },
  ];
  return (
    <PhoneFrame t={t} screen="16 烹饪记录 History">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: t.titleWeight }}>
            烹饪记录
          </div>
          <CircleButton t={t} icon="forward" />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 32px' }}>
          {/* dish + meta */}
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <FoodThumb r={r} style={{ width: 96, height: 96, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4 }}>昨日 19:24</div>
              <div style={{ fontSize: 22, fontWeight: t.titleWeight, letterSpacing: -0.4, marginTop: 2 }}>
                {r.name}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="star" size={12} color={i <= 4 ? t.accent : t.line} stroke={2} />
                ))}
                <span style={{ fontSize: 11, color: t.textSec, marginLeft: 4 }}>4.0 · 正好</span>
              </div>
            </div>
          </div>

          {/* stats row */}
          <div
            style={{
              marginTop: 16, display: 'flex',
              ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 14, padding: '14px 0',
            }}
          >
            <MiniStat t={t} v="21"   l="分钟" />
            <Divider t={t} />
            <MiniStat t={t} v="71g"  l="酱料" />
            <Divider t={t} />
            <MiniStat t={t} v="6"    l="调料" />
            <Divider t={t} />
            <MiniStat t={t} v="-15%" l="比平均" />
          </div>

          {/* timeline */}
          <div style={{ marginTop: 22 }}>
            <div
              style={{
                fontSize: 11, color: t.textSec, letterSpacing: 0.4,
                fontWeight: 600, marginBottom: 12,
              }}
            >
              时间轴
            </div>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              <div
                style={{
                  position: 'absolute', left: 7, top: 4, bottom: 4,
                  width: 1, background: t.line,
                }}
              />
              {events.map((e, i) => (
                <div key={i} style={{ position: 'relative', padding: '8px 0' }}>
                  <div
                    style={{
                      position: 'absolute', left: -24, top: 14,
                      width: 14, height: 14, borderRadius: 7,
                      background:
                        e.kind === 'done'  ? t.success :
                        e.kind === 'sauce' ? t.accent  :
                        t.bg,
                      border:
                        e.kind === 'step' || e.kind === 'start'
                          ? `2px solid ${t.textTer}`
                          : 'none',
                      boxShadow: `0 0 0 3px ${t.bg}`,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11, color: t.textSec,
                      fontVariantNumeric: 'tabular-nums', letterSpacing: 0.3,
                    }}
                  >
                    {e.time}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, marginTop: 1 }}>{e.label}</div>
                  {e.meta && (
                    <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>{e.meta}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* feedback */}
          <div
            style={{
              marginTop: 20, padding: 14, ...glass("card"),
              border: `0.5px solid ${t.line}`, borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 600 }}>
              当时的评价
            </div>
            <div style={{ fontSize: 14, color: t.text, lineHeight: 1.55, marginTop: 6 }}>
              "正好, 但比上次香醋多放了一点 — 我太太说太酸。下次减 2 g。"
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 20px 32px',
            ...glass("tabbar"),
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: `0.5px solid ${t.tabbarLine}`,
            display: 'flex', gap: 10,
          }}
        >
          <button
            style={{
              flex: 1, height: 50, borderRadius: 14, border: `0.5px solid ${t.line}`,
              background: 'transparent', color: t.text,
              fontSize: 14, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            分享
          </button>
          <button
            onClick={() => nav.push('detail', { recipeId: r.id })}
            style={{
              flex: 1.4, height: 50, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 14, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            再做一次
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

function MiniStat({ t, v, l }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div
        style={{
          fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {v}
      </div>
      <div
        style={{
          fontSize: 10, color: t.textSec, marginTop: 2,
          letterSpacing: 0.3, fontWeight: 500,
        }}
      >
        {l}
      </div>
    </div>
  );
}
function Divider({ t }) {
  return <div style={{ width: 1, alignSelf: 'center', height: 26, background: t.line }} />;
}

// ─────────────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────────────
export function SettingsScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="17 设置 Settings">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: t.titleWeight }}>
            设置
          </div>
          <div style={{ width: 32 }} />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0 32px' }}>
          <SettingGroup t={t} label="账户">
            <SettingRow
              t={t}
              l="陈先生"
              sub="hi@chen.app"
              lead={
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    background: `linear-gradient(135deg, ${t.accent}, ${t.accent}80)`,
                    color: t.accentText,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}
                >
                  陈
                </div>
              }
            />
          </SettingGroup>

          <SettingGroup t={t} label="口味偏好">
            <SettingRow t={t} l="口味基线"   sub="少辣 · 少盐 · 偏甜" icon="tune"  />
            <SettingRow t={t} l="避开食材"   sub="芫荽 · 茴香 · 内脏" icon="close" />
            <SettingRow t={t} l="过敏与忌口" sub="未设置"             icon="heart" />
          </SettingGroup>

          <SettingGroup t={t} label="调味机">
            <SettingRow t={t} l="我的设备"    sub="SAUCEIN S1 · 已连接" icon="machine" onClick={() => nav.push('device')} />
            <SettingRow t={t} l="自动清洁"    toggle={true}             icon="wave"    />
            <SettingRow t={t} l="出料量校准"  sub="上次 2025/04"        icon="drop"    />
          </SettingGroup>

          <SettingGroup t={t} label="通知">
            <SettingRow t={t} l="调料余量提醒" toggle={true}  icon="flame"   />
            <SettingRow t={t} l="AI 推荐菜单"  toggle={true}  icon="sparkle" />
            <SettingRow t={t} l="烹饪计时提醒" toggle={false} icon="clock"   />
          </SettingGroup>

          <SettingGroup t={t} label="关于">
            <SettingRow t={t} l="服务条款" icon="book" />
            <SettingRow t={t} l="隐私政策" icon="book" />
            <SettingRow t={t} l="版本"      sub="v2.4.1 (2026/05)" />
          </SettingGroup>

          <div style={{ padding: '16px 20px 0', textAlign: 'center' }}>
            <button
              onClick={() => nav.jump('welcome')}
              style={{
                fontSize: 14, color: t.accent, fontWeight: 500,
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: t.font,
              }}
            >
              退出登录
            </button>
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

function SettingGroup({ t, label, children }) {
  const arr = Children.toArray(children);
  return (
    <div style={{ padding: '16px 20px 0' }}>
      <div
        style={{
          fontSize: 11, color: t.textSec, letterSpacing: 0.4,
          fontWeight: 600, marginBottom: 8, paddingLeft: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...glass("card"), border: `0.5px solid ${t.line}`,
          borderRadius: 14, padding: '4px 0',
        }}
      >
        {arr.map((c, i) => (
          <div
            key={i}
            style={{
              borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.lineSoft}`,
            }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingRow({ t, l, sub, icon, lead, toggle, onClick }) {
  const Wrap = onClick ? 'button' : 'div';
  return (
    <Wrap
      onClick={onClick}
      style={{
        width: onClick ? '100%' : undefined,
        display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12,
        background: 'transparent', border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left', fontFamily: t.font, color: t.text,
      }}
    >
      {lead
        ? lead
        : icon && (
            <div
              style={{
                width: 30, height: 30, borderRadius: 8, ...glass("soft"),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name={icon} size={16} color={t.text} stroke={1.8} />
            </div>
          )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{l}</div>
        {sub && <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>{sub}</div>}
      </div>
      {toggle !== undefined ? (
        <div
          style={{
            width: 42, height: 26, borderRadius: 13,
            background: toggle ? t.accent : t.line,
            padding: 2, transition: 'background 0.2s',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 22, height: 22, borderRadius: 11, background: '#fff',
              marginLeft: toggle ? 16 : 0,
              transition: 'margin 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
            }}
          />
        </div>
      ) : sub === undefined ? null : (
        <Icon name="forward" size={12} color={t.textTer} stroke={2} />
      )}
    </Wrap>
  );
}

// ─────────────────────────────────────────────────────────────
// Shopping List
// ─────────────────────────────────────────────────────────────
export function ShoppingListScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  const items = {
    生鲜: [
      { name: '猪里脊',   qty: '250 g', have: false, for: '鱼香肉丝' },
      { name: '青笋',     qty: '80 g',  have: false, for: '鱼香肉丝' },
      { name: '木耳 (干)', qty: '15 g',  have: true,  for: '鱼香肉丝' },
      { name: '柠檬',     qty: '2 个',  have: false, for: '酸辣柠檬虾' },
      { name: '虾仁',     qty: '300 g', have: false, for: '酸辣柠檬虾' },
    ],
    蔬菜: [
      { name: '蒜苔', qty: '一把', have: false, for: '蒜苔炒肉末' },
      { name: '黄瓜', qty: '2 根', have: true,  for: '皮蛋拌黄瓜' },
    ],
  };
  return (
    <PhoneFrame t={t} screen="19 购物清单 Shopping">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: t.titleWeight }}>
            购物清单
          </div>
          <CircleButton t={t} icon="send" />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 120px' }}>
          <div
            style={{
              fontSize: 26, fontWeight: t.titleWeight,
              letterSpacing: -0.5, lineHeight: 1.1, marginTop: 4,
            }}
          >
            本周菜单缺货
          </div>
          <div style={{ fontSize: 13, color: t.textSec, marginTop: 6, lineHeight: 1.55 }}>
            为 4 道菜推荐, 5 件未购买 · 调料机库存已自动核对。
          </div>

          {/* progress */}
          <div
            style={{
              marginTop: 16, padding: 14, ...glass("card"),
              border: `0.5px solid ${t.line}`, borderRadius: 14,
            }}
          >
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>购买进度</div>
              <div
                style={{
                  fontSize: 12, color: t.textSec, fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                2 / 7
              </div>
            </div>
            <div style={{ height: 6, ...glass("soft"), borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '28%', background: t.accent }} />
            </div>
          </div>

          {/* grouped items */}
          {Object.entries(items).map(([group, list]) => (
            <div key={group} style={{ marginTop: 22 }}>
              <div
                style={{
                  fontSize: 11, color: t.textSec, letterSpacing: 0.4,
                  fontWeight: 600, marginBottom: 8,
                }}
              >
                {group}
              </div>
              <div
                style={{
                  ...glass("card"), border: `0.5px solid ${t.line}`,
                  borderRadius: 14, padding: '4px 0',
                }}
              >
                {list.map((it, i, arr) => (
                  <div
                    key={it.name}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.lineSoft}`,
                    }}
                  >
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: it.have ? t.success : 'transparent',
                        border: it.have ? 'none' : `1.5px solid ${t.line}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {it.have && <Icon name="check" size={12} color="#fff" stroke={2.8} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14, fontWeight: 500,
                          textDecoration: it.have ? 'line-through' : 'none',
                          color: it.have ? t.textTer : t.text,
                        }}
                      >
                        {it.name}
                      </div>
                      <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                        {it.qty} · 用于 {it.for}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* sauce stock note */}
          <div
            style={{
              marginTop: 16, padding: 14,
              background: t.accentSoft, borderRadius: 14,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: 11, ...pinkBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="drop" size={12} color={t.accentText} stroke={2.4} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.accent }}>辣椒油剩 35%</div>
              <div style={{ fontSize: 12, color: t.text, marginTop: 2, lineHeight: 1.5 }}>
                本周菜单会用掉约 28g, 建议补一瓶。
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 20px 32px',
            ...glass("tabbar"),
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: `0.5px solid ${t.tabbarLine}`,
            display: 'flex', gap: 10,
          }}
        >
          <button
            style={{
              flex: 1, height: 52, borderRadius: 14, border: 'none',
              background: t.text, color: t.bg,
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            导出到备忘录
          </button>
          <button
            style={{
              flex: 1.4, height: 52, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
              cursor: 'pointer',
            }}
          >
            一键下单
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}
