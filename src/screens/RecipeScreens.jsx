// Recipe list, detail, and search results.

import { Fragment } from 'react';
import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { TabBar } from '../components/TabBar.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { Icon } from '../lib/Icon.jsx';
import { RECIPES, SEASONINGS, YUXIANG_RATIO, heroBg } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { glass, pinkBg } from '../lib/theme.js';

// ─────────────────────────────────────────────────────────────
// Recipe list (小红书风格)
// ─────────────────────────────────────────────────────────────
export function RecipeListScreen({ t }) {
  const nav = useNav();
  const cats = ['全部', '川菜', '家常', '凉菜', '粤菜', '湘菜'];
  return (
    <PhoneFrame t={t} screen="09 食谱列表 Recipes">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
          {/* title */}
          <div style={{ padding: '64px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: t.textSec, marginBottom: 4, letterSpacing: 0.4, fontWeight: 500 }}>
                  RECIPE BOOK
                </div>
                <div style={{ fontSize: t.h1, fontWeight: t.titleWeight, letterSpacing: -0.6 }}>食谱</div>
              </div>
              <button
                aria-label="筛选"
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  ...glass("soft"), border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="filter" size={18} color={t.text} stroke={1.8} />
              </button>
            </div>
            {/* search */}
            <button
              onClick={() => nav.push('search')}
              style={{
                width: '100%',
                marginTop: 14, height: 44, borderRadius: 22, ...glass("soft"),
                display: 'flex', alignItems: 'center',
                padding: '0 16px', gap: 10,
                border: 'none', cursor: 'pointer', fontFamily: t.font,
                textAlign: 'left',
              }}
            >
              <Icon name="search" size={16} color={t.textSec} stroke={1.8} />
              <span style={{ fontSize: 14, color: t.textTer, flex: 1 }}>搜索菜名或调味...</span>
            </button>
          </div>

          {/* categories */}
          <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflow: 'hidden' }}>
            {cats.map((c, i) => (
              <div
                key={c}
                style={{
                  padding: '7px 14px', borderRadius: 100,
                  background: i === 1 ? t.text : 'transparent',
                  color: i === 1 ? t.bg : t.textSec,
                  border: i === 1 ? 'none' : `0.5px solid ${t.line}`,
                  fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* hot pick */}
          <div style={{ padding: '20px 20px 0' }}>
            <button
              onClick={() => nav.push('detail')}
              style={{
                width: '100%', padding: 0, border: 'none', cursor: 'pointer',
                borderRadius: 20, overflow: 'hidden', height: 220,
                position: 'relative',
                ...heroBg(RECIPES[0]),
              }}
            >
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)',
                }}
              />
              <div
                style={{
                  position: 'absolute', top: 14, left: 14,
                  padding: '5px 10px', borderRadius: 100,
                  background: 'rgba(255,255,255,0.95)', color: '#1A1A1A',
                  fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Icon name="flame" size={11} color="#C7522A" stroke={2.2} />
                本周热门
              </div>
              <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500, letterSpacing: 0.3, marginBottom: 4 }}>
                  {RECIPES[0].english} · 川菜
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
                  {RECIPES[0].name}
                </div>
                <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85, display: 'flex', gap: 10 }}>
                  <span>难度 ★★☆</span>
                  <span>·</span>
                  <span>{RECIPES[0].time} 分钟</span>
                  <span>·</span>
                  <span>调味机自动配酱</span>
                </div>
              </div>
            </button>
          </div>

          {/* grid */}
          <div
            style={{
              padding: '16px 20px 0',
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
            }}
          >
            {RECIPES.slice(1, 5).map((r) => (
              <button
                key={r.id}
                onClick={() => nav.push('detail')}
                style={{
                  padding: 0, background: 'transparent', border: 'none', cursor: 'pointer',
                  textAlign: 'left', fontFamily: t.font, color: t.text,
                }}
              >
                <FoodThumb r={r} style={{ width: '100%', height: 160, borderRadius: 14 }} />
                <div
                  style={{
                    marginTop: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                      {r.category} · {r.time}m
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: t.textTer, fontWeight: 600 }}>
                    {'★'.repeat(r.difficulty) + '☆'.repeat(3 - r.difficulty)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <TabBar t={t} active="book" />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Recipe detail
// ─────────────────────────────────────────────────────────────
export function RecipeDetailScreen({ t }) {
  const nav = useNav();
  const r = RECIPES[0];
  return (
    <PhoneFrame t={t} screen="10 食谱详情 Detail">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
          {/* hero */}
          <div style={{ height: 360, position: 'relative', ...heroBg(r) }}>
            <div
              style={{
                position: 'absolute', top: 54, left: 16, right: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                zIndex: 5,
              }}
            >
              <CircleButton t={t} icon="back" glass size={36} iconColor="#fff" iconStroke={2} onClick={nav.pop} />
              <div style={{ display: 'flex', gap: 8 }}>
                <CircleButton t={t} icon="heart" glass size={36} iconColor="#fff" iconStroke={2} />
              </div>
            </div>
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 55%)',
              }}
            />
            <div style={{ position: 'absolute', bottom: 28, left: 20, right: 20, color: '#fff' }}>
              <div
                style={{
                  fontSize: 11, opacity: 0.85, letterSpacing: 0.4, fontWeight: 500, marginBottom: 6,
                }}
              >
                {r.english} · {r.category}
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.05 }}>{r.name}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* stats card */}
          <div
            style={{
              margin: '-24px 20px 0', position: 'relative',
              ...glass("card"), borderRadius: 18,
              border: `0.5px solid ${t.line}`,
              padding: '16px 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-around',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <StatCell t={t} label="时间" value={`${r.time} 分钟`} />
            <div style={{ width: 1, height: 28, background: t.line }} />
            <StatCell t={t} label="难度" value="★★☆" />
            <div style={{ width: 1, height: 28, background: t.line }} />
            <StatCell t={t} label="收藏" value="1.2k" />
          </div>

          {/* auto sauce card */}
          <div style={{ padding: '24px 20px 0' }}>
            <div
              style={{
                display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2 }}>
                调味机自动配料
              </div>
              <button
                onClick={() => nav.push('ratio')}
                style={{
                  fontSize: 12, color: t.accent, fontWeight: 600,
                  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                  fontFamily: t.font,
                }}
              >
                调整 ›
              </button>
            </div>
            <div
              style={{
                ...pinkBg, color: t.accentText, borderRadius: 18,
                padding: 16, position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 500, letterSpacing: 0.3 }}>
                鱼香汁 · 71 g
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2, letterSpacing: -0.3 }}>
                咸甜微辣 · 带荔枝口
              </div>
              <div
                style={{
                  marginTop: 14, display: 'flex', height: 8,
                  borderRadius: 100, overflow: 'hidden',
                }}
              >
                {YUXIANG_RATIO.map((s) => {
                  const seasoning = SEASONINGS.find((x) => x.key === s.key);
                  return <div key={s.key} style={{ flex: s.grams, background: seasoning?.color || '#fff' }} />;
                })}
              </div>
              <div
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: 10, fontSize: 10, opacity: 0.85,
                }}
              >
                {YUXIANG_RATIO.slice(0, 4).map((s) => (
                  <span key={s.key}>{s.label} {s.grams}g</span>
                ))}
              </div>
            </div>
          </div>

          {/* ingredients */}
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginBottom: 10 }}>
              主料
            </div>
            {[
              { name: '猪里脊', amt: '250 g' },
              { name: '木耳 (泡发)', amt: '40 g' },
              { name: '胡萝卜', amt: '60 g' },
              { name: '青笋', amt: '80 g' },
            ].map((ing, i, arr) => (
              <div
                key={ing.name}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.lineSoft}`,
                  fontSize: 14,
                }}
              >
                <span>{ing.name}</span>
                <span style={{ color: t.textSec, fontVariantNumeric: 'tabular-nums' }}>{ing.amt}</span>
              </div>
            ))}
          </div>

          {/* steps preview */}
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginBottom: 10 }}>
              步骤 · 共 6 步
            </div>
            {['肉丝上浆腌制 10 分钟', '木耳、胡萝卜、青笋切丝', '调味机自动调配鱼香汁'].map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '10px 0',
                }}
              >
                <div
                  style={{
                    width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                    ...glass("soft"), color: t.text,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: t.text, paddingTop: 2 }}>{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* sticky CTA */}
        <div
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 20px 32px',
            ...glass("tabbar"),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderTop: `0.5px solid ${t.tabbarLine}`,
          }}
        >
          <button
            onClick={() => nav.push('step')}
            style={{
              width: '100%', height: 54, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 16, fontWeight: 600, fontFamily: t.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer',
            }}
          >
            <Icon name="sparkle" size={18} color={t.accentText} stroke={2} />
            开始 AI 引导式烹饪
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

function StatCell({ t, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
      <div style={{ fontSize: 10, color: t.textSec, letterSpacing: 0.3, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2, letterSpacing: -0.2 }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Search results
// ─────────────────────────────────────────────────────────────
export function SearchResultsScreen({ t }) {
  const nav = useNav();
  return (
    <PhoneFrame t={t} screen="18 搜索 Search">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* search header */}
        <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              flex: 1, height: 44, borderRadius: 22, ...glass("soft"),
              display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
            }}
          >
            <Icon name="search" size={16} color={t.textSec} stroke={1.8} />
            <span style={{ fontSize: 14, color: t.text, flex: 1 }}>蒜苔</span>
            <button
              onClick={nav.pop}
              aria-label="清空"
              style={{
                width: 18, height: 18, borderRadius: 9,
                background: t.textTer,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <Icon name="close" size={10} color={t.bg} stroke={2.4} />
            </button>
          </div>
          <button
            onClick={nav.pop}
            style={{
              fontSize: 14, color: t.textSec, fontWeight: 500,
              background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: t.font,
            }}
          >
            取消
          </button>
        </div>

        {/* tabs */}
        <div
          style={{
            padding: '4px 20px 0', display: 'flex', gap: 16,
            borderBottom: `0.5px solid ${t.lineSoft}`,
          }}
        >
          {['菜谱 3', '酱料 1', '食材', '历史'].map((tab, i) => (
            <div
              key={tab}
              style={{
                padding: '10px 0 12px',
                borderBottom: i === 0 ? `2px solid ${t.text}` : 'none',
                fontSize: 13, fontWeight: i === 0 ? 600 : 500,
                color: i === 0 ? t.text : t.textSec,
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 32px' }}>
          <div
            style={{
              fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500,
              padding: '12px 0 6px',
            }}
          >
            找到 3 道相关菜谱
          </div>

          {[
            RECIPES.find((r) => r.id === 'suntai'),
            RECIPES.find((r) => r.id === 'shengcai'),
            RECIPES.find((r) => r.id === 'yuxiang'),
          ].map((r, i) => (
            <button
              key={r.id}
              onClick={() => nav.push('detail')}
              className="anim-step-in"
              style={{
                width: '100%',
                display: 'flex', gap: 12, padding: '14px 0',
                borderTop: 'none', borderRight: 'none', borderLeft: 'none',
                borderBottom: `0.5px solid ${t.lineSoft}`,
                background: 'transparent', cursor: 'pointer',
                textAlign: 'left', fontFamily: t.font, color: t.text,
                animationDelay: `${i * 0.07}s`,
              }}
            >
              <FoodThumb r={r} style={{ width: 88, height: 88, borderRadius: 12, flexShrink: 0 }} />
              <div
                style={{
                  flex: 1, minWidth: 0,
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  padding: '2px 0',
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>
                    {r.name.split('蒜苔').map((s, idx, arr) =>
                      idx === arr.length - 1 ? (
                        s
                      ) : (
                        <Fragment key={idx}>
                          {s}
                          <mark
                            style={{
                              background: t.accentSoft, color: t.accent,
                              padding: '0 2px', borderRadius: 2,
                            }}
                          >
                            蒜苔
                          </mark>
                        </Fragment>
                      ),
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                    {r.category} · {r.time} 分钟 · {r.tags.join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {r.id === 'suntai' && (
                    <span
                      style={{
                        fontSize: 9, padding: '2px 6px',
                        ...pinkBg, color: t.accentText, borderRadius: 4,
                        fontWeight: 600, letterSpacing: 0.3,
                      }}
                    >
                      含「蒜苔」
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 9, padding: '2px 6px',
                      ...glass("soft"), color: t.textSec,
                      borderRadius: 4, fontWeight: 500,
                    }}
                  >
                    难度 {'★'.repeat(r.difficulty)}
                  </span>
                </div>
              </div>
            </button>
          ))}

          {/* suggested searches */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: 11, color: t.textSec, letterSpacing: 0.4,
                fontWeight: 600, marginBottom: 10,
              }}
            >
              你可能也搜
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['蒜蓉', '猪肉末', '青蒜', '快手菜', '下饭'].map((s) => (
                <div
                  key={s}
                  style={{
                    padding: '7px 14px', borderRadius: 100,
                    background: 'transparent', border: `0.5px solid ${t.line}`,
                    fontSize: 13, color: t.text, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Icon name="search" size={12} color={t.textSec} stroke={1.8} />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}
