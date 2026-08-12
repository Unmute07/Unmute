import type {
  AiResult,
  JobAnalysis,
  InterviewQuestionSet,
  AnswerEvaluation,
  DeliveryEvaluation,
  StudyPlan,
  InterviewSummary,
  InterviewRecordLike,
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
): Promise<AiResult<InterviewQuestionSet>> {
  return callAiRoute<InterviewQuestionSet>("generateInterviewQuestions", {
    jobDescription,
    role,
    experienceLevel,
    interviewType,
  });
}

export async function evaluateAnswer(question: string, answer: string): Promise<AiResult<AnswerEvaluation>> {
  return callAiRoute<AnswerEvaluation>("evaluateAnswer", { question, answer });
}

export async function evaluateSpokenDelivery(
  question: string,
  audioBase64: string,
  mimeType: string,
): Promise<AiResult<DeliveryEvaluation>> {
  return callAiRoute<DeliveryEvaluation>("evaluateSpokenDelivery", { question, audioBase64, mimeType });
}

export async function generateStudyPlan(feedback: string): Promise<AiResult<StudyPlan>> {
  return callAiRoute<StudyPlan>("generateStudyPlan", { feedback });
}

export async function generateInterviewSummary(interview: InterviewRecordLike): Promise<AiResult<InterviewSummary>> {
  return callAiRoute<InterviewSummary>("generateInterviewSummary", { interview });
}
