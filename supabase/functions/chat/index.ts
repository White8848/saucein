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

可用菜谱 (下面这 ${recipes.length} 道是 DB 里的全部, 只能从这里挑):
${catalog}

【硬规则:必须返回 JSON,只能是以下两种格式之一】

1) 用户问"做什么菜 / 推荐菜 / 想吃X / 有什么菜 / 来道菜" → 推荐 1-3 道菜:
{"recipes": ["id1", "id2"], "intro": "≤ 30 字的短引导,例如:'今晚试试这两道, 都快手又下饭'"}

2) 闲聊 / 问做法细节 / 改配方 / 调整咸辣度 / 食材替代 → 文字回答:
{"reply": "≤ 80 字的简短回答, 酱料配比必须克数(生抽 8g, 不写少许)"}

⚠️ 重要:
- recipe id 必须是上面列表里的英文 id(如 yuxiang, suntai), 不能编新的
- 用户描述任何菜系/口味/时间/食材 → 都先看能不能从已有菜谱里推荐
- intro 短,不要把菜名/时长写进去(卡片会显示),只写一句引子
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
