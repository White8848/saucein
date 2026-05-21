// AI assistant flow: Chat → Recommend → Step → Complete + the Voice modal.

import { useState, useRef, useEffect } from 'react';
import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { Icon } from '../lib/Icon.jsx';
import { heroBg } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { useRecipes } from "../lib/recipes.jsx";
import { useLocalStorage } from '../lib/storage.js';
import { glass, pinkBg } from '../lib/theme.js';
import { chat } from '../lib/ai.js';
import { useToast } from '../lib/toast.jsx';

// ─────────────────────────────────────────────────────────────
// AI Chat — full conversation with the chef
// ─────────────────────────────────────────────────────────────
// Welcome message shown at the top of a fresh chat session.
const WELCOME = {
  role: 'assistant',
  content: '你好,我是陈师傅。今天想做点啥?跟我说你冰箱里有的食材,或者直接告诉我口味偏好。',
};

const SUGGESTIONS = ['今晚做什么下饭菜?', '半小时内能搞定的快手菜', '少辣一点,家里老人血压高'];

export function AiChatScreen({ t }) {
  const nav = useNav();
  const [messages, setMessages] = useState([WELCOME]);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Keep the latest message in view when the list grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, pending]);

  async function send(content) {
    const trimmed = content.trim();
    if (!trimmed || pending) return;
    const next = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setText('');
    setPending(true);
    setError(null);
    try {
      const reply = await chat(next);
      setMessages((cur) => [...cur, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e.message || 'AI 暂时不在状态,稍后再试');
    } finally {
      setPending(false);
    }
  }

  function onSubmit(ev) {
    ev?.preventDefault();
    send(text);
  }

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
              <div
                style={{
                  width: 6, height: 6, borderRadius: 3,
                  background: pending ? t.accent : t.success,
                  transition: 'background 0.2s',
                }}
              />
              <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
                {pending ? 'AI 大厨 · 思考中⋯' : 'AI 大厨 · 在线'}
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
          ref={scrollRef}
          style={{
            flex: 1, overflow: 'auto',
            padding: '16px 20px 8px',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}
        >
          {messages.map((m, i) => (
            <div key={i} className="anim-bubble-in">
              <ChatBubble t={t} role={m.role} text={m.content} />
            </div>
          ))}
          {pending && (
            <div className="anim-bubble-in" style={{ alignSelf: 'flex-start' }}>
              <TypingBubble t={t} />
            </div>
          )}
          {error && (
            <div className="anim-bubble-in" style={{ alignSelf: 'flex-start' }}>
              <ChatBubble t={t} role="error" text={`⚠️ ${error}`} />
            </div>
          )}
        </div>

        {/* suggestion chips — only show on a clean conversation to nudge first input */}
        {messages.length <= 1 && !pending && (
          <div style={{ padding: '4px 16px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {SUGGESTIONS.map((c) => (
              <button
                key={c}
                onClick={() => send(c)}
                style={{
                  padding: '7px 12px', borderRadius: 100,
                  ...glass('soft'),
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, color: t.text, fontWeight: 500,
                  whiteSpace: 'nowrap', fontFamily: t.font,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* input — controlled, Enter submits */}
        <form
          onSubmit={onSubmit}
          style={{ padding: '12px 16px 32px', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <div
            style={{
              flex: 1, height: 48, borderRadius: 24, ...glass('soft'),
              display: 'flex', alignItems: 'center', padding: '0 16px',
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="跟陈师傅说..."
              disabled={pending}
              style={{
                flex: 1, fontSize: 14, color: t.text,
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: t.font,
              }}
            />
            <Icon name="mic" size={20} color={t.textSec} stroke={1.6} />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || pending}
            aria-label="发送"
            style={{
              width: 48, height: 48, borderRadius: 24, ...pinkBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: text.trim() && !pending ? 'pointer' : 'default',
              opacity: text.trim() && !pending ? 1 : 0.55,
              transition: 'opacity 0.15s',
              padding: 0,
            }}
          >
            <Icon name="send" size={20} color={t.accentText} stroke={1.8} />
          </button>
        </form>

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
  const isUser = role === 'user' || role === 'u';
  const isError = role === 'error';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
      <div
        style={{
          maxWidth: 280,
          ...(isUser ? pinkBg : isError ? { background: t.accentSoft } : glass('soft')),
          color: isUser ? t.accentText : isError ? t.accent : t.text,
          padding: '10px 14px', borderRadius: 18,
          borderBottomRightRadius: isUser ? 4 : 18,
          borderBottomLeftRadius:  isUser ? 18 : 4,
          fontSize: 14, lineHeight: 1.5, letterSpacing: -0.1,
          whiteSpace: 'pre-wrap',
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
// Six guided steps for 鱼香肉丝 — step 3 matches the original design;
// the other five are written in the same voice. Counter, progress, and
// content all derive from `step` so prev/next genuinely walk the user.
const COOKING_STEPS = [
  {
    title: '腌制肉丝',
    body: '里脊肉切丝, 加 1 勺料酒 + 一撮淀粉, 用手抓匀, 静置 10 分钟。',
    heat: '冷盘',
    timer: '10:00',
    tip: '上浆后下锅不易粘连, 滑炒口感更嫩。',
  },
  {
    title: '配料切丝',
    body: '木耳泡发切丝, 胡萝卜与青笋切均匀的细丝, 蒜蒜末备用。',
    heat: '准备',
    timer: '4:00',
    tip: '所有食材切到同等粗细, 受热才能均匀。',
  },
  {
    title: '倒入肉丝, 滑炒至变色',
    body: '油温六成热, 沿锅边滑入腌好的肉丝。用筷子快速拨散, 避免成团。',
    heat: '中火',
    timer: '1:30',
    tip: '听见持续的吱啦声就对了 — 这是水分被锁住的信号。变色立刻盛出。',
  },
  {
    title: '下配料翻炒',
    body: '原锅留底油, 爆香蒜末, 下木耳、胡萝卜、青笋, 大火翻炒 1 分钟。',
    heat: '大火',
    timer: '1:00',
    tip: '配料先下, 让锅气把香味裹住, 再回锅肉丝。',
  },
  {
    title: '倒入鱼香汁勾芡',
    body: '把肉丝回锅, 沿锅边淋入调味机调好的鱼香汁, 翻匀至挂芡。',
    heat: '中火',
    timer: '0:40',
    tip: '芡汁要边淋边翻, 见到酱汁变亮就关火。',
  },
  {
    title: '装盘',
    body: '出锅, 盛入盘中, 撒一点葱花点缀, 立即上桌。',
    heat: '关火',
    timer: '0:20',
    tip: '热气在的时候吃最香 — 这步别等。',
  },
];

export function AiStepScreen({ t }) {
  const nav = useNav();
  // step is 1-based to match "{step}/6" in the design.
  const [step, setStep] = useState(1);
  const total = COOKING_STEPS.length;
  const cur = COOKING_STEPS[step - 1];
  const pct = (step / total) * 100;
  const onPrev = () => (step > 1 ? setStep(step - 1) : nav.pop());
  const onNext = () => (step < total ? setStep(step + 1) : nav.push('complete'));

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
          <div style={{ fontSize: 12, color: t.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {step} / {total}
          </div>
        </div>

        {/* progress */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ height: 3, ...glass("soft"), borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                width: `${pct}%`, height: '100%', ...pinkBg,
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
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
              {cur.heat}
            </div>
          </div>
        </div>

        {/* step text */}
        <div style={{ padding: '20px 20px 0', flex: 1 }}>
          <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
            STEP {String(step).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 24, fontWeight: t.titleWeight, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 10 }}>
            {cur.title}
          </div>
          <div style={{ fontSize: 14, color: t.textSec, lineHeight: 1.55 }}>
            {cur.body}
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
                  {cur.timer}
                </div>
              </div>
            </div>
            <button
              onClick={() => nav.push('chat')}
              style={{
                padding: '0 14px', borderRadius: 14,
                background: t.accentSoft, color: t.accent,
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600,
                border: 'none', fontFamily: t.font,
              }}
            >
              <Icon name="sparkle" size={14} color={t.accent} stroke={2} />
              问 AI
            </button>
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
                {cur.tip}
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
            onClick={onPrev}
            style={{
              height: 52, padding: '0 22px', borderRadius: 14,
              border: `0.5px solid ${t.line}`, background: 'transparent',
              color: t.text, fontSize: 15, fontWeight: 500, fontFamily: t.font,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Icon name="back" size={16} color={t.text} stroke={2} />
            上一步
          </button>
          <button
            onClick={onNext}
            style={{
              flex: 1, height: 52, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {step < total ? '完成, 下一步' : '完成烹饪'}
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
  const toast = useToast();
  const r = recipes[0];
  const [rating, setRating] = useState(4);
  const [feedback, setFeedback] = useState('正好');
  const [favIds, setFavIds] = useLocalStorage('favorites', []);
  const isFav = !!r && favIds.includes(r.id);
  const toggleFav = () => {
    if (!r) return;
    if (isFav) {
      setFavIds((xs) => xs.filter((x) => x !== r.id));
      toast('已取消收藏');
    } else {
      setFavIds((xs) => [...xs, r.id]);
      toast('已加入我的酱料库', { tone: 'accent' });
    }
  };
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
              {[1, 2, 3, 4, 5].map((i) => {
                const lit = i <= rating;
                return (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    aria-label={`${i} 星`}
                    style={{
                      background: 'transparent', border: 'none', padding: 0,
                      color: lit ? t.accent : t.line,
                      transition: 'color 0.18s ease, transform 0.15s ease',
                      transform: lit ? 'scale(1)' : 'scale(0.94)',
                    }}
                  >
                    <Icon name="star" size={32} color={lit ? t.accent : t.line} stroke={2} />
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['咸了一点', '正好', '甜了', '辣了', '可以再快点'].map((c) => {
                const on = feedback === c;
                return (
                  <button
                    key={c}
                    onClick={() => setFeedback(on ? null : c)}
                    className="chip"
                    style={{
                      padding: '6px 12px', borderRadius: 100,
                      background: on ? t.text : 'transparent',
                      color: on ? t.bg : t.textSec,
                      border: on ? 'none' : `0.5px solid ${t.line}`,
                      fontSize: 12, fontWeight: 500,
                      fontFamily: t.font,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* actions */}
          <div style={{ padding: '0 0 32px', display: 'flex', gap: 10 }}>
            <button
              onClick={toggleFav}
              style={{
                flex: 1, height: 52, borderRadius: 14,
                border: isFav ? 'none' : `0.5px solid ${t.line}`,
                background: isFav ? t.accentSoft : 'transparent',
                color: isFav ? t.accent : t.text,
                fontSize: 14, fontWeight: 600, fontFamily: t.font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 0.2s ease, color 0.2s ease',
              }}
            >
              <Icon
                name={isFav ? 'heart-f' : 'heart'}
                size={16}
                color={isFav ? t.accent : t.text}
                stroke={1.8}
              />
              {isFav ? '已收藏' : '收藏配方'}
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
