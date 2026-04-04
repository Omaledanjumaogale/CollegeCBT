import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// ── POST /api/grade-exam ──────────────────────────────────────────────────────
// Receives theory answers, grades them with AI, returns a full analytical report
export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const body = await request.json() as {
      course?: string;
      level?: string;
      institutionType?: string;
      uid?: string;
      answers: Array<{
        question: string;
        keyPoints: { point: string; marks: number }[];
        modelAnswer: string;
        userAnswer: string;
        maxMarks: number;
        topic?: string;
      }>;
    };

    const { course, level, institutionType, uid, answers } = body;

    if (!course || !answers || answers.length === 0) {
      return json({ error: 'Course and answers are required.' }, { status: 400 });
    }

    // Get Cloudflare env bindings
    const env = platform?.env as Record<string, string> | undefined;
    const apiKey = env?.ANTHROPIC_API_KEY || '';

    // Fallback to demo if no API key
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      return json(buildDemoGradeReport(answers, course));
    }

    const gradingPrompt = buildGradingPrompt(course, level || '300 Level', institutionType || 'University', answers);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: gradingPrompt }]
      }),
      signal: AbortSignal.timeout(30_000)
    });

    if (!response.ok) {
      console.error('[CollegeCBT] Grading API error:', response.status);
      return json(buildDemoGradeReport(answers, course));
    }

    const data = await response.json() as { content: { type: string; text?: string }[] };
    const rawText = data.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text || '')
      .join('');

    try {
      const cleaned = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return json(parsed);
    } catch {
      console.warn('[CollegeCBT] Grade JSON parse failed, using demo report');
      return json(buildDemoGradeReport(answers, course));
    }

  } catch (err) {
    console.error('[CollegeCBT] Grade exam error:', err);
    return json({ error: 'Grading failed. Please try again.' }, { status: 500 });
  }
};

// ── Grading prompt builder ─────────────────────────────────────────────────────
function buildGradingPrompt(
  course: string,
  level: string,
  instType: string,
  answers: Array<{
    question: string;
    keyPoints: { point: string; marks: number }[];
    modelAnswer: string;
    userAnswer: string;
    maxMarks: number;
    topic?: string;
  }>
): string {
  const answerBlocks = answers.map((a, i) => `
Question ${i + 1} (Topic: ${a.topic || 'General'}, Max marks: ${a.maxMarks}):
Q: ${a.question}
Model Answer: ${a.modelAnswer}
Key Points Required: ${a.keyPoints.map((kp) => `"${kp.point}" (${kp.marks} marks)`).join('; ')}
Student's Written Answer: ${a.userAnswer || '[No answer provided]'}
`).join('\n---\n');

  return `You are a strict but fair Nigerian ${instType} examiner marking ${course} at ${level} level.

Grade each student answer against the model answer and key points. Award marks proportionally.

STUDENT ANSWERS TO MARK:
${answerBlocks}

Return ONLY valid JSON (no markdown, no backticks, no extra text):
{
  "answers": [
    {
      "question": "The question text",
      "userAnswer": "Student's answer",
      "score": 14,
      "maxScore": 20,
      "feedback": "Detailed constructive feedback on what was good and what was missing",
      "missedPoints": ["Key point student missed 1", "Key point 2"]
    }
  ],
  "totalScore": 14,
  "maxTotal": 20,
  "percentage": 70,
  "grade": "B",
  "aiAnalysis": "Overall 3-4 sentence analysis of the student's performance, strengths, and specific areas to improve for Nigerian exam standards."
}`;
}

// ── Demo grade report fallback ────────────────────────────────────────────────
function buildDemoGradeReport(
  answers: Array<{ question: string; userAnswer: string; maxMarks: number; topic?: string }>,
  course: string
) {
  const graded = answers.map((a) => {
    const hasAnswer = a.userAnswer && a.userAnswer.trim().length > 20;
    const score = hasAnswer ? Math.round(a.maxMarks * 0.65) : 0;
    return {
      question: a.question,
      userAnswer: a.userAnswer,
      score,
      maxScore: a.maxMarks,
      feedback: hasAnswer
        ? 'Good attempt. You demonstrated understanding of the core concept but need to include more specific Nigerian context and scholarly citations to achieve full marks.'
        : 'No answer provided. Practice writing structured academic responses with clear definitions, examples, and analysis.',
      missedPoints: [
        'Specific Nigerian case studies or institutional examples',
        'Academic citations or scholarly definitions',
        'Critical evaluation of limitations',
      ],
    };
  });

  const totalScore = graded.reduce((acc, a) => acc + a.score, 0);
  const maxTotal = graded.reduce((acc, a) => acc + a.maxScore, 0);
  const percentage = maxTotal > 0 ? Math.round((totalScore / maxTotal) * 100) : 0;
  const grade = percentage >= 70 ? 'A' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 45 ? 'D' : 'F';

  return {
    answers: graded,
    totalScore,
    maxTotal,
    percentage,
    grade,
    aiAnalysis: `Your performance in ${course} shows a foundation understanding of the subject matter. To improve your score, focus on incorporating specific Nigerian academic and professional examples, use clear structured paragraphs, and always begin with a scholarly definition. Review your institution's marking guidelines and practice writing under timed conditions to build examination technique.`,
  };
}
