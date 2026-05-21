// Edge Function: chat
//
// AI chat with recipe-aware structured output. Pipeline:
//   1. Fetch the recipe catalog from Postgres (always up-to-date).
//   2. Inject the catalog into a system prompt that forces Kimi to either
//      (a) recommend recipes by id, or (b) return free-text.
//   3. Ask Kimi for JSON output (`response_format`).
//   4. Validate the returned recipe ids against the live catalog, drop any
//      hallucinated ones, return { intro, recipes, reply } to the client.
//
// Secrets: KIMI_KEY (set via Supabase Dashboard → Edge Functions → Secrets).
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by the platform.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const KIMI_KEY = Deno.env.get('KIMI_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const KIMI_URL = 'https://api.moonshot.cn/v1/chat/completions';
const MODEL = 'moonshot-v1-8k';

// Guest users get N user→assistant turns per conversation before the
// client must start a fresh one. Enforced server-side so a tampered
// client can't burn through the Kimi quota.
const MAX_TURNS = 5;

type RecipeRow = {
  id: string;
  name: string;
  english: string | null;
  category: string | null;
  time_minutes: number | null;
  tags: string[] | null;
};

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

async function loadRecipes(): Promise<RecipeRow[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return [];
  const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await supa
    .from('recipes')
    .select('id, name, english, category, time_minutes, tags')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('loadRecipes failed', error);
    return [];
  }
  return (data as RecipeRow[]) ?? [];
}

function buildSystemPrompt(recipes: RecipeRow[]) {
  const catalog = recipes
    .map(
      (r) =>
        `- ${r.id}: ${r.name} (${r.category ?? '?'}, ${r.time_minutes ?? '?'}min, ${(r.tags || []).join('/')})`,
    )
    .join('\n');

  return `你是 SAUCEIN 智能调味机里的 AI 大厨"陈师傅"。专业、精准、克数明确。

【你只聊做菜,任何与做菜无关的话题一律礼貌拒答,不要尝试帮忙】

可用菜谱 (下面这 ${recipes.length} 道是 DB 里的全部, 只能从这里挑):
${catalog}

【硬规则:必须返回 JSON,只能是以下三种格式之一】

1) 用户提到任意菜名(无论是否在列表里),或描述菜系/口味/食材/时长偏好
   → 推荐 1-3 道,分三种子情况处理:

   1a) 提到的菜在上面列表里 → 推荐该菜(可再加 1-2 道相关)
       intro ≤ 30 字短引子,不写菜名/时长(卡片会显示)
       例:{"recipes":["yuxiang"], "intro":"经典下饭,十分钟搞定"}

   1b) 提到的菜不在列表里(eg 宫保鸡丁/披萨/牛排/麻婆豆腐)
       → 推断它的菜系/口味/食材/做法,从上面列表里挑 1-3 道最接近的
       intro ≤ 40 字,先简短说明原菜暂无,再点出替代菜的相似处
       (这是唯一允许 intro 里出现菜名的情况)
       例:{"recipes":["yuxiang","mapo"], "intro":"宫保鸡丁暂没有,这两道也是麻辣下饭口"}
       例:{"recipes":["lemonchicken"], "intro":"披萨我们做不了,来道清爽开胃的吧"}
       ⚠️ 绝对不能因为找不到就拒答,一定要给替代

   1c) 用户只描述偏好(辣的/快手/川菜/晚餐),没指定菜名 → 按偏好推荐
       intro ≤ 30 字,不写菜名/时长

   统一格式:{"recipes": ["id1", "id2"], "intro": "..."}

2) 用户问已经聊过的菜的细节(改配方/克数调整/食材替代/咸辣调整/步骤疑问) → 文字回答:
{"reply": "≤ 80 字简短回答,酱料配比写克数(生抽 8g,不写'少许')"}

3) 用户问任何与做菜无关的事(写代码/数学/天气/新闻/政治/八卦/情感/自我介绍/讲笑话/语言翻译...) → 礼貌拒答:
{"reply": "抱歉,我只会聊做菜哦~有什么想做的菜或者口味偏好吗?"}

⚠️ 重要:
- 任何菜名出现 → 优先用规则1弹卡片,不要用文字介绍这道菜
- 目录里没有的菜也要用规则1b推替代,不要用规则2/3的文字回答打发
- recipe id 必须是上面列表里的英文 id(如 yuxiang, suntai),严禁编新的
- 不要把规则3用在做菜相关问题上(食材/工具/火候/酱料/调味...都算做菜)
- 不要在 JSON 外面写任何其他文字`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!KIMI_KEY) {
    return jsonResponse({ error: 'KIMI_KEY not configured on the server.' }, 500);
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

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

  // Turn limit — count user messages in the incoming conversation. The
  // welcome assistant message + any prior assistant replies don't count.
  const userTurnCount = cleaned.filter((m) => m.role === 'user').length;
  if (userTurnCount > MAX_TURNS) {
    return jsonResponse(
      {
        error: `本次对话已达 ${MAX_TURNS} 个来回上限,请开始新对话`,
        limit_reached: true,
        max_turns: MAX_TURNS,
      },
      429,
    );
  }

  const recipes = await loadRecipes();
  const systemPrompt = buildSystemPrompt(recipes);

  try {
    const upstream = await fetch(KIMI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KIMI_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...cleaned],
        temperature: 0.5,
        max_tokens: 400,
        response_format: { type: 'json_object' },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('Kimi upstream error', upstream.status, errText);
      return jsonResponse(
        { error: `Upstream ${upstream.status}`, detail: errText.slice(0, 200) },
        upstream.status >= 500 ? 502 : upstream.status,
      );
    }

    const data = await upstream.json();
    const raw = data?.choices?.[0]?.message?.content ?? '';

    // Parse JSON. If parsing fails (model misbehaves), surface raw as a
    // text reply rather than blowing up the UI.
    let parsed: { recipes?: string[]; intro?: string; reply?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw };
    }

    // Strip hallucinated ids — only keep ones that exist in the catalog.
    const validIds = new Set(recipes.map((r) => r.id));
    const filteredRecipes = Array.isArray(parsed.recipes)
      ? parsed.recipes.filter((id) => typeof id === 'string' && validIds.has(id))
      : [];

    const intro = typeof parsed.intro === 'string' ? parsed.intro : '';
    const reply = typeof parsed.reply === 'string' ? parsed.reply : '';

    return jsonResponse({
      intro,
      recipes: filteredRecipes,
      reply,
      usage: data?.usage ?? null,
      turns_used: userTurnCount,
      max_turns: MAX_TURNS,
    });
  } catch (e) {
    console.error('chat handler exception', e);
    return jsonResponse({ error: String((e as Error)?.message || e) }, 500);
  }
});
