import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

/**
 * Enterprise Agent Workflow Engine — CollegeCBT v2.0
 *
 * This module defines the cognitive logic, system instructions, and execution
 * boundaries for the CollegeCBT AI ecosystem:
 *  - Performance Analyst
 *  - Board-Grade Question Generator
 *  - Theory Exam Grader
 *  - Curriculum Intelligence Agent (Crawl4AI-enhanced)
 *
 * All agents go through the orchestrateTask fallback chain (OpenAI → Gemini → DeepSeek → etc.)
 * and optionally enrich their context with real-time web data via Crawl4AI.
 */

// ── Agent Capability Flags ────────────────────────────────────────────────────

interface AgentConfig {
  systemPrompt: string;
  /** If set, Crawl4AI will fetch this URL before calling the LLM. */
  crawlUrl?: (context: string) => string | null;
  /** Whether to skip Crawl4AI enrichment entirely. */
  noCrawl?: boolean;
}

const AGENT_CATALOG: Record<string, AgentConfig> = {

  // ── BOARD-EXPERTISE QUESTION GENERATOR ─────────────────────────────────────
  'board_grade_question_gen': {
    systemPrompt: `You are the "Principal Academic Board Specialist" for CollegeCBT.
    Your mission is to generate high-fidelity, board-accurate examination questions.
    REQUIREMENTS:
    - Strictly match the syllabus and complexity standards of the requested board (WAEC, NECO, JAMB, GCE).
    - Output MUST be valid JSON.
    - Each question must include: 'question', 'options' (A/B/C/D), 'correctAnswer', 'explanation', 'difficulty', 'topic'.
    - For JAMB: Ensure a Reasoning/Logical tilt in distractors.
    - For WAEC: Focus on Application of Principles.
    - Generate exactly the number of questions requested. Do not produce fewer.
    FALLBACK RULE: If topic is outside supported scope, default to general West African curriculum standards.`,

    // Crawl relevant past-question sources for topic context
    crawlUrl: (context: string) => {
      try {
        const ctx = JSON.parse(context);
        if (ctx.board && ctx.topic) {
          return `https://www.waecnigeria.org/resources`;
        }
      } catch { /* context might not be JSON */ }
      return null;
    }
  },

  // ── THEORY EXAM GRADER ─────────────────────────────────────────────────────
  'theory_exam_grader': {
    systemPrompt: `You are the "Senior Academic Evaluator" for theory-based assessments.
    Your mission is to grade student answers with precision and developmental feedback.
    GRADING CRITERIA (100 points total):
    - 40%: Accuracy (Correct facts, definitions, formulae).
    - 30%: Reasoning (Logical flow and argument structure).
    - 30%: Presentation (Clarity, grammar, structural integrity).
    JSON OUTPUT: Array of objects:
    [{ questionId: string, score: number, maxScore: number, specificFeedback: string, modelAnswer: string, strengths: string[], improvements: string[] }]
    TONE: Professional, encouraging, and constructively critical.`,
    noCrawl: true,
  },

  // ── PERFORMANCE ANALYTICS AGENT ────────────────────────────────────────────
  'performance_analyst': {
    systemPrompt: `You are the "Student Success Architect" for CollegeCBT.
    Your mission is to analyze exam session data and identify psychological or academic blockers.
    ANALYZE:
    1. Topic Heatmaps — Where does the student consistently fail or pass?
    2. Pace Analysis — Is the student rushing, or over-thinking?
    3. Motivational Index — Estimate a 0-100 readiness score based on consistency.
    4. Actionable Roadmap — Which subjects to prioritize in the next 72 hours?
    JSON OUTPUT: {
      strengths: string[],
      weaknesses: string[],
      nextSteps: string[],
      motivationScore: number,
      heatmap: { topic: string, pct: number, color: string, label: string }[],
      chartData: number[]
    }`,
    noCrawl: true,
  },

  // ── CURRICULUM INTELLIGENCE AGENT (Crawl4AI-enhanced) ─────────────────────
  'curriculum_intel': {
    systemPrompt: `You are the "Curriculum Intelligence Architect" for CollegeCBT.
    You are given live crawled content from Nigerian academic sources.
    Your mission is to:
    1. Extract the current syllabus topics for the requested course and institution type.
    2. Identify high-priority exam areas based on frequency and board emphasis.
    3. Return a structured curriculum map.
    JSON OUTPUT: {
      course: string,
      institution: string,
      topics: { name: string, priority: "high" | "medium" | "low", estimatedQuestionWeight: number }[],
      examFocus: string[]
    }`,
    crawlUrl: () => 'https://www.waecnigeria.org/resources',
  },

};

// ── Crawl4AI Context Enrichment Helper ───────────────────────────────────────

/**
 * Attempts to fetch real-time web context for an agent via Crawl4AI.
 * Falls back to empty string gracefully — never blocks the agent.
 */
async function fetchCrawlContext(url: string): Promise<string> {
  const apiUrl = process.env.CRAWL4AI_API_URL;
  const apiSecret = process.env.CRAWL4AI_API_SECRET;

  if (!apiUrl || !apiSecret) {
    console.warn('[Agent Workflow] Crawl4AI not configured — skipping web enrichment.');
    return '';
  }

  try {
    const resp = await fetch(`${apiUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiSecret}`,
      },
      body: JSON.stringify({ url, markdown_only: true }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!resp.ok) {
      console.warn(`[Agent Workflow] Crawl4AI returned ${resp.status} for ${url}`);
      return '';
    }

    const data = await resp.json() as { markdown?: string; content?: string };
    const text = data.markdown || data.content || '';
    // Truncate to ~3000 chars to fit LLM context window gracefully
    return text.slice(0, 3000);
  } catch (err: any) {
    console.warn(`[Agent Workflow] Crawl4AI enrichment failed (non-critical):`, err.message);
    return '';
  }
}

// ── Primary Agent Action ──────────────────────────────────────────────────────

/**
 * runAgentTask — The primary entry point for all AI feature triggers.
 *
 * Flow:
 * 1. Validate agent exists in catalog.
 * 2. Optionally enrich context with Crawl4AI live web data.
 * 3. Execute via AI Orchestrator (multi-model fallback chain).
 * 4. Audit log the outcome.
 * 5. Return result or detailed failure message.
 */
export const runAgentTask = action({
  args: {
    agentName: v.string(),
    userContext: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    ok: boolean;
    message?: string;
    agent?: string;
    provider?: string;
    data?: string;
    crawlEnriched?: boolean;
  }> => {
    const config = AGENT_CATALOG[args.agentName];
    if (!config) {
      throw new Error(
        `Agent "${args.agentName}" is not registered. Valid agents: ${Object.keys(AGENT_CATALOG).join(', ')}`
      );
    }

    console.log(`[Agent Workflow] Starting agent: "${args.agentName}"`);

    // ── Step 1: Crawl4AI Context Enrichment ──────────────────────────────────
    let enrichedContext = args.userContext;
    let crawlEnriched = false;

    if (!config.noCrawl && config.crawlUrl) {
      const targetUrl = config.crawlUrl(args.userContext);
      if (targetUrl) {
        const webContext = await fetchCrawlContext(targetUrl);
        if (webContext) {
          enrichedContext = `
[LIVE WEB CONTEXT — Crawl4AI]
Source: ${targetUrl}
---
${webContext}
---

[STUDENT/USER CONTEXT]
${args.userContext}`;
          crawlEnriched = true;
          console.log(`[Agent Workflow] Context enriched with ${webContext.length} chars from ${targetUrl}`);
        }
      }
    }

    // ── Step 2: Execute via AI Orchestrator ──────────────────────────────────
    type OrchestratorResult =
      | { ok: true; provider: string; result: string }
      | { ok: false; error: string };

    const execution = (await ctx.runAction(api.aiOrchestrator.orchestrateTask, {
      taskName: args.agentName,
      systemPrompt: config.systemPrompt,
      userPrompt: enrichedContext,
    })) as OrchestratorResult;

    // ── Step 3: Handle Failure ────────────────────────────────────────────────
    if (!execution.ok) {
      console.error(
        `[Agent Workflow] CRITICAL: All providers failed for task "${args.agentName}".`
      );
      try {
        await ctx.runMutation(api.interactionSessions.logAudit, {
          action: 'agent_task_critical_failure',
          status: 'failure',
          metadata: JSON.stringify({
            agent: args.agentName,
            error: execution.error,
            crawlEnriched,
          }),
        });
      } catch { /* swallow audit errors */ }

      return { ok: false, message: execution.error };
    }

    // ── Step 4: Success Audit ─────────────────────────────────────────────────
    try {
      await ctx.runMutation(api.interactionSessions.logAudit, {
        action: 'agent_task_success',
        status: 'success',
        metadata: JSON.stringify({
          agent: args.agentName,
          provider: execution.provider,
          crawlEnriched,
          resultLength: execution.result.length,
        }),
      });
    } catch { /* swallow audit errors */ }

    return {
      ok: true,
      agent: args.agentName,
      provider: execution.provider,
      data: execution.result,
      crawlEnriched,
    };
  },
});

// ── Agent Catalog Introspection Query ─────────────────────────────────────────

/**
 * Returns the list of available agents — used by admin dashboard and debug tools.
 */
export const listAvailableAgents = action({
  args: {},
  handler: async () => {
    return Object.entries(AGENT_CATALOG).map(([name, config]) => ({
      name,
      hasCrawl: !config.noCrawl && !!config.crawlUrl,
    }));
  },
});
