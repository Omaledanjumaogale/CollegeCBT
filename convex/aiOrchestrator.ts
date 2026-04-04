import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

/**
 * Enterprise AI Orchestrator with Multi-Model Fallback Chain.
 *
 * Primary:       Configured via `AGENT_LLM_PROVIDER` env var (e.g. openai | gemini | anthropic)
 * Fallback Chain: Ordered list in `AGENT_LLM_FALLBACK_CHAIN` (comma-separated provider keys)
 *
 * On each failure, the orchestrator cascades to the next provider and logs
 * the event to the audit trail before returning.
 */

type LLMMessage = { role: 'system' | 'user' | 'assistant'; content: string };

interface OrchestratorEnv {
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL: string;
  ANTHROPIC_API_KEY?: string;
  ANTHROPIC_MODEL: string;
  OPENROUTER_BASE_URL: string;
  DEEPSEEK_V3_1_KEY?: string;
  DEEPSEEK_V3_1_MODEL: string;
  DEEPSEEK_V3_KEY?: string;
  DEEPSEEK_V3_MODEL: string;
  DEEPSEEK_R1_KEY?: string;
  DEEPSEEK_R1_MODEL: string;
  QWEN_3_235B_KEY?: string;
  QWEN_3_235B_MODEL: string;
  NVIDIA_NEMOTRON_SUPER_KEY?: string;
  NVIDIA_NEMOTRON_SUPER_MODEL: string;
  GLM_4_5_AIR_KEY?: string;
  GLM_4_5_AIR_MODEL: string;
  AGENT_LLM_PROVIDER: string;
  AGENT_LLM_FALLBACK_CHAIN: string;
}

function parseFallbackChain(chainString: string): string[] {
  return chainString.split(',').map(s => s.trim()).filter(Boolean);
}

/** Route to the correct provider implementation */
async function callProvider(provider: string, messages: LLMMessage[], env: OrchestratorEnv): Promise<string> {
  switch (provider) {
    case 'openai':
      if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
      return callOpenAI(messages, env.OPENAI_API_KEY, env.OPENAI_MODEL, env.OPENAI_BASE_URL);
    case 'gemini':
      if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
      return callGemini(messages, env.GEMINI_API_KEY, env.GEMINI_MODEL);
    case 'anthropic':
      if (!env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
      return callAnthropic(messages, env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
    case 'openrouter':
    case 'deepseek-v3-1':
      if (!env.DEEPSEEK_V3_1_KEY) throw new Error('DEEPSEEK_V3_1_KEY not set');
      return callOpenRouter(messages, env.OPENROUTER_BASE_URL, env.DEEPSEEK_V3_1_KEY, env.DEEPSEEK_V3_1_MODEL);
    case 'deepseek-v3':
      if (!env.DEEPSEEK_V3_KEY) throw new Error('DEEPSEEK_V3_KEY not set');
      return callOpenRouter(messages, env.OPENROUTER_BASE_URL, env.DEEPSEEK_V3_KEY, env.DEEPSEEK_V3_MODEL);
    case 'deepseek-r1':
      if (!env.DEEPSEEK_R1_KEY) throw new Error('DEEPSEEK_R1_KEY not set');
      return callOpenRouter(messages, env.OPENROUTER_BASE_URL, env.DEEPSEEK_R1_KEY, env.DEEPSEEK_R1_MODEL);
    case 'qwen3-235b':
      if (!env.QWEN_3_235B_KEY) throw new Error('QWEN_3_235B_KEY not set');
      return callOpenRouter(messages, env.OPENROUTER_BASE_URL, env.QWEN_3_235B_KEY, env.QWEN_3_235B_MODEL);
    case 'nemotron-super':
      if (!env.NVIDIA_NEMOTRON_SUPER_KEY) throw new Error('NVIDIA_NEMOTRON_SUPER_KEY not set');
      return callOpenRouter(messages, env.OPENROUTER_BASE_URL, env.NVIDIA_NEMOTRON_SUPER_KEY, env.NVIDIA_NEMOTRON_SUPER_MODEL);
    case 'glm-4-5-air':
      if (!env.GLM_4_5_AIR_KEY) throw new Error('GLM_4_5_AIR_KEY not set');
      return callOpenRouter(messages, env.OPENROUTER_BASE_URL, env.GLM_4_5_AIR_KEY, env.GLM_4_5_AIR_MODEL);
    default:
      throw new Error(`Unknown provider: "${provider}". Check AGENT_LLM_FALLBACK_CHAIN.`);
  }
}

// ── OpenAI-Compatible (gpt-4o, gpt-4o-mini, etc.) ───────────────────────────
async function callOpenAI(messages: LLMMessage[], key: string, model: string, baseUrl: string): Promise<string> {
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, response_format: { type: 'json_object' }, temperature: 0.1 }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI HTTP ${resp.status}: ${text}`);
  }
  const data = await resp.json() as { choices: { message: { content: string } }[] };
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty content');
  return content;
}

// ── Google Gemini (REST) ─────────────────────────────────────────────────────
async function callGemini(messages: LLMMessage[], key: string, model: string): Promise<string> {
  const system = messages.find(m => m.role === 'system')?.content ?? '';
  const user = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n\n');
  const combined = system ? `${system}\n\n${user}` : user;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: combined }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini HTTP ${resp.status}: ${text}`);
  }
  const data = await resp.json() as { candidates: { content: { parts: { text: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty content');
  return text;
}

// ── Anthropic Claude ─────────────────────────────────────────────────────────
async function callAnthropic(messages: LLMMessage[], key: string, model: string): Promise<string> {
  const systemMessage = messages.find(m => m.role === 'system')?.content ?? '';
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, system: systemMessage, messages: conversationMessages, max_tokens: 2000, temperature: 0.1 }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Anthropic HTTP ${resp.status}: ${text}`);
  }
  const data = await resp.json() as { content: { type: string; text?: string }[] };
  const text = data.content.find(b => b.type === 'text')?.text;
  if (!text) throw new Error('Anthropic returned empty content');
  return text;
}

// ── OpenRouter (DeepSeek, Qwen, Nemotron, GLM via single endpoint) ──────────
async function callOpenRouter(messages: LLMMessage[], baseUrl: string, key: string, model: string): Promise<string> {
  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://collegecbt.ewinproject.org',
      'X-Title': 'CollegeCBT Enterprise',
    },
    body: JSON.stringify({ model, messages, response_format: { type: 'json_object' }, temperature: 0.1 }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenRouter HTTP ${resp.status}: ${text}`);
  }
  const data = await resp.json() as { choices: { message: { content: string } }[] };
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('OpenRouter returned empty content');
  return content;
}

/**
 * orchestrateTask — the public Convex action called by agentWorkflow.
 *
 * 1. Reads provider config from process.env (injected by Convex dashboard secrets).
 * 2. Attempts primary provider first.
 * 3. Cascades through fallback chain on any failure.
 * 4. Writes success/failure audit events after each attempt.
 * 5. Returns { ok, provider, result } on success or { ok: false, error } when all fail.
 */
export const orchestrateTask = action({
  args: {
    taskName: v.string(),
    systemPrompt: v.string(),
    userPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    // ── Collect env config ────────────────────────────────────────────────────
    const env: OrchestratorEnv = {
      OPENAI_API_KEY:            process.env.OPENAI_API_KEY,
      OPENAI_MODEL:              process.env.OPENAI_MODEL             ?? 'gpt-4o-mini',
      OPENAI_BASE_URL:           process.env.OPENAI_BASE_URL          ?? 'https://api.openai.com/v1',
      GEMINI_API_KEY:            process.env.GEMINI_API_KEY,
      GEMINI_MODEL:              process.env.GEMINI_MODEL             ?? 'gemini-1.5-flash',
      ANTHROPIC_API_KEY:         process.env.ANTHROPIC_API_KEY,
      ANTHROPIC_MODEL:           process.env.ANTHROPIC_MODEL          ?? 'claude-3-haiku-20240307',
      OPENROUTER_BASE_URL:       process.env.OPENROUTER_BASE_URL      ?? 'https://openrouter.ai/api/v1',
      DEEPSEEK_V3_1_KEY:         process.env.DEEPSEEK_V3_1_KEY,
      DEEPSEEK_V3_1_MODEL:       process.env.DEEPSEEK_V3_1_MODEL      ?? 'deepseek/deepseek-chat-v3-0324',
      DEEPSEEK_V3_KEY:           process.env.DEEPSEEK_V3_KEY,
      DEEPSEEK_V3_MODEL:         process.env.DEEPSEEK_V3_MODEL        ?? 'deepseek/deepseek-chat',
      DEEPSEEK_R1_KEY:           process.env.DEEPSEEK_R1_KEY,
      DEEPSEEK_R1_MODEL:         process.env.DEEPSEEK_R1_MODEL        ?? 'deepseek/deepseek-r1',
      QWEN_3_235B_KEY:           process.env.QWEN_3_235B_KEY,
      QWEN_3_235B_MODEL:         process.env.QWEN_3_235B_MODEL        ?? 'qwen/qwen3-235b-a22b',
      NVIDIA_NEMOTRON_SUPER_KEY:   process.env.NVIDIA_NEMOTRON_SUPER_KEY,
      NVIDIA_NEMOTRON_SUPER_MODEL: process.env.NVIDIA_NEMOTRON_SUPER_MODEL ?? 'nvidia/llama-3.1-nemotron-70b-instruct',
      GLM_4_5_AIR_KEY:           process.env.GLM_4_5_AIR_KEY,
      GLM_4_5_AIR_MODEL:         process.env.GLM_4_5_AIR_MODEL        ?? 'thudm/glm-4-plus',
      AGENT_LLM_PROVIDER:        process.env.AGENT_LLM_PROVIDER       ?? 'openai',
      AGENT_LLM_FALLBACK_CHAIN:  process.env.AGENT_LLM_FALLBACK_CHAIN ?? 'gemini,deepseek-v3-1,deepseek-v3',
    };

    const messages: LLMMessage[] = [
      { role: 'system', content: args.systemPrompt },
      { role: 'user',   content: args.userPrompt },
    ];

    const primaryProvider = env.AGENT_LLM_PROVIDER.toLowerCase();
    const fallbacks = parseFallbackChain(env.AGENT_LLM_FALLBACK_CHAIN);
    // De-dupe: primary goes first, then the rest of the fallback chain
    const providersToTry = Array.from(new Set([primaryProvider, ...fallbacks]));

    let lastError = 'No providers configured';

    for (const provider of providersToTry) {
      try {
        console.log(`[AI Orchestrator] Task "${args.taskName}" → provider: ${provider}`);
        const result = await callProvider(provider, messages, env);

        // Audit success
        await ctx.runMutation(api.interactionSessions.logAudit, {
          action: 'ai_orchestration_success',
          status: 'success',
          metadata: JSON.stringify({ task: args.taskName, provider }),
        });

        return { ok: true as const, provider, result };

      } catch (err: any) {
        lastError = err?.message ?? String(err);
        console.error(`[AI Orchestrator] Provider "${provider}" failed:`, lastError);

        // Audit fallback event (best-effort — don't throw if audit itself fails)
        try {
          await ctx.runMutation(api.interactionSessions.logAudit, {
            action: 'ai_orchestration_fallback',
            status: 'failure',
            metadata: JSON.stringify({ task: args.taskName, failedProvider: provider, error: lastError }),
          });
        } catch { /* swallow audit errors so fallback loop continues */ }
      }
    }

    // All providers exhausted
    return { ok: false as const, error: `All ${providersToTry.length} AI providers failed. Last error: ${lastError}` };
  },
});
