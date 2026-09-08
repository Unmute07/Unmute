import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { AnswerEvaluation, DeliveryEvaluation, InterviewQuestionSet } from "@/services/ai.service";
import {
  SKILL_KEYS,
  type InterviewDocument,
  type InterviewFeedback,
  type InterviewQuestion,
  type InterviewStatus,
  type QuestionDifficulty,
  type SkillKey,
} from "@/types/interview";

const INTERVIEW_TYPE_TO_BUCKETS: Record<string, Array<keyof InterviewQuestionSet>> = {
  Technical: ["technical"],
  Behavioral: ["behavioural"],
  HR: ["hr"],
  Mixed: ["technical", "behavioural", "hr", "followUps"],
};

const BUCKET_METADATA: Record<keyof InterviewQuestionSet, { idPrefix: string; category: string; difficulty: string }> = {
  technical: { idPrefix: "technical", category: "Technical", difficulty: "medium" },
  behavioural: { idPrefix: "behavioural", category: "Behavioral", difficulty: "medium" },
  hr: { idPrefix: "hr", category: "HR", difficulty: "medium" },
  followUps: { idPrefix: "followup", category: "Follow-up", difficulty: "hard" },
};

export function buildInterviewQuestions(
  questionSet: InterviewQuestionSet,
  interviewType: string,
  difficulty: QuestionDifficulty,
): InterviewQuestion[] {
  // Client-side safety net: only pull from the buckets that match the selected
  // interview type, in case the model still returns questions in other buckets.
  const buckets = INTERVIEW_TYPE_TO_BUCKETS[interviewType] ?? INTERVIEW_TYPE_TO_BUCKETS.Mixed;
  const uniformDifficulty = difficulty === "Mixed" ? null : difficulty.toLowerCase();
  // Unique per call (not just per bucket index) so a later top-up batch — e.g. filling
  // out a session that never reached its selected question count — can't collide with
  // ids already in use from the initial generation.
  const runToken = Date.now();

  return buckets.flatMap((bucket) => {
    const { idPrefix, category, difficulty: bucketDifficulty } = BUCKET_METADATA[bucket];
    return questionSet[bucket].map((question, index) => ({
      id: `${idPrefix}-${runToken}-${index}`,
      question,
      category,
      difficulty: uniformDifficulty ?? bucketDifficulty,
      rationale: "Generated from the job description and role context.",
    }));
  });
}

export function subscribeToInterviews(
  uid: string,
  onData: (interviews: InterviewDocument[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const interviewsQuery = query(collection(db, "users", uid, "interviews"), orderBy("createdAt", "desc"));

  return onSnapshot(
    interviewsQuery,
    (snapshot) => {
      const interviews = snapshot.docs.map((docSnapshot) =>
        normalizeInterviewDoc(docSnapshot.id, docSnapshot.data()),
      );
      onData(interviews);
    },
    onError,
  );
}

export function normalizeInterviewDoc(id: string, data: DocumentData): InterviewDocument {
  return {
    id,
    company: data.company ?? "",
    role: data.role ?? "",
    experienceLevel: data.experienceLevel ?? "",
    interviewType: data.interviewType ?? "",
    jobDescription: data.jobDescription ?? "",
    status: (data.status as InterviewStatus | undefined) ?? "analyzing",
    // Interviews created before the practice/mock split default to "mock" — they
    // were all pre-generated, full-feedback-at-the-end sessions, which is what "mock" means here.
    mode: (data.mode as InterviewDocument["mode"] | undefined) ?? "mock",
    difficulty: (data.difficulty as InterviewDocument["difficulty"] | undefined) ?? "Mixed",
    resumeText: data.resumeText,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    completedAt: data.completedAt,
    // Interviews created before this cap existed have no stored target — fall back to
    // however many questions they already have, so the cap is a no-op for those sessions.
    targetQuestionCount: data.targetQuestionCount ?? data.questions?.length ?? 0,
    questions: data.questions ?? [],
    answers: data.answers ?? {},
    audioUrls: data.audioUrls ?? {},
    evaluations: data.evaluations ?? {},
    feedback: data.feedback ?? {},
    analysis: data.analysis,
  };
}

export function computeFeedbackScores(
  items: Array<{ evaluation?: AnswerEvaluation }>,
): Pick<
  InterviewFeedback,
  | "overallScore"
  | "communicationScore"
  | "technicalScore"
  | "behavioralScore"
  | "leadershipScore"
  | "problemSolvingScore"
  | "confidenceScore"
  | "englishProficiencyScore"
> {
  const evaluations = items.map((item) => item.evaluation).filter((item): item is AnswerEvaluation => Boolean(item));

  if (!evaluations.length) {
    return {
      overallScore: 0,
      communicationScore: 0,
      technicalScore: 0,
      behavioralScore: 0,
      leadershipScore: 0,
      problemSolvingScore: 0,
      confidenceScore: 0,
      englishProficiencyScore: 0,
    };
  }

  const average = (values: number[]) => Math.round(values.reduce((total, value) => total + value, 0) / values.length);

  return {
    overallScore: average(evaluations.map((item) => item.score)),
    communicationScore: average(evaluations.map((item) => item.communication)),
    technicalScore: average(evaluations.map((item) => item.technicalAccuracy)),
    behavioralScore: average(evaluations.map((item) => item.behavioral)),
    leadershipScore: average(evaluations.map((item) => item.leadership)),
    problemSolvingScore: average(evaluations.map((item) => item.problemSolving)),
    confidenceScore: average(evaluations.map((item) => item.confidence)),
    englishProficiencyScore: average(evaluations.map((item) => item.englishProficiency)),
  };
}

export type DeliveryScores = {
  clarityScore: number;
  vocalConfidenceScore: number;
  averageWordsPerMinute: number;
  totalFillerWords: number;
  fillerWordExamples: string[];
  deliveryFeedback: string;
  improvementTips: string[];
};

export function computeDeliveryScores(items: Array<{ delivery?: DeliveryEvaluation }>): DeliveryScores | null {
  const evaluations = items.map((item) => item.delivery).filter((item): item is DeliveryEvaluation => Boolean(item));

  if (!evaluations.length) {
    return null;
  }

  const average = (values: number[]) => Math.round(values.reduce((total, value) => total + value, 0) / values.length);

  return {
    clarityScore: average(evaluations.map((item) => item.clarityScore)),
    vocalConfidenceScore: average(evaluations.map((item) => item.vocalConfidenceScore)),
    averageWordsPerMinute: average(evaluations.map((item) => item.estimatedWordsPerMinute)),
    totalFillerWords: evaluations.reduce((total, item) => total + item.fillerWordCount, 0),
    fillerWordExamples: Array.from(new Set(evaluations.flatMap((item) => item.fillerWordExamples))).slice(0, 6),
    deliveryFeedback: evaluations[0]?.deliveryFeedback ?? "",
    improvementTips: Array.from(new Set(evaluations.flatMap((item) => item.improvementTips))).slice(0, 4),
  };
}

function toDate(value: InterviewDocument["createdAt"] | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof (value as { seconds?: number }).seconds === "number") {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  return null;
}

function getIsoWeekKey(date: Date): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + weeks * 7);
  return result;
}

export type Achievement = {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
};

export type Recommendation = {
  skill: SkillKey | null;
  title: string;
  description: string;
};

export type InterviewStats = {
  totalInterviews: number;
  completedInterviews: number;
  completionRate: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scoreDelta: number;
  skillAverages: Record<SkillKey, number>;
  readinessScore: number;
  currentStreak: number;
  bestStreak: number;
  weeklyActivity: Array<{ weekLabel: string; count: number }>;
  recentInterviews: InterviewDocument[];
  scoreTrend: Array<{ name: string; score: number }>;
};

export const EMPTY_STATS: InterviewStats = {
  totalInterviews: 0,
  completedInterviews: 0,
  completionRate: 0,
  averageScore: 0,
  highestScore: 0,
  lowestScore: 0,
  scoreDelta: 0,
  skillAverages: { technical: 0, communication: 0, behavioral: 0, leadership: 0, problemSolving: 0 },
  readinessScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  weeklyActivity: [],
  recentInterviews: [],
  scoreTrend: [],
};

const SKILL_TO_FEEDBACK_FIELD: Record<SkillKey, keyof InterviewFeedback> = {
  technical: "technicalScore",
  communication: "communicationScore",
  behavioral: "behavioralScore",
  leadership: "leadershipScore",
  problemSolving: "problemSolvingScore",
};

export function computeInterviewStats(interviews: InterviewDocument[]): InterviewStats {
  if (!interviews.length) {
    return EMPTY_STATS;
  }

  const completed = interviews
    .filter((interview) => interview.status === "completed" && typeof interview.feedback.overallScore === "number")
    .map((interview) => ({
      interview,
      date: toDate(interview.completedAt ?? interview.updatedAt) ?? new Date(),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const overallScores = completed.map(({ interview }) => interview.feedback.overallScore ?? 0);
  const averageScore = overallScores.length
    ? Math.round(overallScores.reduce((total, score) => total + score, 0) / overallScores.length)
    : 0;
  const highestScore = overallScores.length ? Math.max(...overallScores) : 0;
  const lowestScore = overallScores.length ? Math.min(...overallScores) : 0;
  const completionRate = Math.round((completed.length / interviews.length) * 100);

  const recentThree = completed.slice(-3).map(({ interview }) => interview.feedback.overallScore ?? 0);
  const previousThree = completed.slice(-6, -3).map(({ interview }) => interview.feedback.overallScore ?? 0);
  const avg = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0);
  const scoreDelta = completed.length >= 2 ? Math.round(avg(recentThree) - avg(previousThree)) : 0;

  const skillAverages = SKILL_KEYS.reduce((acc, skill) => {
    const field = SKILL_TO_FEEDBACK_FIELD[skill];
    const values = completed
      .map(({ interview }) => interview.feedback[field])
      .filter((value): value is number => typeof value === "number");
    acc[skill] = values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0;
    return acc;
  }, {} as Record<SkillKey, number>);

  const readinessScore = completed.length === 0 ? 0 : Math.round(0.7 * averageScore + 0.3 * completionRate);

  const weekKeys = new Set(completed.map(({ date }) => getIsoWeekKey(date)));
  const sortedWeekKeys = Array.from(weekKeys).sort();

  let bestStreak = 0;
  let runningStreak = 0;
  let previousWeekDate: Date | null = null;
  for (const weekKey of sortedWeekKeys) {
    const weekEntry = completed.find(({ date }) => getIsoWeekKey(date) === weekKey);
    const weekDate = weekEntry ? weekEntry.date : new Date();
    if (previousWeekDate && getIsoWeekKey(addWeeks(previousWeekDate, 1)) === weekKey) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }
    bestStreak = Math.max(bestStreak, runningStreak);
    previousWeekDate = weekDate;
  }

  const now = new Date();
  const thisWeekKey = getIsoWeekKey(now);
  const lastWeekKey = getIsoWeekKey(addWeeks(now, -1));
  let currentStreak = 0;
  if (sortedWeekKeys.length) {
    const mostRecentWeekKey = sortedWeekKeys[sortedWeekKeys.length - 1];
    if (mostRecentWeekKey === thisWeekKey || mostRecentWeekKey === lastWeekKey) {
      let cursor = mostRecentWeekKey;
      let index = sortedWeekKeys.length - 1;
      while (index >= 0 && sortedWeekKeys[index] === cursor) {
        currentStreak += 1;
        index -= 1;
        const cursorDate = completed.find(({ date }) => getIsoWeekKey(date) === cursor)?.date ?? now;
        cursor = getIsoWeekKey(addWeeks(cursorDate, -1));
      }
    }
  }

  const weeklyActivity: Array<{ weekLabel: string; count: number }> = [];
  for (let i = 7; i >= 0; i -= 1) {
    const weekDate = addWeeks(now, -i);
    const key = getIsoWeekKey(weekDate);
    const count = completed.filter(({ date }) => getIsoWeekKey(date) === key).length;
    weeklyActivity.push({ weekLabel: key, count });
  }

  const recentInterviews = [...interviews]
    .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))
    .slice(0, 5);

  const scoreTrend = completed.slice(-10).map(({ interview }, index) => ({
    name: `#${index + 1}`,
    score: interview.feedback.overallScore ?? 0,
  }));

  return {
    totalInterviews: interviews.length,
    completedInterviews: completed.length,
    completionRate,
    averageScore,
    highestScore,
    lowestScore,
    scoreDelta,
    skillAverages,
    readinessScore,
    currentStreak,
    bestStreak,
    weeklyActivity,
    recentInterviews,
    scoreTrend,
  };
}

const ACHIEVEMENT_RULES: Array<Omit<Achievement, "unlocked"> & { unlock: (stats: InterviewStats) => boolean }> = [
  {
    id: "first-interview",
    label: "First Steps",
    description: "Complete your first mock interview.",
    unlock: (stats) => stats.completedInterviews >= 1,
  },
  {
    id: "five-interviews",
    label: "Getting Consistent",
    description: "Complete 5 mock interviews.",
    unlock: (stats) => stats.completedInterviews >= 5,
  },
  {
    id: "fifteen-interviews",
    label: "Dedicated Practitioner",
    description: "Complete 15 mock interviews.",
    unlock: (stats) => stats.completedInterviews >= 15,
  },
  {
    id: "high-performer",
    label: "High Performer",
    description: "Maintain an average score of 80 or higher.",
    unlock: (stats) => stats.completedInterviews >= 1 && stats.averageScore >= 80,
  },
  {
    id: "two-week-streak",
    label: "On a Roll",
    description: "Practice in 2 consecutive weeks.",
    unlock: (stats) => stats.currentStreak >= 2,
  },
  {
    id: "full-marks",
    label: "Full Marks",
    description: "Score 95 or higher in a single interview.",
    unlock: (stats) => stats.highestScore >= 95,
  },
];

export function getPerformanceLabel(score: number, status: InterviewStatus): "Pending" | "Needs work" | "Improving" | "Strong" {
  if (status !== "completed") return "Pending";
  if (score >= 85) return "Strong";
  if (score >= 70) return "Improving";
  return "Needs work";
}

export function computeAchievements(stats: InterviewStats): Achievement[] {
  return ACHIEVEMENT_RULES.map(({ unlock, ...rule }) => ({ ...rule, unlocked: unlock(stats) }));
}

const RECOMMENDATION_TEMPLATES: Record<SkillKey, Omit<Recommendation, "skill">> = {
  technical: {
    title: "Sharpen technical depth",
    description: "Practice explaining your reasoning step by step and back up claims with concrete examples.",
  },
  communication: {
    title: "Tighten your communication",
    description: "Focus on clear, concise structure — lead with the outcome, then walk through the details.",
  },
  behavioral: {
    title: "Strengthen behavioral stories",
    description: "Use the STAR framework (Situation, Task, Action, Result) to structure your examples.",
  },
  leadership: {
    title: "Highlight leadership impact",
    description: "Emphasize decisions you drove and how you influenced outcomes, even without formal authority.",
  },
  problemSolving: {
    title: "Show your problem-solving process",
    description: "Narrate trade-offs and alternatives you considered before landing on a solution.",
  },
};

export function computeRecommendations(stats: InterviewStats, count = 2): Recommendation[] {
  if (stats.completedInterviews === 0) {
    return [
      {
        skill: null,
        title: "Complete your first interview",
        description: "Finish a mock interview to unlock personalized recommendations based on your performance.",
      },
    ];
  }

  const ranked = SKILL_KEYS.filter((skill) => stats.skillAverages[skill] > 0).sort(
    (a, b) => stats.skillAverages[a] - stats.skillAverages[b],
  );

  return ranked.slice(0, count).map((skill) => ({ skill, ...RECOMMENDATION_TEMPLATES[skill] }));
}
