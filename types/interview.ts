import type { Timestamp } from "firebase/firestore";
import type { AnswerEvaluation, JobAnalysis, InterviewSummary } from "@/services/ai.service";

export type InterviewStatus = "analyzing" | "completed";

export type InterviewMode = "practice" | "mock";
export const QUESTION_DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Mixed"] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTY_OPTIONS)[number];

export const QUESTION_COUNT_OPTIONS = [5, 10] as const;
export const MIN_QUESTION_COUNT = 3;
export const MAX_QUESTION_COUNT = 30;
export type QuestionCount = number;

export type InterviewQuestion = {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  rationale: string;
};

export const SKILL_KEYS = [
  "technical",
  "communication",
  "behavioral",
  "leadership",
  "problemSolving",
] as const;

export type SkillKey = (typeof SKILL_KEYS)[number];

export const SKILL_LABELS: Record<SkillKey, string> = {
  technical: "Technical",
  communication: "Communication",
  behavioral: "Behavioral",
  leadership: "Leadership",
  problemSolving: "Problem Solving",
};

export type InterviewFeedback = {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  behavioralScore: number;
  leadershipScore: number;
  problemSolvingScore: number;
  confidenceScore: number;
  englishProficiencyScore: number;
  deliveryClarityScore?: number;
  deliveryVocalConfidenceScore?: number;
  deliveryAverageWordsPerMinute?: number;
  deliveryTotalFillerWords?: number;
  deliveryFillerWordExamples?: string[];
  deliveryFeedbackText?: string;
  deliveryImprovementTips?: string[];
  summary: InterviewSummary | null;
};

export type FirestoreTimestampLike = Timestamp | { seconds: number; nanoseconds: number } | Date;

export type InterviewDocument = {
  id: string;
  company: string;
  role: string;
  experienceLevel: string;
  interviewType: string;
  jobDescription: string;
  status: InterviewStatus;
  mode: InterviewMode;
  difficulty: QuestionDifficulty;
  resumeText?: string;
  createdAt: FirestoreTimestampLike;
  updatedAt: FirestoreTimestampLike;
  completedAt?: FirestoreTimestampLike;
  // Total questions the user selected at setup, including room for live follow-ups —
  // the session stops inserting new follow-ups once `questions.length` reaches this.
  targetQuestionCount: number;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  audioUrls?: Record<string, string>;
  evaluations?: Record<string, AnswerEvaluation>;
  feedback: Partial<InterviewFeedback>;
  analysis?: JobAnalysis;
};
