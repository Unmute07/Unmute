import type {
  AiResult,
  JobAnalysis,
  InterviewQuestionSet,
  AnswerEvaluation,
  AnswerEvaluationContext,
  DeliveryEvaluation,
  FollowUpContext,
  FollowUpTranscriptItem,
  InterviewSummary,
  InterviewRecordLike,
  InterviewTranscriptItem,
  QuestionCount,
} from "@/services/ai.service";

async function callAiRoute<T>(action: string, payload: unknown): Promise<AiResult<T>> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    return (await response.json()) as AiResult<T>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the AI service.";
    return { success: false, error: message };
  }
}

export async function analyzeJobDescription(jobDescription: string): Promise<AiResult<JobAnalysis>> {
  return callAiRoute<JobAnalysis>("analyzeJobDescription", { jobDescription });
}

export async function generateInterviewQuestions(
  jobDescription: string,
  role: string,
  experienceLevel: string,
  interviewType: string,
  questionCount?: QuestionCount,
  difficulty?: string,
  resumeText?: string,
  avoidQuestions?: string[],
  includeFollowUps?: boolean,
): Promise<AiResult<InterviewQuestionSet>> {
  return callAiRoute<InterviewQuestionSet>("generateInterviewQuestions", {
    jobDescription,
    role,
    experienceLevel,
    interviewType,
    questionCount,
    difficulty,
    resumeText,
    avoidQuestions,
    includeFollowUps,
  });
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  context?: AnswerEvaluationContext,
): Promise<AiResult<AnswerEvaluation>> {
  return callAiRoute<AnswerEvaluation>("evaluateAnswer", { question, answer, context });
}

export async function evaluateSpokenDelivery(
  question: string,
  audioBase64: string,
  mimeType: string,
): Promise<AiResult<DeliveryEvaluation>> {
  return callAiRoute<DeliveryEvaluation>("evaluateSpokenDelivery", { question, audioBase64, mimeType });
}

export async function transcribeAnswer(audioBase64: string, mimeType: string): Promise<AiResult<{ text: string }>> {
  return callAiRoute<{ text: string }>("transcribeAnswer", { audioBase64, mimeType });
}

export async function generateInterviewSummary(
  interview: InterviewRecordLike,
  transcript: InterviewTranscriptItem[],
): Promise<AiResult<InterviewSummary>> {
  return callAiRoute<InterviewSummary>("generateInterviewSummary", { interview, transcript });
}

export async function generateFollowUpQuestion(
  transcript: FollowUpTranscriptItem[],
  context?: FollowUpContext,
): Promise<AiResult<{ question: string }>> {
  return callAiRoute<{ question: string }>("generateFollowUpQuestion", { transcript, context });
}
