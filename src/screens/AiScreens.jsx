// AI assistant flow: Chat → Recommend → Step → Complete + the Voice modal.

import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { Icon } from '../lib/Icon.jsx';
import { heroBg } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { useRecipes } from "../lib/recipes.jsx";
import { glass, pinkBg } from '../lib/theme.js';

// ─────────────────────────────────────────────────────────────
// AI Chat — full conversation with the chef
// ─────────────────────────────────────────────────────────────
export function AiChatScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  const bubbles = [
    { role: 'a', text: '晚上好。我是你的私人大厨。今晚冰箱里有什么 ?' },
    { role: 'u', text: '一把蒜苔 + 一点猪肉末。' },
    { role: 'a', text: '蒜苔炒肉末很合适。12 分钟出锅, 调味机会自动配生抽 + 一点蚝油。' },
    { role: 'u', text: '能少咸一点吗 ? 我太太血压高。' },
    {
      role: 'a',
      text: '可以。我把生抽从 12 g 降到 8 g, 再补 4 g 蒜末提香。整体偏鲜香。开始引导 ?',
      cta: true,
    },
  ];

  return (
    <PhoneFrame t={t} screen="05 AI 对话 Chat">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div
          style={{
            paddingTop: 54, paddingBottom: 10, paddingLeft: 20, paddingRight: 20,
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: `0.5px solid ${t.lineSoft}`,
          }}
        >
          <CircleButton t={t} icon="close" onClick={() => nav.setTab('home')} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: t.success }} />
              <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
                AI 大厨 · 在线
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginTop: 1 }}>
              陈师傅
            </div>
          </div>
          <CircleButton t={t} icon="tune" onClick={() => nav.push('settings')} />
        </div>

        {/* messages */}
        <div
          style={{
            flex: 1, overflow: 'auto',
            padding: '16px 20px 8px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          <div
            style={{
              alignSelf: 'center',
              fontSize: 11, color: t.textTer,
              padding: '4px 10px', borderRadius: 100,
              ...glass("softer"),
              marginBottom: 4,
            }}
          >
            今天 · 19:24
          </div>
          {bubbles.map((b, i) => (
            <div key={i} className="anim-bubble-in" style={{ animationDelay: `${i * 0.15}s` }}>
              <ChatBubble t={t} role={b.role} text={b.text} cta={b.cta} onCta={() => nav.push('step')} />
            </div>
          ))}
          <div className="anim-bubble-in" style={{ animationDelay: `${bubbles.length * 0.15}s` }}>
            <RecipeChatCard t={t} r={recipes.find((r) => r.id === 'suntai')} onClick={() => nav.push('detail', { recipeId: 'suntai' })} />
          </div>
          <div
            className="anim-bubble-in"
            style={{ animationDelay: `${(bubbles.length + 1) * 0.15}s`, alignSelf: 'flex-start' }}
          >
            <TypingBubble t={t} />
          </div>
        </div>

        {/* suggestion chips */}
        <div style={{ padding: '4px 16px 0', display: 'flex', gap: 6, overflowX: 'hidden' }}>
          {['少辣一点', '换成宫保鸡丁', '看看食谱'].map((c) => (
            <div
              key={c}
              style={{
                padding: '7px 12px', borderRadius: 100,
                ...glass("soft"),
                fontSize: 12, color: t.text, fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {c}
            </div>
          ))}
        </div>

        {/* input */}
        <div style={{ padding: '12px 16px 32px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              flex: 1, height: 48, borderRadius: 24, ...glass("soft"),
              display: 'flex', alignItems: 'center', padding: '0 16px',
            }}
          >
            <span style={{ fontSize: 14, color: t.textTer, flex: 1 }}>跟陈师傅说...</span>
            <Icon name="mic" size={20} color={t.textSec} stroke={1.6} />
          </div>
          <div
            style={{
              width: 48, height: 48, borderRadius: 24, ...pinkBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="send" size={20} color={t.accentText} stroke={1.8} />
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

function TypingBubble({ t }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        ...glass("soft"), color: t.textSec,
        padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 4,
      }}
    >
      <span className="anim-typing-dot" />
      <span className="anim-typing-dot" />
      <span className="anim-typing-dot" />
    </div>
  );
}

function ChatBubble({ t, role, text, cta, onCta }) {
  const isUser = role === 'u';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
      <div
        style={{
          maxWidth: 280,
          background: isUser ? t.accent : t.soft,
          color: isUser ? t.accentText : t.text,
          padding: '10px 14px', borderRadius: 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius:  isUser ? 18 : 4,
          fontSize: 14, lineHeight: 1.5, letterSpacing: -0.1,
        }}
      >
        {text}
        {cta && (
          <button
            onClick={onCta}
            style={{
              width: '100%',
              marginTop: 10, padding: '8px 12px',
              background: isUser ? 'rgba(255,255,255,0.18)' : t.card,
              color: 'inherit',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 13, fontWeight: 600, fontFamily: t.font,
            }}
          >
            <span>开始引导式烹饪</span>
            <Icon name="arrow-r" size={14} color={isUser ? t.accentText : t.text} stroke={2} />
          </button>
        )}
      </div>
    </div>
  );
}

function RecipeChatCard({ t, r, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...glass("card"), borderRadius: 14, padding: 10,
        border: `0.5px solid ${t.line}`,
        display: 'flex', gap: 10,
        alignSelf: 'flex-start',
        maxWidth: 280,
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left', fontFamily: t.font, color: t.text,
      }}
    >
      <FoodThumb r={r} style={{ width: 60, height: 60, borderRadius: 8, flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '2px 0',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{r.name}</div>
          <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
            {r.time} 分钟 · 自动调汁 · {r.tags[0]}下饭
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {r.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10, color: t.textSec,
                padding: '2px 6px', ...glass("soft"), borderRadius: 4,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Recommend — three dish cards from a single query
// ─────────────────────────────────────────────────────────────
export function AiRecommendScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="06 AI 推荐 Recommend">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '54px 20px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="back" onClick={nav.pop} />
          <div style={{ flex: 1, fontSize: 13, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
            陈师傅推荐
          </div>
          <CircleButton t={t} icon="sparkle" onClick={() => nav.push('chat')} />
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '8px 20px 32px' }}>
          {/* user echo */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                alignSelf: 'flex-end',
                ...glass("soft"),
                padding: '10px 14px',
                borderRadius: 16, borderBottomLeftRadius: 4,
                fontSize: 14, lineHeight: 1.5,
                display: 'inline-block', maxWidth: '90%',
              }}
            >
              <div style={{ fontSize: 11, color: t.textSec, marginBottom: 2, letterSpacing: 0.3 }}>你说</div>
              想吃下饭的, 不要太麻烦, 半小时内能上桌
            </div>
          </div>

          {/* AI heading */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: 11, ...pinkBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="sparkle" size={12} color={t.accentText} stroke={2.4} />
            </div>
            <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, letterSpacing: 0.4 }}>给你 3 道选择</div>
          </div>
          <div style={{ fontSize: 20, fontWeight: t.titleWeight, letterSpacing: -0.4, lineHeight: 1.3 }}>
            都是下饭好手, 调料机自动配酱,{' '}
            <span style={{ color: t.textSec }}>按你常吃的咸甜口微调过。</span>
          </div>

          {/* primary recommendation */}
          <div
            style={{
              marginTop: 18, borderRadius: 20, overflow: 'hidden',
              position: 'relative', height: 240,
              ...heroBg(recipes[0]),
            }}
          >
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%)',
              }}
            />
            <div
              style={{
                position: 'absolute', top: 14, left: 14,
                padding: '5px 10px', borderRadius: 100,
                ...pinkBg, color: t.accentText,
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              }}
            >
              强烈推荐
            </div>
            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: '#fff' }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
                {recipes[0].name}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6, lineHeight: 1.5 }}>
                咸甜微辣, 18 分钟出锅。鱼香汁是经典下饭杀器, <br />
                木耳青笋你冰箱也有。
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => nav.push('step')}
                  style={{
                    padding: '6px 12px', borderRadius: 100,
                    background: '#fff', color: t.text,
                    fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 4,
                    border: 'none', cursor: 'pointer', fontFamily: t.font,
                  }}
                >
                  开始 <Icon name="arrow-r" size={12} color={t.text} stroke={2.4} />
                </button>
                <button
                  onClick={() => nav.push('detail', { recipeId: recipes[0].id })}
                  style={{
                    padding: '6px 12px', borderRadius: 100,
                    background: 'rgba(255,255,255,0.18)', color: '#fff',
                    fontSize: 12, fontWeight: 600,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: 'none', cursor: 'pointer', fontFamily: t.font,
                  }}
                >
                  看食谱
                </button>
              </div>
            </div>
          </div>

          {/* alt picks */}
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[recipes[2], recipes[4]].map((r) => (
              <button
                key={r.id}
                onClick={() => nav.push('detail', { recipeId: r.id })}
                style={{
                  ...glass("card"), borderRadius: 16,
                  border: `0.5px solid ${t.line}`,
                  overflow: 'hidden',
                  padding: 0, cursor: 'pointer',
                  textAlign: 'left', fontFamily: t.font, color: t.text,
                }}
              >
                <FoodThumb r={r} style={{ width: '100%', height: 110 }} />
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: t.textSec, marginTop: 2 }}>
                    {r.time} 分钟 · {r.category}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 11, color: t.textSec, lineHeight: 1.4 }}>
                    {r.id === 'suntai' ? '比鱼香肉丝更快, 一锅出。' : '5 分钟出, 拌一个清爽配菜。'}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* why this */}
          <div
            style={{
              marginTop: 16, padding: 14,
              ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 600, marginBottom: 6 }}>
              为什么是这 3 道
            </div>
            <div style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>
              都属于<span style={{ fontWeight: 600 }}>家常川菜 · 咸鲜微辣</span>这一档, 调味机里你常用的酱料 (生抽 / 香醋 / 豆瓣) 都够用; 30 分钟内可上桌。
            </div>
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Step — guided cooking
// ─────────────────────────────────────────────────────────────
export function AiStepScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="07 引导烹饪 Step">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* top */}
        <div style={{ padding: '54px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="close" onClick={() => nav.setTab('home')} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
              引导式烹饪 · 鱼香肉丝
            </div>
          </div>
          <div style={{ fontSize: 12, color: t.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>3 / 6</div>
        </div>

        {/* progress */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ height: 3, ...glass("soft"), borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '50%', height: '100%', background: t.accent }} />
          </div>
        </div>

        {/* hero */}
        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              width: '100%', height: 220, borderRadius: 20, overflow: 'hidden',
              background: `radial-gradient(circle at 60% 40%, #E0974C, #6E2A0F)`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                background: 'radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.4), transparent 70%)',
              }}
            />
            <div
              style={{
                position: 'absolute', top: 12, right: 12,
                padding: '5px 10px', borderRadius: 100,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff', fontSize: 11, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <Icon name="flame" size={12} color="#fff" stroke={2} />
              中火
            </div>
          </div>
        </div>

        {/* step text */}
        <div style={{ padding: '20px 20px 0', flex: 1 }}>
          <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
            STEP 03
          </div>
          <div style={{ fontSize: 24, fontWeight: t.titleWeight, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 10 }}>
            倒入肉丝, 滑炒至变色
          </div>
          <div style={{ fontSize: 14, color: t.textSec, lineHeight: 1.55 }}>
            油温六成热, 沿锅边滑入腌好的肉丝。用筷子快速拨散, 避免成团。
          </div>

          {/* timer + AI button */}
          <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
            <div
              style={{
                flex: 1, padding: '14px 16px',
                ...glass("soft"), borderRadius: 14,
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  ...glass("card"), border: `1px solid ${t.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Icon name="clock" size={18} color={t.text} stroke={1.8} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: t.textSec, fontWeight: 500, letterSpacing: 0.3 }}>预计时长</div>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, fontVariantNumeric: 'tabular-nums' }}>
                  1:30
                </div>
              </div>
            </div>
            <div
              style={{
                padding: '0 14px', borderRadius: 14,
                background: t.accentSoft, color: t.accent,
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600,
              }}
            >
              <Icon name="sparkle" size={14} color={t.accent} stroke={2} />
              问 AI
            </div>
          </div>

          {/* tip */}
          <div
            style={{
              marginTop: 16, padding: 14,
              ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 14, display: 'flex', gap: 10,
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: 14, ...pinkBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="sparkle" size={14} color={t.accentText} stroke={2.2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: t.accent, fontWeight: 600, letterSpacing: 0.4 }}>陈师傅提示</div>
              <div style={{ fontSize: 13, color: t.text, lineHeight: 1.5, marginTop: 3 }}>
                听见持续的吱啦声就对了 — 这是水分被锁住的信号。变色立刻盛出。
              </div>
            </div>
          </div>
        </div>

        {/* nav */}
        <div
          style={{
            padding: '12px 20px 36px',
            display: 'flex', gap: 10,
            background: t.bg,
            borderTop: `0.5px solid ${t.lineSoft}`,
          }}
        >
          <button
            onClick={nav.pop}
            style={{
              height: 52, padding: '0 22px', borderRadius: 14,
              border: `0.5px solid ${t.line}`, background: 'transparent',
              color: t.text, fontSize: 15, fontWeight: 500, fontFamily: t.font,
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            }}
          >
            <Icon name="back" size={16} color={t.text} stroke={2} />
            上一步
          </button>
          <button
            onClick={() => nav.push('complete')}
            style={{
              flex: 1, height: 52, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              cursor: 'pointer',
            }}
          >
            完成, 下一步
            <Icon name="forward" size={16} color={t.accentText} stroke={2} />
          </button>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Cooking Complete
// ─────────────────────────────────────────────────────────────
export function CompleteScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  const r = recipes[0];
  return (
    <PhoneFrame t={t} screen="08 烹饪完成 Complete">
      <div style={{ height: '100%', padding: 0, display: 'flex', flexDirection: 'column' }}>
        {/* hero plate */}
        <div style={{ height: 380, position: 'relative', ...heroBg(r), overflow: 'hidden' }}>
          <button
            onClick={() => nav.setTab('home')}
            aria-label="关闭"
            style={{
              position: 'absolute', top: 54, right: 16,
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="close" size={16} color="#fff" stroke={2} />
          </button>
          <div
            style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to bottom, transparent 40%, ${t.bg} 100%)`,
            }}
          />
        </div>

        <div style={{ flex: 1, padding: '0 28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: -20, textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                padding: '6px 14px', borderRadius: 100,
                ...pinkBg, color: t.accentText,
                fontSize: 12, fontWeight: 600, gap: 6,
                alignItems: 'center',
              }}
            >
              <Icon name="check" size={14} color={t.accentText} stroke={2.6} />
              做好啦
            </div>
            <div
              style={{
                fontSize: 32, fontWeight: t.titleWeight,
                letterSpacing: -0.7, lineHeight: 1.1, marginTop: 14,
              }}
            >
              {r.name}
            </div>
            <div style={{ fontSize: 13, color: t.textSec, marginTop: 6 }}>
              耗时 21 分钟 · 比平均快 2 分钟
            </div>
          </div>

          {/* rating */}
          <div
            style={{
              marginTop: 28, padding: 18,
              ...glass("card"), border: `0.5px solid ${t.line}`,
              borderRadius: 18,
            }}
          >
            <div
              style={{
                fontSize: 13, color: t.textSec, fontWeight: 500, letterSpacing: 0.3,
                textAlign: 'center', marginBottom: 12,
              }}
            >
              这次味道怎么样 ?
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ color: i <= 4 ? t.accent : t.line }}>
                  <Icon name="star" size={32} color={i <= 4 ? t.accent : t.line} stroke={2} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['咸了一点', '正好', '甜了', '辣了', '可以再快点'].map((c, i) => (
                <div
                  key={c}
                  style={{
                    padding: '6px 12px', borderRadius: 100,
                    background: i === 1 ? t.text : 'transparent',
                    color: i === 1 ? t.bg : t.textSec,
                    border: i === 1 ? 'none' : `0.5px solid ${t.line}`,
                    fontSize: 12, fontWeight: 500,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* actions */}
          <div style={{ padding: '0 0 32px', display: 'flex', gap: 10 }}>
            <button
              onClick={() => nav.push('library')}
              style={{
                flex: 1, height: 52, borderRadius: 14,
                border: `0.5px solid ${t.line}`, background: 'transparent',
                color: t.text, fontSize: 14, fontWeight: 600, fontFamily: t.font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'pointer',
              }}
            >
              <Icon name="heart" size={16} color={t.text} stroke={1.8} />
              收藏配方
            </button>
            <button
              onClick={() => nav.setTab('home')}
              style={{
                flex: 1.4, height: 52, borderRadius: 14, border: 'none',
                ...pinkBg, color: t.accentText,
                fontSize: 14, fontWeight: 600, fontFamily: t.font,
                cursor: 'pointer',
              }}
            >
              完成
            </button>
          </div>
        </div>

        <HomeIndicator t={t} />
      </div>
    </PhoneFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// AI Voice — listening mode (full-screen dark)
// ─────────────────────────────────────────────────────────────
export function AiVoiceScreen({ t }) {
  const nav = useNav();
  const { recipes } = useRecipes();
  return (
    <PhoneFrame t={t} screen="24 AI 语音 Voice">
      <div style={{ height: '100%', position: 'relative', background: t.text, overflow: 'hidden' }}>
        {/* top bar */}
        <div
          style={{
            position: 'absolute', top: 54, left: 16, right: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
        >
          <button
            onClick={() => nav.setTab('home')}
            aria-label="关闭"
            style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="close" size={16} color="#fff" stroke={2} />
          </button>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500, letterSpacing: 0.4 }}>
            正在聆听...
          </div>
          <div
            style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="tune" size={16} color="#fff" stroke={2} />
          </div>
        </div>

        {/* listening orb */}
        <div
          style={{
            position: 'absolute', top: '32%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 200, height: 200,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="anim-voice-ring"
              style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: `${t.accent}30`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
          <div
            style={{
              position: 'absolute', inset: 30, borderRadius: '50%',
              ...pinkBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${t.accent}60`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 50 }}>
              {[0, 0.15, 0.3, 0.45, 0.6, 0.45, 0.3, 0.15].map((d, i) => (
                <div
                  key={i}
                  className="anim-voice-bar"
                  style={{
                    width: 5, height: 36, borderRadius: 3,
                    background: t.accentText,
                    animationDelay: `${d}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* transcript */}
        <div
          style={{
            position: 'absolute', top: '60%', left: 28, right: 28,
            color: '#fff', textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11, color: 'rgba(255,255,255,0.5)',
              letterSpacing: 1, fontWeight: 600, marginBottom: 14,
            }}
          >
            正在转录
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1.35 }}>
            "今晚做什么<br />
            <span style={{ opacity: 0.5 }}>下饭的快手菜⋯⋯</span>
            <span className="anim-typing-dot" style={{ marginLeft: 4, background: '#fff' }} />
            "
          </div>
        </div>

        {/* hints */}
        <div
          style={{
            position: 'absolute', bottom: 100, left: 0, right: 0,
            textAlign: 'center',
            fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.4,
          }}
        >
          松开发送 · 上滑取消
        </div>

        {/* dock */}
        <div
          style={{
            position: 'absolute', bottom: 36, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 24,
          }}
        >
          <button
            onClick={() => nav.setTab('home')}
            aria-label="取消"
            style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="close" size={20} color="#fff" stroke={2} />
          </button>
          <div
            style={{
              width: 72, height: 72, borderRadius: 36,
              ...pinkBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${t.accent}50`,
            }}
          >
            <Icon name="mic" size={28} color={t.accentText} stroke={2} />
          </div>
          <button
            onClick={() => nav.push('chat')}
            aria-label="发送"
            style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="check" size={22} color="#fff" stroke={2.4} />
          </button>
        </div>

        <HomeIndicator t={t} color="#fff" />
      </div>
    </PhoneFrame>
  );
}
