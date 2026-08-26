import Groq, { toFile } from "groq-sdk";

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
  suggestedAnswer: string;
  feedback?: string;
  improvements?: string[];
}

export interface StudyPlan {
  weeklyPlan: Array<{
    week: string;
    focus: string;
    goals: string[];
    priority: "high" | "medium" | "low";
  }>;
  plan: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
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

let groqClient: Groq | null = null;

function getGroqClient() {
  if (groqClient) {
    return groqClient;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  groqClient = new Groq({ apiKey });
  return groqClient;
}

const TEXT_MODEL = "openai/gpt-oss-120b";
const TRANSCRIPTION_MODEL = "whisper-large-v3-turbo";

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

function getErrorStatus(error: unknown): number | undefined {
  return error && typeof error === "object" && "status" in error ? (error as { status?: number }).status : undefined;
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
      console.error(`[ai] Groq call failed (attempt ${attempt}/${MAX_ATTEMPTS})`, status ?? error);
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

async function generateContent(prompt: string): Promise<string> {
  const client = getGroqClient();
  const response = await withRetry(() =>
    client.chat.completions.create({
      model: TEXT_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  );

  return response.choices[0]?.message?.content?.trim() ?? "";
}

const MIME_TO_EXTENSION: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/m4a": "m4a",
  "audio/x-m4a": "m4a",
};

interface Transcript {
  text: string;
  durationSeconds: number | null;
}

async function transcribeAudio(audioBase64: string, mimeType: string): Promise<Transcript> {
  const client = getGroqClient();
  const buffer = Buffer.from(audioBase64, "base64");
  const extension = MIME_TO_EXTENSION[mimeType] ?? "webm";
  const file = await toFile(buffer, `audio.${extension}`, { type: mimeType });

  const response = await withRetry(() =>
    client.audio.transcriptions.create({
      file,
      model: TRANSCRIPTION_MODEL,
      response_format: "verbose_json",
    }),
  );

  const raw = response as unknown as { text: string; duration?: number };
  return {
    text: raw.text?.trim() ?? "",
    durationSeconds: typeof raw.duration === "number" ? raw.duration : null,
  };
}

function getFriendlyErrorMessage(error: unknown): string {
  const status = error && typeof error === "object" && "status" in error ? (error as { status?: number }).status : undefined;

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
    return null;
  }
}

async function runGroqJson<T>(prompt: string): Promise<AiResult<T>> {
  try {
    const rawResponse = await generateContent(prompt);
    const parsed = parseJsonResponse<T>(rawResponse);

    if (!parsed) {
      console.error("[ai] Groq returned unparseable JSON", rawResponse.slice(0, 500));
      return { success: false, error: "The AI model returned an unexpected response format." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error("[ai] runGroqJson failed", getFriendlyErrorMessage(error), error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}

export async function analyzeJobDescription(jobDescription: string): Promise<AiResult<JobAnalysis>> {
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

  return runGroqJson<JobAnalysis>(prompt);
}

export async function generateInterviewQuestions(
  jobDescription: string,
  role: string,
  experienceLevel: string,
  interviewType: string,
): Promise<AiResult<InterviewQuestionSet>> {
  const prompt = `You are an interview coach. Generate 12-15 tailored interview questions for the role and experience level. Return valid JSON only matching this schema:
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
${jobDescription}`;

  return runGroqJson<InterviewQuestionSet>(prompt);
}

export async function evaluateAnswer(question: string, answer: string): Promise<AiResult<AnswerEvaluation>> {
  const prompt = `Evaluate this interview answer and return valid JSON only matching this schema (all numeric fields 0-100):
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
  "suggestedAnswer": "string",
  "feedback": "string",
  "improvements": ["string"]
}

Score "behavioral", "leadership", and "problemSolving" based on the substance and delivery of the answer itself (ownership, collaboration, decision-making, structured reasoning), regardless of whether the question was explicitly categorized as technical, behavioral, or HR.

Question:
${question}

Answer:
${answer}`;

  return runGroqJson<AnswerEvaluation>(prompt);
}

export async function generateStudyPlan(feedback: string): Promise<AiResult<StudyPlan>> {
  const prompt = `Create a structured weekly study plan to improve interview readiness based on the feedback below. Return valid JSON only matching this schema:
{
  "weeklyPlan": [
    {
      "week": "string",
      "focus": "string",
      "goals": ["string"],
      "priority": "high|medium|low"
    }
  ],
  "plan": [
    {
      "title": "string",
      "description": "string",
      "priority": "high|medium|low"
    }
  ]
}

Feedback:
${feedback}`;

  return runGroqJson<StudyPlan>(prompt);
}

export async function generateInterviewSummary(interview: InterviewRecordLike): Promise<AiResult<InterviewSummary>> {
  const prompt = `Summarize the interview data below into a concise coaching summary. Return valid JSON only matching this schema:
{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "nextSteps": ["string"]
}

Interview data:
${JSON.stringify(interview, null, 2)}`;

  return runGroqJson<InterviewSummary>(prompt);
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
  try {
    const transcript = await transcribeAudio(audioBase64, mimeType);

    if (!transcript.text) {
      return { success: false, error: "Could not transcribe the recorded answer. Please try again." };
    }

    const wordCount = transcript.text.split(/\s+/).filter(Boolean).length;
    const measuredWpm =
      transcript.durationSeconds && transcript.durationSeconds > 0
        ? Math.round(wordCount / (transcript.durationSeconds / 60))
        : null;

    // Groq's Whisper transcription only returns text (plus duration), not audio
    // prosody — so clarity/vocal-confidence here are best-effort estimates from
    // transcript disfluencies and the measured pace, not true acoustic analysis.
    const prompt = `You are a speech and presentation coach. You are given a transcript of a recorded interview answer (not the audio itself) along with its measured words-per-minute. Assess the spoken delivery — pacing, filler words ("um", "like", "you know", etc.), and estimate clarity and vocal confidence from disfluencies, repetitions, and sentence structure in the transcript. Do not judge the correctness or content of the answer. Return valid JSON only matching this schema (scores 0-100):
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

Question: ${question}

Measured words per minute: ${measuredWpm ?? "unknown"}

Transcript:
${transcript.text}`;

    const rawResponse = await generateContent(prompt);
    const parsed = parseJsonResponse<DeliveryEvaluation>(rawResponse);

    if (!parsed) {
      console.error("[ai] Groq returned unparseable JSON (spoken delivery)", rawResponse.slice(0, 500));
      return { success: false, error: "The AI model returned an unexpected response format." };
    }

    if (measuredWpm) {
      parsed.estimatedWordsPerMinute = measuredWpm;
    }

    return { success: true, data: parsed };
  } catch (error) {
    console.error("[ai] evaluateSpokenDelivery failed", getFriendlyErrorMessage(error), error);
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}
