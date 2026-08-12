import { GoogleGenAI } from "@google/genai";

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

async function generateContent(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
  });

  return response.text?.trim() ?? "";
}

async function generateContentFromAudio(prompt: string, audioBase64: string, mimeType: string): Promise<string> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "gemini-flash-latest",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, { inlineData: { mimeType, data: audioBase64 } }],
      },
    ],
  });

  return response.text?.trim() ?? "";
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

async function runGeminiJson<T>(prompt: string): Promise<AiResult<T>> {
  try {
    const rawResponse = await generateContent(prompt);
    const parsed = parseJsonResponse<T>(rawResponse);

    if (!parsed) {
      return { success: false, error: "The AI model returned an unexpected response format." };
    }

    return { success: true, data: parsed };
  } catch (error) {
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

  return runGeminiJson<JobAnalysis>(prompt);
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

  return runGeminiJson<InterviewQuestionSet>(prompt);
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

  return runGeminiJson<AnswerEvaluation>(prompt);
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

  return runGeminiJson<StudyPlan>(prompt);
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
      return { success: false, error: "The AI model returned an unexpected response format." };
    }

    return { success: true, data: parsed };
  } catch (error) {
    return { success: false, error: getFriendlyErrorMessage(error) };
  }
}
