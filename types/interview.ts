import type { Timestamp } from "firebase/firestore";
import type { JobAnalysis, InterviewSummary, StudyPlan } from "@/services/ai.service";

export type InterviewStatus = "analyzing" | "completed";

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
  deliveryClarityScore?: number;
  deliveryVocalConfidenceScore?: number;
  deliveryAverageWordsPerMinute?: number;
  deliveryTotalFillerWords?: number;
  deliveryFillerWordExamples?: string[];
  deliveryFeedbackText?: string;
  deliveryImprovementTips?: string[];
  summary: InterviewSummary | null;
  studyPlan: StudyPlan | null;
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
  createdAt: FirestoreTimestampLike;
  updatedAt: FirestoreTimestampLike;
  completedAt?: FirestoreTimestampLike;
  questions: InterviewQuestion[];
  answers: Record<string, string>;
  audioUrls?: Record<string, string>;
  feedback: Partial<InterviewFeedback>;
  analysis?: JobAnalysis;
};
