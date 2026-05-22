// AI assistant flow: Chat → Recommend → Step → Complete + the Voice modal.

import { useState, useRef, useEffect } from 'react';
import { PhoneFrame, HomeIndicator } from '../components/PhoneFrame.jsx';
import { CircleButton } from '../components/CircleButton.jsx';
import { FoodThumb } from '../components/FoodThumb.jsx';
import { Icon } from '../lib/Icon.jsx';
import { heroBg } from '../lib/data.js';
import { useNav } from '../lib/nav.jsx';
import { useRecipes, fetchRecipeDetail } from "../lib/recipes.jsx";
import { useLocalStorage } from '../lib/storage.js';
import { glass, pinkBg } from '../lib/theme.js';
import { chat, MAX_TURNS, LimitReachedError } from '../lib/ai.js';
import {
  useSpeechRecognition, speak, cancelSpeech, voiceSupported,
} from '../lib/voice.js';
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
  const { byId } = useRecipes();
  const [messages, setMessages] = useState([WELCOME]);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef(null);

  // User-message count is the canonical "turn" counter — assistant
  // replies and the welcome bubble don't count toward the cap.
  const turnsUsed = messages.filter((m) => m.role === 'user').length;
  const atLimit = limitReached || turnsUsed >= MAX_TURNS;

  // Keep the latest message in view when the list grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, pending]);

  function newConversation() {
    setMessages([WELCOME]);
    setText('');
    setError(null);
    setLimitReached(false);
  }

  async function send(content) {
    const trimmed = content.trim();
    if (!trimmed || pending || atLimit) return;
    // Strip ui-only fields from the history sent upstream — the model
    // only needs { role, content }.
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));
    const sendable = [...history, { role: 'user', content: trimmed }];
    setMessages((cur) => [...cur, { role: 'user', content: trimmed }]);
    setText('');
    setPending(true);
    setError(null);
    try {
      const { intro, recipes, reply } = await chat(sendable);
      if (recipes.length > 0) {
        setMessages((cur) => [
          ...cur,
          { role: 'assistant', content: intro || '给你这几个建议:', recipes },
        ]);
      } else {
        setMessages((cur) => [...cur, { role: 'assistant', content: reply || '⋯' }]);
      }
    } catch (e) {
      if (e instanceof LimitReachedError) {
        setLimitReached(true);
        setError(e.message);
      } else {
        setError(e.message || 'AI 暂时不在状态,稍后再试');
      }
    } finally {
      setPending(false);
    }
  }

  function onSubmit(ev) {
    ev?.preventDefault();
    send(text);
  }

  const showSuggestions = messages.length <= 1 && !pending && !atLimit;

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
                  background: pending ? t.accent : atLimit ? t.textTer : t.success,
                  transition: 'background 0.2s',
                }}
              />
              <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
                {pending ? 'AI 大厨 · 思考中⋯' : `陈师傅 · ${turnsUsed} / ${MAX_TURNS} 来回`}
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: t.titleWeight, letterSpacing: -0.2, marginTop: 1 }}>
              陈师傅
            </div>
          </div>
          {/* Right action: new chat reset (replaces the old tune icon). */}
          <button
            onClick={newConversation}
            aria-label="新对话"
            title="新对话"
            disabled={messages.length <= 1 && !atLimit}
            style={{
              width: 32, height: 32, borderRadius: 16,
              ...glass('soft'),
              border: 'none', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: messages.length <= 1 && !atLimit ? 0.45 : 1,
            }}
          >
            <Icon name="plus" size={16} color={t.text} stroke={2} />
          </button>
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
            <div key={i} className="anim-bubble-in" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {m.content && (
                <div>
                  <ChatBubble t={t} role={m.role} text={m.content} />
                </div>
              )}
              {m.recipes && m.recipes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignSelf: 'flex-start' }}>
                  {m.recipes.map((id) => {
                    const r = byId[id];
                    if (!r) return null;
                    return (
                      <RecipeChatCard
                        key={id}
                        t={t}
                        r={r}
                        onClick={() => nav.push('detail', { recipeId: id })}
                      />
                    );
                  })}
                </div>
              )}
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

        {/* suggestion chips — only show on a clean conversation */}
        {showSuggestions && (
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

        {/* input — locked when at limit; replaced by a "new chat" CTA */}
        {atLimit ? (
          <div style={{ padding: '12px 16px 32px' }}>
            <div
              style={{
                fontSize: 12, color: t.textSec, textAlign: 'center',
                padding: '4px 0 10px',
              }}
            >
              本次对话已达 {MAX_TURNS} 来回上限
            </div>
            <button
              onClick={newConversation}
              style={{
                width: '100%', height: 48, borderRadius: 14,
                ...pinkBg, color: t.accentText,
                fontSize: 15, fontWeight: 600, fontFamily: t.font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                border: 'none', cursor: 'pointer',
              }}
            >
              <Icon name="plus" size={18} color={t.accentText} stroke={2.4} />
              开始新对话
            </button>
          </div>
        ) : (
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
              <button
                type="button"
                onClick={() => nav.push('voice')}
                aria-label="语音对话"
                title="语音对话"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                <Icon name="mic" size={20} color={t.textSec} stroke={1.6} />
              </button>
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
        )}

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
                  onClick={() => nav.push('step', { recipeId: recipes[0].id })}
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
// Reads `nav.params.recipeId` (falls back to recipes[0] when the screen was
// opened without one — e.g. the dev menu). Pulls steps + heat/timer/tip
// from Supabase via fetchRecipeDetail; the UI is fully data-driven so any
// recipe in the catalog can be cooked.

// Render `duration_sec` (integer) as "m:ss" — matches the original "1:30" labels.
function fmtDuration(sec) {
  if (!Number.isFinite(sec) || sec <= 0) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AiStepScreen({ t }) {
  const nav = useNav();
  const { recipes, byId } = useRecipes();
  const id = nav.params?.recipeId || recipes[0]?.id;
  const r = byId[id] || recipes[0];

  // 1-based step index to match the "{step}/{total}" counter in the design.
  const [step, setStep] = useState(1);
  const [detail, setDetail] = useState({ steps: [], loading: true });

  // Reload steps when the recipe changes; also reset progress to step 1.
  useEffect(() => {
    if (!r?.id) return;
    let cancelled = false;
    setDetail((d) => ({ ...d, loading: true }));
    setStep(1);
    fetchRecipeDetail(r.id).then((d) => {
      if (!cancelled) setDetail({ steps: d.steps || [], loading: false });
    });
    return () => {
      cancelled = true;
    };
  }, [r?.id]);

  if (!r) return null;

  const total = detail.steps.length;
  const cur = detail.steps[step - 1];
  const pct = total ? (step / total) * 100 : 0;
  const onPrev = () => (step > 1 ? setStep(step - 1) : nav.pop());
  const onNext = () =>
    step < total ? setStep(step + 1) : nav.push('complete', { recipeId: r.id });

  return (
    <PhoneFrame t={t} screen="07 引导烹饪 Step">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* top */}
        <div style={{ padding: '54px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircleButton t={t} icon="close" onClick={() => nav.setTab('home')} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: t.textSec, letterSpacing: 0.4, fontWeight: 500 }}>
              引导式烹饪 · {r.name}
            </div>
          </div>
          <div style={{ fontSize: 12, color: t.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {total ? `${step} / ${total}` : '⋯'}
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

        {/* hero — uses the dish image when available, gradient fallback otherwise */}
        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              width: '100%', height: 220, borderRadius: 20, overflow: 'hidden',
              position: 'relative',
              ...heroBg(r),
            }}
          >
            <div
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                background: 'radial-gradient(ellipse at 50% 80%, rgba(0,0,0,0.4), transparent 70%)',
              }}
            />
            {cur?.heat && (
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
            )}
          </div>
        </div>

        {/* step text */}
        <div style={{ padding: '20px 20px 0', flex: 1 }}>
          <div style={{ fontSize: 12, color: t.accent, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6 }}>
            STEP {String(step).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 24, fontWeight: t.titleWeight, letterSpacing: -0.5, lineHeight: 1.2, marginBottom: 10 }}>
            {cur?.title || (detail.loading ? '加载中⋯' : '暂无步骤')}
          </div>
          <div style={{ fontSize: 14, color: t.textSec, lineHeight: 1.55 }}>
            {cur?.description}
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
                  {fmtDuration(cur?.duration_sec)}
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

          {/* tip — only rendered when the DB row carries one */}
          {cur?.tip && (
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
          )}
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
            disabled={!total}
            style={{
              flex: 1, height: 52, borderRadius: 14, border: 'none',
              ...pinkBg, color: t.accentText,
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: total ? 1 : 0.5,
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
  const { recipes, byId } = useRecipes();
  const toast = useToast();
  // Honor the recipe that was actually cooked — AiStepScreen forwards the id
  // when finishing. Falls back to recipes[0] when entered cold (dev menu).
  const id = nav.params?.recipeId || recipes[0]?.id;
  const r = byId[id] || recipes[0];
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

        <div
          style={{
            flex: 1, padding: '0 28px',
            display: 'flex', flexDirection: 'column',
            position: 'relative', zIndex: 1,
          }}
        >
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
              {r.category} · 用时 {r.time} 分钟
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
// Voice chat with 陈师傅 — speak into the mic (browser STT), the same KIMI
// `chat()` answers, and the reply is read back aloud (browser TTS). Phases:
//   idle      → waiting for a tap
//   listening → mic open, live transcript
//   thinking  → request in flight
//   speaking  → TTS reading the reply
export function AiVoiceScreen({ t }) {
  const nav = useNav();
  const { byId } = useRecipes();

  const [messages, setMessages] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [userSaid, setUserSaid] = useState('');
  const [aiText, setAiText] = useState('');
  const [chips, setChips] = useState([]);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  const turnsUsed = messages.filter((m) => m.role === 'user').length;
  const atLimit = limitReached || turnsUsed >= MAX_TURNS;

  async function handleUtterance(textIn) {
    setThinking(true);
    setSpeaking(false);
    setUserSaid(textIn);
    setError(null);
    setChips([]);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const sendable = [...history, { role: 'user', content: textIn }];
    setMessages((cur) => [...cur, { role: 'user', content: textIn }]);
    try {
      const { intro, recipes, reply } = await chat(sendable);
      const hasRecipes = recipes.length > 0;
      const bubble = hasRecipes ? intro || '给你这几个建议' : reply || '⋯';
      setMessages((cur) => [...cur, { role: 'assistant', content: bubble }]);
      setAiText(bubble);
      setChips(recipes);
      // Read the names aloud too — a recipe list is useless if it's silent.
      const names = recipes.map((id) => byId[id]?.name).filter(Boolean);
      const spoken = hasRecipes && names.length ? `${bubble}。${names.join('、')}` : bubble;
      setThinking(false);
      setSpeaking(true);
      speak(spoken, { onEnd: () => setSpeaking(false) });
    } catch (e) {
      if (e instanceof LimitReachedError) {
        setLimitReached(true);
        setError(e.message);
      } else {
        setError(e.message || 'AI 暂时不在状态,稍后再试');
      }
      setThinking(false);
      setSpeaking(false);
    }
  }

  const { listening, interim, start, stop, cancel } = useSpeechRecognition({
    onFinal: handleUtterance,
    onEmpty: () => {},
  });

  // The hook's `listening` is the single source of truth for the mic state;
  // thinking and speaking are explicit. Deriving `phase` (rather than tracking
  // it separately) removes the desync that left the orb stuck "listening" when
  // the recognizer failed to start.
  const phase = speaking ? 'speaking' : thinking ? 'thinking' : listening ? 'listening' : 'idle';

  // Tear down mic + speech if the screen unmounts mid-session.
  useEffect(() => () => {
    cancel();
    cancelSpeech();
  }, [cancel]);

  function leave() {
    cancel();
    cancelSpeech();
    nav.setTab('home');
  }

  function restart() {
    cancel();
    cancelSpeech();
    setMessages([]);
    setUserSaid('');
    setAiText('');
    setChips([]);
    setError(null);
    setLimitReached(false);
    setThinking(false);
    setSpeaking(false);
  }

  function onMicTap() {
    if (listening) {
      stop(); // finish the utterance and send now
    } else if (speaking) {
      cancelSpeech();
      setSpeaking(false);
    } else if (!thinking && !atLimit) {
      setUserSaid('');
      setAiText('');
      setError(null);
      start();
    }
  }

  // Browser can't do speech — point the user at the text chat instead.
  if (!voiceSupported) {
    return (
      <PhoneFrame t={t} screen="24 AI 语音 Voice">
        <div
          style={{
            height: '100%', background: t.text, color: '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '0 36px', textAlign: 'center', gap: 16,
          }}
        >
          <Icon name="mic" size={40} color="rgba(255,255,255,0.4)" stroke={1.6} />
          <div style={{ fontSize: 18, fontWeight: 600 }}>这个浏览器不支持语音</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
            语音对话需要 Chrome、Edge 或 Safari。你可以改用文字版陈师傅。
          </div>
          <button
            onClick={() => nav.push('chat')}
            style={{
              marginTop: 8, height: 46, padding: '0 24px', borderRadius: 23,
              ...pinkBg, color: t.accentText, border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 600, fontFamily: t.font,
            }}
          >
            打开文字对话
          </button>
        </div>
      </PhoneFrame>
    );
  }

  const active = phase === 'listening' || phase === 'speaking';
  const statusText =
    phase === 'listening' ? '正在聆听...'
      : phase === 'thinking' ? '陈师傅思考中...'
        : phase === 'speaking' ? '正在回答...'
          : atLimit ? '已达本次上限' : `陈师傅 · ${turnsUsed} / ${MAX_TURNS} 来回`;
  const transcriptLabel =
    phase === 'listening' ? '正在转录'
      : phase === 'thinking' ? '你说'
        : phase === 'speaking' || aiText ? '陈师傅' : '';
  const transcript =
    phase === 'listening' ? interim || '我在听⋯⋯'
      : phase === 'thinking' ? userSaid
        : aiText || (atLimit ? '本次语音对话已结束' : '点麦克风,跟陈师傅聊聊');
  const hint =
    phase === 'listening' ? '说完停顿一下自动发送 · 或点一下结束'
      : phase === 'speaking' ? '点击可打断'
        : phase === 'thinking' ? '⋯'
          : atLimit ? '点右侧按钮开始新对话' : '点麦克风开始说话';
  const micIcon = phase === 'listening' ? 'check' : 'mic';

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
            onClick={leave}
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
            {statusText}
          </div>
          <button
            onClick={restart}
            aria-label="新对话"
            title="新对话"
            style={{
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="plus" size={16} color="#fff" stroke={2} />
          </button>
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
                animationPlayState: active ? 'running' : 'paused',
                opacity: active ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            />
          ))}
          <button
            onClick={onMicTap}
            aria-label="麦克风"
            style={{
              position: 'absolute', inset: 30, borderRadius: '50%',
              ...pinkBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${t.accent}60`,
              border: 'none', cursor: phase === 'thinking' ? 'default' : 'pointer', padding: 0,
            }}
          >
            {phase === 'listening' ? (
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
            ) : (
              <Icon
                name={phase === 'thinking' ? 'sparkle' : micIcon}
                size={34}
                color={t.accentText}
                stroke={2}
              />
            )}
          </button>
        </div>

        {/* transcript */}
        <div
          style={{
            position: 'absolute', top: '58%', left: 28, right: 28,
            color: '#fff', textAlign: 'center',
          }}
        >
          {transcriptLabel && (
            <div
              style={{
                fontSize: 11, color: 'rgba(255,255,255,0.5)',
                letterSpacing: 1, fontWeight: 600, marginBottom: 14,
              }}
            >
              {transcriptLabel}
            </div>
          )}
          <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1.4 }}>
            {transcript}
            {phase === 'listening' && (
              <span className="anim-typing-dot" style={{ marginLeft: 4, background: '#fff' }} />
            )}
          </div>

          {/* recipe chips from the reply */}
          {chips.length > 0 && phase !== 'listening' && (
            <div
              style={{
                display: 'flex', flexWrap: 'wrap', gap: 8,
                justifyContent: 'center', marginTop: 18,
              }}
            >
              {chips.map((id) => {
                const r = byId[id];
                if (!r) return null;
                return (
                  <button
                    key={id}
                    onClick={() => { cancelSpeech(); nav.push('detail', { recipeId: id }); }}
                    style={{
                      height: 34, padding: '0 14px', borderRadius: 17,
                      background: 'rgba(255,255,255,0.14)', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 500, fontFamily: t.font,
                    }}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <div style={{ marginTop: 16, fontSize: 13, color: t.accent }}>{error}</div>
          )}
        </div>

        {/* hint */}
        <div
          style={{
            position: 'absolute', bottom: 116, left: 0, right: 0,
            textAlign: 'center',
            fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.4,
          }}
        >
          {hint}
        </div>

        {/* dock */}
        <div
          style={{
            position: 'absolute', bottom: 40, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 24,
          }}
        >
          <button
            onClick={leave}
            aria-label="退出"
            style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="close" size={20} color="#fff" stroke={2} />
          </button>
          <button
            onClick={() => { cancelSpeech(); nav.push('chat'); }}
            aria-label="切到文字"
            title="切到文字对话"
            style={{
              width: 56, height: 56, borderRadius: 28,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <Icon name="sparkle" size={20} color="#fff" stroke={2} />
          </button>
        </div>

        <HomeIndicator t={t} color="#fff" />
      </div>
    </PhoneFrame>
  );
}
