// Recipe list, detail, and search results.

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { TabBar } from '../components/TabBar.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { Icon } from '../lib/Icon.jsx';
import { SEASONINGS, YUXIANG_RATIO, heroBg } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { useRecipes, fetchRecipeDetail } from "../lib/recipes.jsx";
import { useLocalStorage } from '../lib/storage.js';
import { glass, pinkBg } from '../lib/theme.js';

// ─────────────────────────────────────────────────────────────
// Recipe list (小红书风格)
// ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 8;

export function RecipeListScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  const cats = ['全部', '川菜', '家常', '凉菜', '粤菜', '湘菜'];
  const [cat, setCat] = useState('全部');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const showHero = cat === '全部';
  const filtered = useMemo(
    () => (cat === '全部' ? recipes : recipes.filter((r) => r.category === cat)),
    [recipes, cat],
  );
  // Grid shows everything below the hero (when on 全部), or the full filtered
  // set otherwise — paginated via `visible` and an IntersectionObserver
  // sentinel at the bottom of the list.
  const fullGrid = showHero ? filtered.slice(1) : filtered;
  const gridItems = fullGrid.slice(0, visible);
  const hasMore = fullGrid.length > visible;

  // Reset pagination whenever the user switches category, otherwise the
  // visible count carries over and feels stuck on the new tab.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [cat]);

  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!hasMore) return;
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible((v) => v + PAGE_SIZE);
      },
      { root, rootMargin: '300px' },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [hasMore]);

  return (
    <PhoneFrame t={t} screen="09 食谱列表 Recipes">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', paddingBottom: 110 }}>
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
                onClick={() => nav.push('search')}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  ...glass("soft"), border: 'none',
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
                border: 'none', fontFamily: t.font,
                textAlign: 'left',
              }}
            >
              <Icon name="search" size={16} color={t.textSec} stroke={1.8} />
              <span style={{ fontSize: 14, color: t.textTer, flex: 1 }}>搜索菜名或调味...</span>
            </button>
          </div>

          {/* categories — single-select; re-tap "全部" is a no-op (keep at least one selected) */}
          <div style={{ padding: '16px 20px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
            {cats.map((c) => {
              const on = c === cat;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className="chip"
                  style={{
                    padding: '7px 14px', borderRadius: 100,
                    background: on ? t.text : 'transparent',
                    color: on ? t.bg : t.textSec,
                    border: on ? 'none' : `0.5px solid ${t.line}`,
                    fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* hot pick — only on "全部" */}
          {showHero && filtered[0] && (
            <div style={{ padding: '20px 20px 0' }}>
              <button
                onClick={() => nav.push('detail', { recipeId: filtered[0].id })}
                style={{
                  width: '100%', padding: 0, border: 'none',
                  borderRadius: 20, overflow: 'hidden', height: 220,
                  position: 'relative',
                  ...heroBg(filtered[0]),
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
                    {filtered[0].english} · {filtered[0].category}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
                    {filtered[0].name}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 6, opacity: 0.85, display: 'flex', gap: 10 }}>
                    <span>难度 {'★'.repeat(filtered[0].difficulty) + '☆'.repeat(3 - filtered[0].difficulty)}</span>
                    <span>·</span>
                    <span>{filtered[0].time} 分钟</span>
                    <span>·</span>
                    <span>调味机自动配酱</span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* grid */}
          {gridItems.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: t.textSec, fontSize: 13 }}>
              暂无「{cat}」菜谱
            </div>
          ) : (
            <div
              style={{
                padding: '16px 20px 0',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
              }}
            >
              {gridItems.map((r) => (
                <button
                  key={r.id}
                  onClick={() => nav.push('detail', { recipeId: r.id })}
                  style={{
                    padding: 0, background: 'transparent', border: 'none',
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
          )}

          {/* Sentinel: when this scrolls into view (or within 300px of it)
             the IntersectionObserver bumps `visible` by PAGE_SIZE. */}
          {hasMore && (
            <div ref={sentinelRef} style={{ height: 24 }} aria-hidden="true" />
          )}
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
  const { recipes, byId } = useRecipes();
  // Recipe to show — passed via nav.params.recipeId; falls back to the
  // first recipe if nav wasn't given an id (e.g., dev menu jumped here).
  const id = nav.params?.recipeId || recipes[0]?.id;
  const r = byId[id] || recipes[0];

  // Per-recipe favorite — persisted; toggled by the top-right heart.
  const [favIds, setFavIds] = useLocalStorage('favorites', []);
  const isFav = !!r && favIds.includes(r.id);
  const toggleFav = () => {
    if (!r) return;
    setFavIds((xs) => (xs.includes(r.id) ? xs.filter((x) => x !== r.id) : [...xs, r.id]));
  };

  // Fetch steps + ingredients for this recipe. Cached per-id in recipes.jsx
  // so toggling between detail pages doesn't refetch.
  const [detail, setDetail] = useState({ steps: [], ingredients: [], loading: true });
  useEffect(() => {
    if (!r?.id) return;
    let cancelled = false;
    setDetail((d) => ({ ...d, loading: true }));
    fetchRecipeDetail(r.id).then((d) => {
      if (!cancelled) setDetail({ ...d, loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [r?.id]);

  if (!r) return null;

  const isYuxiang = r.id === 'yuxiang';
  const sauceName = isYuxiang ? '鱼香汁 · 71 g' : `${r.name}专用酱汁`;
  const sauceSub = isYuxiang
    ? '咸甜微辣 · 带荔枝口'
    : (r.tags || []).join(' · ') || '调味机自动调配';
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
                <button
                  onClick={toggleFav}
                  aria-label={isFav ? '取消收藏' : '收藏'}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    background: isFav ? '#fff' : 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', padding: 0,
                    transition: 'background 0.2s ease',
                  }}
                >
                  <Icon
                    name={isFav ? 'heart-f' : 'heart'}
                    size={18}
                    color={isFav ? t.accent : '#fff'}
                    stroke={2}
                  />
                </button>
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
                {sauceName}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2, letterSpacing: -0.3 }}>
                {sauceSub}
              </div>
              {isYuxiang && (
                <>
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
                </>
              )}
              {!isYuxiang && (
                <div
                  style={{
                    marginTop: 14, fontSize: 11, opacity: 0.85, lineHeight: 1.5,
                  }}
                >
                  AI 已根据本菜的口味档案预设配比 · 点击"调整"自定义
                </div>
              )}
            </div>
          </div>

          {/* ingredients */}
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginBottom: 10 }}>
              主料
            </div>
            {detail.loading ? (
              <div style={{ fontSize: 13, color: t.textSec, padding: '12px 0' }}>加载中⋯</div>
            ) : detail.ingredients.length === 0 ? (
              <div style={{ fontSize: 13, color: t.textSec, padding: '12px 0' }}>暂无食材数据</div>
            ) : (
              detail.ingredients.map((ing, i, arr) => (
                <div
                  key={ing.id ?? ing.name}
                  style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: i === arr.length - 1 ? 'none' : `0.5px solid ${t.lineSoft}`,
                    fontSize: 14,
                  }}
                >
                  <span>{ing.name}</span>
                  <span style={{ color: t.textSec, fontVariantNumeric: 'tabular-nums' }}>{ing.amount}</span>
                </div>
              ))
            )}
          </div>

          {/* steps preview — show all steps from DB */}
          <div style={{ padding: '24px 20px 0' }}>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginBottom: 10 }}>
              步骤 · 共 {detail.steps.length || '⋯'} 步
            </div>
            {detail.loading && detail.steps.length === 0 ? (
              <div style={{ fontSize: 13, color: t.textSec, padding: '12px 0' }}>加载中⋯</div>
            ) : (
              detail.steps.map((s) => (
                <div
                  key={s.step_index}
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
                    {s.step_index}
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <div style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{s.title}</div>
                    {s.description && (
                      <div style={{ fontSize: 12, color: t.textSec, marginTop: 2, lineHeight: 1.55 }}>
                        {s.description}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
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
            onClick={() => nav.push('step', { recipeId: r.id })}
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
  const { recipes } = useRecipes();
  const [q, setQ] = useState('蒜苔');
  const [tab, setTab] = useState('菜谱');

  // Live filter — case-insensitive contains across name / english / category / tags.
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return recipes.filter((r) => {
      const haystack = [
        r.name, r.english, r.category, ...(r.tags || []),
      ].join(' ').toLowerCase();
      return haystack.includes(needle);
    });
  }, [recipes, q]);

  const counts = { 菜谱: matches.length, 酱料: q ? 1 : 0, 食材: 0, 历史: 0 };
  const tabs = ['菜谱', '酱料', '食材', '历史'];

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
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索菜名或调味..."
              autoFocus
              style={{
                flex: 1, minWidth: 0,
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 14, color: t.text, fontFamily: t.font,
              }}
            />
            {q && (
              <button
                onClick={() => setQ('')}
                aria-label="清空"
                style={{
                  width: 18, height: 18, borderRadius: 9,
                  background: t.textTer,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', padding: 0,
                }}
              >
                <Icon name="close" size={10} color={t.bg} stroke={2.4} />
              </button>
            )}
          </div>
          <button
            onClick={nav.pop}
            style={{
              fontSize: 14, color: t.textSec, fontWeight: 500,
              background: 'transparent', border: 'none', padding: 0,
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
          {tabs.map((label) => {
            const on = tab === label;
            const count = counts[label];
            return (
              <button
                key={label}
                onClick={() => setTab(label)}
                style={{
                  padding: '10px 0 12px',
                  borderTop: 'none', borderRight: 'none', borderLeft: 'none',
                  borderBottom: on ? `2px solid ${t.text}` : '2px solid transparent',
                  background: 'transparent',
                  fontSize: 13, fontWeight: on ? 600 : 500,
                  color: on ? t.text : t.textSec,
                  transition: 'color 0.18s ease, border-color 0.18s ease',
                }}
              >
                {label}{count > 0 ? ` ${count}` : ''}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 32px' }}>
          {/* result count */}
          {tab === '菜谱' && q && (
            <div
              style={{
                fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500,
                padding: '12px 0 6px',
              }}
            >
              找到 {matches.length} 道相关菜谱
            </div>
          )}

          {tab === '菜谱' && matches.map((r, i) => (
            <button
              key={r.id}
              onClick={() => nav.push('detail', { recipeId: r.id })}
              className="anim-step-in"
              style={{
                width: '100%',
                display: 'flex', gap: 12, padding: '14px 0',
                borderTop: 'none', borderRight: 'none', borderLeft: 'none',
                borderBottom: `0.5px solid ${t.lineSoft}`,
                background: 'transparent',
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
                    {highlightMatches(r.name, q, t)}
                  </div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                    {r.category} · {r.time} 分钟 · {(r.tags || []).join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {q && (r.tags || []).some((tag) => tag.includes(q)) && (
                    <span
                      style={{
                        fontSize: 9, padding: '2px 6px',
                        ...pinkBg, color: t.accentText, borderRadius: 4,
                        fontWeight: 600, letterSpacing: 0.3,
                      }}
                    >
                      含「{q}」
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

          {tab === '菜谱' && q && matches.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: t.textSec, fontSize: 13 }}>
              没找到「{q}」相关菜谱
            </div>
          )}

          {tab === '酱料' && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: t.textSec, fontSize: 13 }}>
              {q ? `酱料库里没有符合「${q}」的配方` : '请输入关键词'}
            </div>
          )}

          {(tab === '食材' || tab === '历史') && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: t.textSec, fontSize: 13 }}>
              {tab === '食材' ? '食材搜索即将上线' : '暂无搜索历史'}
            </div>
          )}

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
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="chip"
                  style={{
                    padding: '7px 14px', borderRadius: 100,
                    background: 'transparent', border: `0.5px solid ${t.line}`,
                    fontSize: 13, color: t.text, fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontFamily: t.font,
                  }}
                >
                  <Icon name="search" size={12} color={t.textSec} stroke={1.8} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// Wrap every occurrence of `q` in `text` with a pink-tinted <mark>.
// Case-sensitive against the visible string; good enough for Chinese.
function highlightMatches(text, q, t) {
  if (!q) return text;
  const parts = text.split(q);
  if (parts.length === 1) return text;
  return parts.map((p, i, arr) =>
    i === arr.length - 1 ? (
      <Fragment key={i}>{p}</Fragment>
    ) : (
      <Fragment key={i}>
        {p}
        <mark
          style={{
            background: t.accentSoft, color: t.accent,
            padding: '0 2px', borderRadius: 2,
          }}
        >
          {q}
        </mark>
      </Fragment>
    ),
  );
}
