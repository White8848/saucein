// Home in three states: normal, low stock, offline.

import { PhoneFrame } from '../components/PhoneFrame.jsx';
import { TabBar } from '../components/TabBar.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { MachineIllustration } from '../components/MachineIllustration.jsx';
import { Icon } from '../lib/Icon.jsx';
import { SEASONINGS } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { useRecipes } from "../lib/recipes.jsx";
import { glass, pinkBg } from '../lib/theme.js';

// ─────────────────────────────────────────────────────────────
// Home — normal
// ─────────────────────────────────────────────────────────────
export function HomeScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="04 首页 Home">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
          {/* greeting */}
          <div style={{ padding: '64px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: t.textSec, marginBottom: 2 }}>下午好,  陈先生</div>
                <div style={{ fontSize: t.h1, fontWeight: t.titleWeight, letterSpacing: -0.6, lineHeight: 1.1 }}>
                  今天想做<br />点什么 ?
                </div>
              </div>
              <button
                onClick={() => nav.push('search')}
                aria-label="搜索"
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  ...glass("soft"), border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="search" size={18} color={t.text} stroke={1.8} />
              </button>
            </div>
          </div>

          {/* device hero */}
          <div style={{ padding: '24px 20px 0' }}>
            <div
              style={{
                ...glass("card"), borderRadius: 24,
                border: `0.5px solid ${t.line}`,
                padding: 20,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: t.success }} />
                <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.3, fontWeight: 500 }}>
                  已连接 · SAUCEIN S1
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: t.titleWeight, letterSpacing: -0.3, marginBottom: 14 }}>
                调味机已就绪
              </div>
              {/* mini machine + stock */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16, height: 84 }}>
                <MachineIllustration t={t} />
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <div style={{ fontSize: 12, color: t.textSec, marginBottom: 8 }}>调料库存</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {SEASONINGS.slice(0, 10).map((s) => (
                      <div
                        key={s.key}
                        style={{
                          flex: 1, height: 28, borderRadius: 3,
                          ...glass("soft"), position: 'relative', overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: `${s.remain}%`,
                            background: s.color, opacity: 0.85,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: t.textTer, marginTop: 6 }}>10 种 · 平均余量 70%</div>
                </div>
              </div>
              {/* CTA row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => nav.push('recommend')}
                  style={{
                    flex: 1, height: 44, borderRadius: 12, border: 'none',
                    ...pinkBg, color: t.accentText,
                    fontSize: 14, fontWeight: 600, fontFamily: t.font,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="sparkle" size={16} color={t.accentText} stroke={2} />
                  让 AI 推荐
                </button>
                <button
                  onClick={() => nav.push('device')}
                  style={{
                    height: 44, padding: '0 16px', borderRadius: 12,
                    border: `0.5px solid ${t.line}`, background: 'transparent',
                    color: t.text, fontSize: 14, fontWeight: 500, fontFamily: t.font,
                    display: 'flex', alignItems: 'center', gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="machine" size={16} color={t.text} stroke={1.6} />
                  设备
                </button>
              </div>
            </div>
          </div>

          {/* quick actions */}
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <QuickCard t={t} title="开始烹饪"   sub="选择菜谱并由 AI 引导" icon="flame" tone="accent" onClick={() => nav.push('recommend')} />
              <QuickCard t={t} title="一键调酱"   sub="6 种常用酱料模板"     icon="drop"                onClick={() => nav.setTab('sauce')}    />
              <QuickCard t={t} title="食谱库"     sub="248 道收录"           icon="book"                onClick={() => nav.setTab('book')}     />
              <QuickCard t={t} title="自定义配方" sub="保存我的酱汁"         icon="tune"                onClick={() => nav.push('ratio')}      />
            </div>
          </div>

          {/* recent */}
          <div style={{ padding: '24px 20px 0' }}>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2 }}>最近做过</div>
              <button
                onClick={() => nav.setTab('book')}
                style={{
                  fontSize: 12, color: t.textSec,
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: t.font,
                }}
              >
                全部
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
              {recipes.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => nav.push('detail')}
                  style={{
                    flex: 1, padding: 0,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: t.font, color: t.text,
                  }}
                >
                  <FoodThumb r={r} style={{ width: '100%', height: 96, borderRadius: 12 }} />
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8, letterSpacing: -0.1 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                    {r.time} 分钟 · 难度 {'·'.repeat(r.difficulty)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <TabBar t={t} active="home" />
      </div>
    </PhoneFrame>
  );
}

export function QuickCard({ t, title, sub, icon, tone, onClick }) {
  const isAccent = tone === 'accent';
  return (
    <button
      onClick={onClick}
      style={{
        background: isAccent ? t.accent : t.card,
        color: isAccent ? t.accentText : t.text,
        borderRadius: 16, padding: 14,
        border: isAccent ? 'none' : `0.5px solid ${t.line}`,
        height: 96,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        textAlign: 'left', cursor: onClick ? 'pointer' : 'default',
        fontFamily: t.font,
      }}
    >
      <div
        style={{
          width: 32, height: 32, borderRadius: 16,
          background: isAccent ? 'rgba(255,255,255,0.18)' : t.soft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} color={isAccent ? t.accentText : t.text} stroke={1.8} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{title}</div>
        <div
          style={{
            fontSize: 11,
            opacity: isAccent ? 0.85 : 1,
            color: isAccent ? t.accentText : t.textSec,
            marginTop: 2,
          }}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Home — low seasoning banner
// ─────────────────────────────────────────────────────────────
export function HomeLowStockScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="22 首页 · 缺料提醒">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
          {/* greeting */}
          <div style={{ padding: '64px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: t.textSec, marginBottom: 2 }}>下午好,  陈先生</div>
                <div style={{ fontSize: t.h1, fontWeight: t.titleWeight, letterSpacing: -0.6, lineHeight: 1.1 }}>
                  今天想做<br />点什么 ?
                </div>
              </div>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  ...glass("soft"),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Icon name="search" size={18} color={t.text} stroke={1.8} />
                <div
                  style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 8, height: 8, borderRadius: 4,
                    ...pinkBg,
                    border: `1.5px solid ${t.bg}`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* low stock banner */}
          <div style={{ padding: '20px 20px 0' }}>
            <div
              className="anim-bubble-in"
              style={{
                ...pinkBg, color: t.accentText, borderRadius: 16,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name="drop" size={18} color={t.accentText} stroke={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>辣椒油 + 香醋快用完</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>余量 35% / 42% · 建议本周补充</div>
              </div>
              <button
                onClick={() => nav.push('shopping')}
                style={{
                  padding: '6px 12px', borderRadius: 100,
                  background: '#fff', color: t.accent,
                  fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', fontFamily: t.font,
                }}
              >
                购买
              </button>
            </div>
          </div>

          {/* device hero (compact) */}
          <div style={{ padding: '14px 20px 0' }}>
            <div
              style={{
                ...glass("card"), borderRadius: 20,
                border: `0.5px solid ${t.line}`,
                padding: 18,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: t.success }} />
                <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.3, fontWeight: 500 }}>
                  已连接 · SAUCEIN S1
                </div>
              </div>
              <div style={{ fontSize: 19, fontWeight: t.titleWeight, letterSpacing: -0.3, marginBottom: 12 }}>
                调味机已就绪
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {SEASONINGS.slice(0, 10).map((s) => {
                  const low = s.remain < 40;
                  return (
                    <div
                      key={s.key}
                      style={{
                        flex: 1, height: 28, borderRadius: 3,
                        ...glass("soft"),
                        position: 'relative', overflow: 'hidden',
                        outline: low ? `1.5px solid ${t.accent}` : 'none',
                        outlineOffset: low ? 1 : 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          height: `${s.remain}%`,
                          background: s.color, opacity: 0.85,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: t.textSec, marginTop: 8 }}>
                10 种 · <span style={{ color: t.accent, fontWeight: 600 }}>2 种偏少</span>
              </div>
            </div>
          </div>

          {/* AI suggestion */}
          <div style={{ padding: '14px 20px 0' }}>
            <div className="anim-bubble-in" style={{ animationDelay: '0.2s' }}>
              <div
                style={{
                  ...glass("card"), borderRadius: 16,
                  border: `0.5px solid ${t.line}`,
                  padding: 14,
                  display: 'flex', gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 16, ...pinkBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="sparkle" size={16} color={t.accentText} stroke={2.2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: t.accent, fontWeight: 600, letterSpacing: 0.3 }}>陈师傅</div>
                  <div style={{ fontSize: 13, color: t.text, lineHeight: 1.55, marginTop: 2 }}>
                    辣椒油不够做完整的鱼香肉丝。<br />
                    要不试试更清淡的"
                    <span style={{ fontWeight: 600 }}>蒜苔炒肉末</span>" ? 你现有调料够。
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* recent */}
          <div style={{ padding: '24px 20px 0' }}>
            <div
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2 }}>最近做过</div>
              <button
                onClick={() => nav.setTab('book')}
                style={{
                  fontSize: 12, color: t.textSec,
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: t.font,
                }}
              >
                全部
              </button>
            </div>
            <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
              {recipes.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  onClick={() => nav.push('detail')}
                  style={{
                    flex: 1, padding: 0,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left', fontFamily: t.font, color: t.text,
                  }}
                >
                  <FoodThumb r={r} style={{ width: '100%', height: 96, borderRadius: 12 }} />
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 8, letterSpacing: -0.1 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>{r.time} 分钟</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <TabBar t={t} active="home" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Home — device offline
// ─────────────────────────────────────────────────────────────
export function HomeOfflineScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="23 首页 · 设备离线">
      <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
          <div style={{ padding: '64px 20px 0' }}>
            <div>
              <div style={{ fontSize: 13, color: t.textSec, marginBottom: 2 }}>下午好,  陈先生</div>
              <div style={{ fontSize: t.h1, fontWeight: t.titleWeight, letterSpacing: -0.6, lineHeight: 1.1 }}>
                今天想做<br />点什么 ?
              </div>
            </div>
          </div>

          {/* offline card */}
          <div style={{ padding: '24px 20px 0' }}>
            <div
              style={{
                ...glass("card"), borderRadius: 24,
                border: `0.5px solid ${t.line}`,
                padding: 22,
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: t.textTer }} />
                <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.3, fontWeight: 500 }}>
                  连接断开 · SAUCEIN S1
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: t.titleWeight, letterSpacing: -0.3, marginBottom: 4 }}>
                调味机离线
              </div>
              <div style={{ fontSize: 13, color: t.textSec, lineHeight: 1.55 }}>
                确认机器已通电, 并和手机连入同一 WiFi。<br />
                食谱浏览不受影响。
              </div>

              <div
                style={{
                  display: 'flex', alignItems: 'flex-end', gap: 12,
                  marginTop: 18, marginBottom: 16, height: 84,
                  filter: 'grayscale(1)', opacity: 0.6,
                }}
              >
                <MachineIllustration t={t} />
                <div style={{ flex: 1, paddingBottom: 6 }}>
                  <div style={{ fontSize: 12, color: t.textSec, marginBottom: 8 }}>调料库存 · 上次同步</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {SEASONINGS.slice(0, 10).map((s) => (
                      <div
                        key={s.key}
                        style={{
                          flex: 1, height: 28, borderRadius: 3,
                          ...glass("soft"),
                          position: 'relative', overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            height: `${s.remain}%`,
                            background: s.color, opacity: 0.6,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: t.textTer, marginTop: 6 }}>2 小时前 同步</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => nav.jump('home')}
                  style={{
                    flex: 1, height: 44, borderRadius: 12, border: 'none',
                    background: t.text, color: t.bg,
                    fontSize: 14, fontWeight: 600, fontFamily: t.font,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: 'pointer',
                  }}
                >
                  <Icon name="wave" size={16} color={t.bg} stroke={2} />
                  重新连接
                </button>
                <button
                  onClick={() => nav.push('device')}
                  style={{
                    height: 44, padding: '0 16px', borderRadius: 12,
                    border: `0.5px solid ${t.line}`, background: 'transparent',
                    color: t.text, fontSize: 14, fontWeight: 500, fontFamily: t.font,
                    cursor: 'pointer',
                  }}
                >
                  排查
                </button>
              </div>
            </div>
          </div>

          {/* still usable */}
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginBottom: 12 }}>
              仍可使用
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <QuickCard t={t} title="浏览食谱" sub="248 道菜可看" icon="book"    onClick={() => nav.setTab('book')} />
              <QuickCard t={t} title="AI 对话"  sub="问做菜问题"  icon="sparkle" onClick={() => nav.setTab('ai')} />
            </div>
          </div>
        </div>
        <TabBar t={t} active="home" />
      </div>
    </PhoneFrame>
  );
}
