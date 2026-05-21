// Edge Function: chat
//
// Proxies AI chat requests from the SAUCEIN web app to Moonshot Kimi.
// The Kimi API key lives ONLY as a Supabase Edge Function secret
// (`KIMI_KEY`) — never in git, never in the client bundle. The
// frontend invokes this with its anon JWT; Supabase verifies the JWT
// before our handler runs, so random internet traffic can't burn the key.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const KIMI_KEY = Deno.env.get('KIMI_KEY');
const KIMI_URL = 'https://api.moonshot.cn/v1/chat/completions';
const MODEL = 'moonshot-v1-8k';

// 陈师傅 persona — kept on the server so we can iterate without shipping
// a new client bundle. Style notes match the scripted bubbles in the
// original design: concise, gram-precise, sauce-config-aware.
const SYSTEM_PROMPT = `你是 SAUCEIN 智能调味机里的 AI 大厨"陈师傅"。专业、精准、克数明确。

你的能力:
- 推荐家常下饭菜,可基于用户冰箱里现有的食材
- 自动调配酱料配比,精确到克(如"生抽 12g + 香醋 8g")
- 根据场景调整咸度/辣度(老人血压高、孩子怕辣、孕妇忌口等)
- 给出 10-30 分钟能上桌的快手做法

说话风格:
- 简洁,不啰嗦。一两句能讲清的别拆三句
- 酱料配比一定要具体克数,不写"少许"、"适量"
- 推荐时考虑用户描述的限制(时间、人数、口味偏好)
- 自然亲切但不过度热情,像真厨子在跟人聊天

回复用中文。每次回复尽量保持在 60 字以内,除非用户问详细做法。`;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'content-type, authorization, apikey, x-client-info',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!KIMI_KEY) {
    return jsonResponse(
      {
        error:
          'KIMI_KEY not configured on the server. Set it in ' +
          'Supabase Dashboard → Edge Functions → Secrets.',
      },
      500,
    );
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  // Trim to last 12 turns to keep token usage in check; defensive filter
  // so malformed entries from the client don't blow up the upstream call.
  const cleaned = (body.messages || [])
    .filter(
      (m) =>
        m &&
        typeof m.role === 'string' &&
        ['user', 'assistant', 'system'].includes(m.role) &&
        typeof m.content === 'string' &&
        m.content.length > 0,
    )
    .slice(-12);

  if (cleaned.length === 0) {
    return jsonResponse({ error: 'messages array is empty' }, 400);
  }

  try {
    const upstream = await fetch(KIMI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...cleaned],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Kimi upstream error', upstream.status, errText);
      return jsonResponse(
        {
          error: `Upstream ${upstream.status}`,
          detail: errText.slice(0, 200),
        },
        upstream.status >= 500 ? 502 : upstream.status,
      );
    }

    const data = await upstream.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';
    return jsonResponse({ reply, usage: data?.usage ?? null });
  } catch (e) {
    console.error('chat handler exception', e);
    return jsonResponse({ error: String((e as Error)?.message || e) }, 500);
  }
});
