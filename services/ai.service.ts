import { GoogleGenAI, ApiError } from "@google/genai";

import type { QuestionCount } from "@/types/interview";

export type { QuestionCount };

export type AiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface JobAnalysis {
  companySummary: string;
  requiredSkills: string[];
  responsibilities: string[];
  difficulty: "easy" | "medium" | "hard" | "unknown";
  interviewFocusAreas: string[];
  summary?: string;
  keyResponsibilities?: string[];
  suggestedFocusAreas?: string[];
  fitScore?: number;
}

export interface InterviewQuestionSet {
  technical: string[];
  behavioural: string[];
  hr: string[];
  followUps: string[];
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  weaknesses: string[];
  confidence: number;
  communication: number;
  technicalAccuracy: number;
  behavioral: number;
  leadership: number;
  problemSolving: number;
  englishProficiency: number;
  englishFeedback?: string;
  englishIssues?: string[];
  suggestedAnswer: string;
  feedback?: string;
  improvements?: string[];
}

export interface InterviewSummary {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
}

export interface InterviewRecordLike {
  company?: string;
  role?: string;
  experienceLevel?: string;
  interviewType?: string;
  jobDescription?: string;
  status?: string;
  createdAt?: string | Date | { seconds: number; nanoseconds: number } | { toDate: () => Date };
  updatedAt?: string | Date | { seconds: number; nanoseconds: number } | { toDate: () => Date };
}

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

const TEXT_MODEL = "gemini-flash-latest";
// Higher-volume, lower-judgment calls (parsing a job description, drafting question
// text) don't need TEXT_MODEL's full reasoning depth. This lighter sibling model
// is faster and cheaper, cutting down on the 429-triggered retry delays those
// calls were hitting, while staying in the same model family so JSON output
// behavior stays consistent.
const FAST_TEXT_MODEL = "gemini-flash-lite-latest";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function getErrorStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = getErrorStatus(error);
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      console.error(`[ai] Gemini call failed (attempt ${attempt}/${MAX_ATTEMPTS})`, status ?? error);
      if (isLastAttempt || !status || !RETRYABLE_STATUSES.has(status)) {
        throw error;
      }
      // 429s are rate limits on a rolling per-minute window — a short backoff rarely
      // clears them, so wait meaningfully longer than the 5xx "try again shortly" case.
      const delay = status === 429 ? 5000 * attempt : RETRY_DELAY_MS * attempt;
      await sleep(delay);
    }
  }
  throw new Error("Unreachable");
}

async function generateContent(prompt: string, model: string = TEXT_MODEL): Promise<string> {
  const client = getGeminiClient();
  const response = await withRetry(() =>
    client.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  );

  return response.text?.trim() ?? "";
}

async function generateContentFromAudio(prompt: string, audioBase64: string, mimeType: string, model: string = TEXT_MODEL): Promise<string> {
  const client = getGeminiClient();
  const response = await withRetry(() =>
    client.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }, { inlineData: { mimeType, data: audioBase64 } }],
        },
      ],
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  );

  return response.text?.trim() ?? "";
}

async function transcribeAudio(audioBase64: string, mimeType: string): Promise<{ text: string }> {
  const client = getGeminiClient();
  const response = await withRetry(() =>
    client.models.generateContent({
      model: FAST_TEXT_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: "Transcribe this audio exactly as spoken. Output only the raw transcript text, with no commentary, labels, or formatting." },
            { inlineData: { mimeType, data: audioBase64 } },
          ],
        },
      ],
    }),
  );

  return { text: response.text?.trim() ?? "" };
}

export async function transcribeAnswer(audioBase64: string, mimeType: string): Promise<AiResult<{ text: string }>> {
  try {
    const transcript = await transcribeAudio(audioBase64, mimeType);

    if (!transcript.text) {
      return { success: false, error: "Could not detect any speech in the recording. Please try again." };
    }

    return { success: true, data: { text: transcript.text } };
  } catch (error) {
    console.error("[ai] transcribeAnswer failed", getFriendlyErrorMessage(error), error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

function getFriendlyErrorMessage(error: unknown): string {
  const status = getErrorStatus(error);

  if (status === 429) {
    return "The AI service is receiving too many requests right now. Please wait a minute and try again.";
  }
  if (status === 401 || status === 403) {
    return "The AI service rejected the request. Please contact support if this continues.";
  }
  if (typeof status === "number" && status >= 500) {
    return "The AI service is temporarily unavailable. Please try again shortly.";
  }

  if (error instanceof Error && !error.message.trim().startsWith("{")) {
    return error.message;
  }

  return "Something went wrong while contacting the AI service. Please try again.";
}

function parseJsonResponse<T>(rawResponse: string): T | null {
  if (!rawResponse) {
    return null;
  }

  const sanitized = rawResponse
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  try {
    return JSON.parse(sanitized) as T;
  } catch {
    // Fall back to the outermost {...} span, in case any stray preamble or
    // commentary (e.g. leaked reasoning) surrounds the actual JSON object.
    const start = sanitized.indexOf("{");
    const end = sanitized.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    try {
      return JSON.parse(sanitized.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

async function runGeminiJson<T>(prompt: string, model?: string): Promise<AiResult<T>> {
  try {
    const rawResponse = await generateContent(prompt, model);
    const parsed = parseJsonResponse<T>(rawResponse);

    if (!parsed) {
      console.error("[ai] Gemini returned unparseable JSON", rawResponse.slice(0, 500));
      return { success: false, error: "The AI model returned an unexpected response format." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error("[ai] runGeminiJson failed", getFriendlyErrorMessage(error), error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

// Job descriptions pasted from job boards are often the same listing scraped
// from several sources concatenated together — repeated paragraphs and inline
// citation links like "[1] (https://...)" that burn tokens without adding
// signal. This app runs two AI calls in parallel on job description text
// (analyzeJobDescription + generateInterviewQuestions), so trimming it keeps
// both comfortably under Gemini's per-minute token limit and gives the model
// cleaner input to reason over.
const MAX_JOB_DESCRIPTION_CHARS = 6000;

function sanitizeJobDescription(jobDescription: string): string {
  const withoutCitations = jobDescription
    .replace(/\[\d+\]\s*\(https?:\/\/[^\s)]+\)/g, "")
    .replace(/https?:\/\/\S+/g, "");
  const collapsedWhitespace = withoutCitations.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  const seen = new Set<string>();
  const deduped = collapsedWhitespace
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => {
      const key = sentence.trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");

  return deduped.length > MAX_JOB_DESCRIPTION_CHARS ? `${deduped.slice(0, MAX_JOB_DESCRIPTION_CHARS)}…` : deduped;
}

export async function analyzeJobDescription(rawJobDescription: string): Promise<AiResult<JobAnalysis>> {
  const jobDescription = sanitizeJobDescription(rawJobDescription);
  const prompt = `You are a senior recruiting strategist. Analyze the following job description and return valid JSON only matching this schema:
{
  "companySummary": "string",
  "requiredSkills": ["string"],
  "responsibilities": ["string"],
  "difficulty": "easy|medium|hard|unknown",
  "interviewFocusAreas": ["string"]
}

Job description:
${jobDescription}`;

  return runGeminiJson<JobAnalysis>(prompt, FAST_TEXT_MODEL);
}

type QuestionSplit = { technical: number; behavioural: number; hr: number; followUps: number };

// Largest-remainder rounding: distributes `total` across `weights` (need not sum to 1)
// so the resulting integer counts sum exactly to `total`.
function distributeByWeights(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const raw = weights.map((weight) => (total * weight) / weightSum);
  const floors = raw.map(Math.floor);
  const allocated = floors.reduce((sum, value) => sum + value, 0);
  let remainder = total - allocated;

  const byRemainingFraction = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  const counts = [...floors];
  for (const { index } of byRemainingFraction) {
    if (remainder <= 0) break;
    counts[index] += 1;
    remainder -= 1;
  }

  return counts;
}

const MIXED_WEIGHTS = { technical: 0.4, behavioural: 0.3, hr: 0.2, followUps: 0.1 };

function computeMixedSplit(questionCount: number, includeFollowUps: boolean): QuestionSplit {
  if (!includeFollowUps) {
    const [technical, behavioural, hr] = distributeByWeights(questionCount, [
      MIXED_WEIGHTS.technical,
      MIXED_WEIGHTS.behavioural,
      MIXED_WEIGHTS.hr,
    ]);
    return { technical, behavioural, hr, followUps: 0 };
  }

  const [technical, behavioural, hr, followUps] = distributeByWeights(questionCount, [
    MIXED_WEIGHTS.technical,
    MIXED_WEIGHTS.behavioural,
    MIXED_WEIGHTS.hr,
    MIXED_WEIGHTS.followUps,
  ]);
  return { technical, behavioural, hr, followUps };
}

function getQuestionSplit(questionCount: QuestionCount, interviewType: string, includeFollowUps: boolean): QuestionSplit {
  switch (interviewType) {
    case "Technical":
      return { technical: questionCount, behavioural: 0, hr: 0, followUps: 0 };
    case "Behavioral":
      return { technical: 0, behavioural: questionCount, hr: 0, followUps: 0 };
    case "HR":
      return { technical: 0, behavioural: 0, hr: questionCount, followUps: 0 };
    default:
      return computeMixedSplit(questionCount, includeFollowUps);
  }
}

const DIFFICULTY_INSTRUCTIONS: Record<string, string> = {
  Medium: "All questions should be medium difficulty — solid, realistic questions for this experience level, not entry-level softballs.",
  Hard: "All questions should be hard — push into edge cases, ambiguity, deeper tradeoffs, and follow-up-worthy depth appropriate for this experience level.",
  Mixed: "Vary difficulty across medium and hard — no easy/entry-level softball questions.",
};

export async function generateInterviewQuestions(
  rawJobDescription: string,
  role: string,
  experienceLevel: string,
  interviewType: string,
  questionCount: QuestionCount = 10,
  difficulty: string = "Mixed",
  resumeText?: string,
  avoidQuestions?: string[],
  includeFollowUps: boolean = true,
): Promise<AiResult<InterviewQuestionSet>> {
  const jobDescription = sanitizeJobDescription(rawJobDescription);
  const split = getQuestionSplit(questionCount, interviewType, includeFollowUps);
  const emptyCategories = (Object.entries(split) as Array<[keyof QuestionSplit, number]>)
    .filter(([, count]) => count === 0)
    .map(([category]) => category);
  const difficultyInstruction = DIFFICULTY_INSTRUCTIONS[difficulty] ?? DIFFICULTY_INSTRUCTIONS.Mixed;
  const resumeBlock = resumeText
    ? `

Candidate resume (use this to tailor questions to their actual background — probe both the overlap between their experience and this role, and any gaps between what the job needs and what their resume shows):
${resumeText}`
    : "";
  const avoidBlock = avoidQuestions?.length
    ? `

The candidate has already been asked these questions in previous sessions — do not repeat them or ask close rephrasings of them, generate genuinely different questions instead:
${avoidQuestions.map((q) => `- ${q}`).join("\n")}`
    : "";

  const prompt = `You are an interview coach. Generate exactly ${questionCount} tailored interview questions for the role and experience level, split as: ${split.technical} technical, ${split.behavioural} behavioural, ${split.hr} HR, ${split.followUps} follow-up. Return valid JSON only matching this schema, with each array containing exactly the counts specified above.${
    emptyCategories.length
      ? ` The interview type is "${interviewType}", so leave these arrays completely empty (do not put any questions in them): ${emptyCategories.join(", ")}.`
      : ""
  } ${difficultyInstruction}
{
  "technical": ["string"],
  "behavioural": ["string"],
  "hr": ["string"],
  "followUps": ["string"]
}

Role: ${role}
Experience level: ${experienceLevel}
Interview type: ${interviewType}
Job description:
${jobDescription}${resumeBlock}${avoidBlock}`;

  return runGeminiJson<InterviewQuestionSet>(prompt, FAST_TEXT_MODEL);
}

export interface AnswerEvaluationContext {
  role?: string;
  experienceLevel?: string;
  interviewType?: string;
  jobDescription?: string;
  resumeText?: string;
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  context?: AnswerEvaluationContext,
): Promise<AiResult<AnswerEvaluation>> {
  const contextBlock = context?.role || context?.jobDescription
    ? `Role context (use this to judge whether claims in the answer are accurate and relevant to what this job actually requires — do not give credit for correct-sounding but irrelevant or generic content):
Role: ${context.role ?? "unspecified"}
Experience level: ${context.experienceLevel ?? "unspecified"}
Interview type: ${context.interviewType ?? "unspecified"}
Job description: ${context.jobDescription ?? "unspecified"}
${context.resumeText ? `Candidate resume (use this to judge whether claimed experience is consistent with their actual background): ${context.resumeText}\n` : ""}
`
    : "";

  const prompt = `You are a senior interview coach known for detailed, specific, evidence-based feedback — never vague or generic. Evaluate this interview answer and return valid JSON only matching this schema (all numeric fields 0-100):
{
  "score": 0,
  "strengths": ["string"],
  "weaknesses": ["string"],
  "confidence": 0,
  "communication": 0,
  "technicalAccuracy": 0,
  "behavioral": 0,
  "leadership": 0,
  "problemSolving": 0,
  "englishProficiency": 0,
  "englishFeedback": "string",
  "englishIssues": ["string"],
  "suggestedAnswer": "string",
  "feedback": "string",
  "improvements": ["string"]
}

Rules for detailed, accurate feedback:
- "strengths" and "weaknesses" must each contain 2-4 specific observations that quote or closely paraphrase a specific phrase or claim from the answer — never generic filler like "good communication" or "could be more detailed" on their own.
- If the candidate demonstrates concrete, relevant hands-on experience for this specific role (named tools, real examples, specifics of scope/impact), call that out explicitly as a strength and weight technicalAccuracy and score accordingly. If claims are vague, unsupported, or don't match what this role actually needs, call that out explicitly as a weakness rather than scoring it generously.
- "feedback" should be a 3-5 sentence paragraph giving an honest, specific assessment of this exact answer — what was said, what was missing, and how it would land with a real interviewer for this role.
- "improvements" must list 2-3 concrete, actionable changes specific to this answer (not generic interview advice).
- "suggestedAnswer" must be a rewrite of the candidate's OWN answer, not a fabricated, unrelated scenario. Preserve every real, specific detail they gave — company/project names, technologies, numbers, people, events — and restructure and expand around those same facts (e.g. tighten it into a clear STAR structure, add the missing outcome/impact). Only invent plausible specifics to fill genuine gaps (e.g. a concrete tool name or metric) when the candidate's answer gave you nothing to build on for that detail. Never swap in a different company, project, or storyline than the one the candidate actually described.
- Score "behavioral", "leadership", and "problemSolving" based on the substance and delivery of the answer itself (ownership, collaboration, decision-making, structured reasoning), regardless of whether the question was explicitly categorized as technical, behavioral, or HR.
- "englishProficiency" scores the written English of the transcript itself — grammar correctness, vocabulary range, sentence construction, and coherence/fluency. Judge only the language quality, not the content's correctness or relevance (that's covered by the other scores), and not accent or pronunciation (this is a text transcript). A short but grammatically clean answer should score higher than a longer answer full of grammar errors or awkward phrasing.
- "englishFeedback" must be a 2-4 sentence assessment specifically of this answer's English — call out concrete patterns you noticed (e.g. verb tense consistency, article usage, run-on sentences, word choice, sentence variety), not a restatement of the numeric score. If the English is already strong, say so specifically rather than inventing problems.
- "englishIssues" must list 2-4 specific grammar, vocabulary, or phrasing problems actually present in the answer, each as one string quoting the exact problematic phrase from the answer followed by the corrected version and a short reason (e.g. \`"I have did the project" should be "I did the project" — past tense, not present perfect + past\`). If the answer has no real English issues, return an empty array instead of manufacturing minor nitpicks.

${contextBlock}Question:
${question}

Answer:
${answer}`;

  return runGeminiJson<AnswerEvaluation>(prompt);
}

export interface FollowUpContext {
  role?: string;
  experienceLevel?: string;
  jobDescription?: string;
}

export interface FollowUpTranscriptItem {
  question: string;
  answer: string;
}

export async function generateFollowUpQuestion(
  transcript: FollowUpTranscriptItem[],
  context?: FollowUpContext,
): Promise<AiResult<{ question: string }>> {
  const answered = transcript.filter((item) => item.answer.trim().length > 0);
  const mostRecent = answered[answered.length - 1];
  const earlierHistory = answered.slice(0, -1);

  const prompt = `You are conducting a live mock interview. The candidate just answered the question below — generate exactly ONE natural follow-up question that digs deeper into THIS specific answer: probe a specific claim they made, ask for more detail on a decision, or push on a gap or weak spot. Do not ask a generic question, and do not follow up on an earlier answer instead — it must clearly build on what they just said. Return valid JSON only matching this schema:
{
  "question": "string"
}

Role: ${context?.role ?? "unspecified"}
Experience level: ${context?.experienceLevel ?? "unspecified"}
Job description: ${context?.jobDescription ?? "unspecified"}
${
  earlierHistory.length
    ? `
Earlier in the interview (context only — do not follow up on these):
${earlierHistory.map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`).join("\n\n")}
`
    : ""
}
The question they just answered:
${mostRecent?.question ?? ""}

Their answer:
${mostRecent?.answer ?? ""}`;

  return runGeminiJson<{ question: string }>(prompt);
}

export interface InterviewTranscriptItem {
  question: string;
  answer: string;
  evaluation?: AnswerEvaluation;
}

function formatTranscript(transcript: InterviewTranscriptItem[]): string {
  return transcript
    .map((item, index) => {
      const evaluation = item.evaluation;
      const evaluationBlock = evaluation
        ? `Score: ${evaluation.score}/100
Strengths noted: ${evaluation.strengths?.join("; ") || "none"}
Weaknesses noted: ${evaluation.weaknesses?.join("; ") || "none"}`
        : "Score: not evaluated";

      return `Question ${index + 1}: ${item.question}
Answer: ${item.answer || "(no answer given)"}
${evaluationBlock}`;
    })
    .join("\n\n");
}

export async function generateInterviewSummary(
  interview: InterviewRecordLike,
  transcript: InterviewTranscriptItem[],
): Promise<AiResult<InterviewSummary>> {
  const prompt = `You are a senior interview coach reviewing a full mock interview transcript. Write a concise, evidence-based coaching summary. Return valid JSON only matching this schema:
{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "nextSteps": ["string"]
}

Rules:
- Base every claim on the actual questions and answers below — never invent generic feedback that could apply to any interview.
- "summary" (3-5 sentences) must reference specific moments from this transcript — what went well, what didn't, and the overall impression a real interviewer would form.
- "strengths" and "weaknesses" must each list 2-4 specific, transcript-grounded observations (reference which question/topic they relate to), not vague filler.
- "nextSteps" must be 2-4 concrete actions tied to the lowest-scoring or weakest answers in this transcript specifically.

Role: ${interview.role ?? "unspecified"}
Experience level: ${interview.experienceLevel ?? "unspecified"}
Company: ${interview.company ?? "unspecified"}
Interview type: ${interview.interviewType ?? "unspecified"}

Transcript:
${formatTranscript(transcript)}`;

  return runGeminiJson<InterviewSummary>(prompt);
}

export interface DeliveryEvaluation {
  paceAssessment: "too slow" | "slightly slow" | "good pace" | "slightly fast" | "too fast";
  estimatedWordsPerMinute: number;
  fillerWordCount: number;
  fillerWordExamples: string[];
  clarityScore: number;
  vocalConfidenceScore: number;
  deliveryFeedback: string;
  improvementTips: string[];
}

export async function evaluateSpokenDelivery(
  question: string,
  audioBase64: string,
  mimeType: string,
): Promise<AiResult<DeliveryEvaluation>> {
  // Gemini can listen to the audio directly, so pacing/filler-word/clarity/vocal-
  // confidence assessment runs off real acoustic signal rather than a text transcript.
  const prompt = `You are a speech and presentation coach. Listen to this recorded interview answer for the question below and assess ONLY the spoken delivery — pacing, filler words ("um", "like", "you know", etc.), pronunciation/articulation clarity, and vocal confidence (steadiness of tone, hesitation). Do not judge the correctness or content of the answer. Return valid JSON only matching this schema (scores 0-100):
{
  "paceAssessment": "too slow|slightly slow|good pace|slightly fast|too fast",
  "estimatedWordsPerMinute": 0,
  "fillerWordCount": 0,
  "fillerWordExamples": ["string"],
  "clarityScore": 0,
  "vocalConfidenceScore": 0,
  "deliveryFeedback": "string",
  "improvementTips": ["string"]
}

Question: ${question}`;

  try {
    const rawResponse = await generateContentFromAudio(prompt, audioBase64, mimeType);
    const parsed = parseJsonResponse<DeliveryEvaluation>(rawResponse);

    if (!parsed) {
      console.error("[ai] Gemini returned unparseable JSON (spoken delivery)", rawResponse.slice(0, 500));
      return { success: false, error: "The AI model returned an unexpected response format." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error("[ai] evaluateSpokenDelivery failed", getFriendlyErrorMessage(error), error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}
