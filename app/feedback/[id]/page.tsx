"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionFeedbackCard } from "@/components/interview/QuestionFeedbackCard";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { evaluateAnswer, evaluateSpokenDelivery, generateInterviewSummary } from "@/services/ai-client";
import type {
  AnswerEvaluation,
  DeliveryEvaluation,
  InterviewRecordLike,
  InterviewSummary,
  InterviewTranscriptItem,
} from "@/services/ai.service";
import { computeDeliveryScores, computeFeedbackScores, normalizeInterviewDoc, type DeliveryScores } from "@/services/interview.service";
import type { InterviewDocument, InterviewFeedback } from "@/types/interview";
import { ENGLISH_RESOURCES } from "@/data/english-resources";

const ENGLISH_PROFICIENCY_THRESHOLD = 65;

type FeedbackItem = {
  id: string;
  question: string;
  answer: string;
  audioUrl?: string;
  evaluation?: AnswerEvaluation;
  delivery?: DeliveryEvaluation;
};

async function audioUrlToBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i += 1) {
      binary += String.fromCharCode(bytes[i]);
    }
    return { base64: btoa(binary), mimeType: blob.type || "audio/webm" };
  } catch {
    return null;
  }
}

async function evaluateDelivery(question: string, audioUrl: string): Promise<DeliveryEvaluation | undefined> {
  const encoded = await audioUrlToBase64(audioUrl);
  if (!encoded) {
    return undefined;
  }

  const result = await evaluateSpokenDelivery(question, encoded.base64, encoded.mimeType);
  return result.success ? result.data : undefined;
}

type OverallFeedbackResult = {
  summary: InterviewSummary | null;
  summaryError: string | null;
};

async function generateOverallFeedback(
  interview: InterviewRecordLike,
  transcript: InterviewTranscriptItem[],
): Promise<OverallFeedbackResult> {
  const summaryResult = await generateInterviewSummary(interview, transcript);
  const summary = summaryResult.success ? summaryResult.data : null;
  const summaryError = summaryResult.success ? null : summaryResult.error;

  return { summary, summaryError };
}

function transcriptFromFeedbackItems(items: FeedbackItem[]): InterviewTranscriptItem[] {
  return items.map((item) => ({ question: item.question, answer: item.answer, evaluation: item.evaluation }));
}

type ScoreCardProps = {
  label: string;
  value: number;
  accent?: string;
};

function ScoreCard({ label, value, accent = "text-primary" }: ScoreCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
      <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}/100</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/70 ${accent}`}>
            <Sparkles className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FeedbackPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [interview, setInterview] = useState<InterviewDocument | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluationsReady, setEvaluationsReady] = useState(false);
  const [cachedFeedback, setCachedFeedback] = useState<Partial<InterviewFeedback> | null>(null);

  const interviewId = params?.id;

  const liveScores = useMemo(() => computeFeedbackScores(feedbackItems), [feedbackItems]);
  const liveDeliveryScores = useMemo(() => computeDeliveryScores(feedbackItems), [feedbackItems]);
  const recordedItems = useMemo(() => feedbackItems.filter((item) => item.audioUrl), [feedbackItems]);
  const hasAnswers = useMemo(() => feedbackItems.some((item) => item.answer.trim().length > 0), [feedbackItems]);
  const attemptedItems = useMemo(() => feedbackItems.filter((item) => item.answer.trim().length > 0), [feedbackItems]);

  const scores = cachedFeedback ?? liveScores;
  const {
    overallScore = 0,
    communicationScore = 0,
    technicalScore = 0,
    behavioralScore = 0,
    leadershipScore = 0,
    problemSolvingScore = 0,
    confidenceScore = 0,
    englishProficiencyScore = 0,
  } = scores;

  const deliveryScores: DeliveryScores | null =
    cachedFeedback?.deliveryClarityScore !== undefined
      ? {
          clarityScore: cachedFeedback.deliveryClarityScore,
          vocalConfidenceScore: cachedFeedback.deliveryVocalConfidenceScore ?? 0,
          averageWordsPerMinute: cachedFeedback.deliveryAverageWordsPerMinute ?? 0,
          totalFillerWords: cachedFeedback.deliveryTotalFillerWords ?? 0,
          fillerWordExamples: cachedFeedback.deliveryFillerWordExamples ?? [],
          deliveryFeedback: cachedFeedback.deliveryFeedbackText ?? "",
          improvementTips: cachedFeedback.deliveryImprovementTips ?? [],
        }
      : liveDeliveryScores;

  useEffect(() => {
    if (!user?.uid || !interviewId) {
      return;
    }

    const ref = doc(db, "users", user.uid, "interviews", interviewId);
    const unsubscribe = onSnapshot(
      ref,
      async (snapshot) => {
        if (!snapshot.exists()) {
          setLoading(false);
          return;
        }

        const data = normalizeInterviewDoc(snapshot.id, snapshot.data());
        setInterview(data);

        const questions = data.questions ?? [];
        const answers = data.answers ?? {};
        const audioUrls = data.audioUrls ?? {};
        const items = questions.map((question) => ({
          id: question.id,
          question: question.question,
          answer: answers[question.id] ?? "",
          audioUrl: audioUrls[question.id],
          evaluation: data.evaluations?.[question.id],
        }));

        setFeedbackItems(items);

        // An evaluation counts as stale (and needs a fresh call) if it's missing
        // entirely, or if it predates a field we've since added to the evaluation
        // schema (e.g. englishFeedback) — otherwise an answer evaluated before that
        // field existed would silently show a card with no English section forever.
        const isStaleEvaluation = (item: (typeof items)[number]) =>
          item.answer.trim().length > 0 && (!item.evaluation || typeof item.evaluation.englishFeedback !== "string");

        // An attempted question can be missing its evaluation if it wasn't given
        // live AI feedback during the interview and a prior visit to this page
        // failed to evaluate it (e.g. hit a rate limit) — those need a retry even
        // though the interview is otherwise "completed".
        const hasUnevaluatedAnswer = items.some(isStaleEvaluation);

        // Feedback was already generated and persisted for this interview — reuse it
        // instead of re-running the AI pipeline (which would also re-trigger this very
        // listener via the write below, causing an endless refresh loop).
        if (data.status === "completed" && typeof data.feedback?.overallScore === "number" && !hasUnevaluatedAnswer) {
          setCachedFeedback(data.feedback);
          setSummary(data.feedback.summary ?? null);
          setLoading(false);
          return;
        }

        if (items.length > 0) {
          // Evaluated sequentially, not via Promise.all — firing every question's
          // delivery + answer evaluation at once easily bursts past Gemini's per-minute
          // rate limit, which no amount of per-call retrying can recover from in time.
          const evaluations: FeedbackItem[] = [];
          for (const item of items) {
            const delivery = item.audioUrl ? await evaluateDelivery(item.question, item.audioUrl) : undefined;

            if (!item.answer) {
              evaluations.push({ ...item, delivery, evaluation: undefined });
              continue;
            }

            if (item.evaluation && !isStaleEvaluation(item)) {
              // Already evaluated (live during Practice, or a prior visit here) with the
              // current evaluation schema — reuse it instead of re-calling the AI (avoids
              // duplicate cost and keeps live/final feedback consistent).
              evaluations.push({ ...item, delivery });
              continue;
            }

            const result = await evaluateAnswer(item.question, item.answer, {
              role: data.role,
              experienceLevel: data.experienceLevel,
              interviewType: data.interviewType,
              jobDescription: data.jobDescription,
              resumeText: data.resumeText,
            });
            evaluations.push({ ...item, delivery, evaluation: result.success ? result.data : undefined });
          }

          setFeedbackItems(evaluations);
          setEvaluationsReady(true);

          const hasAnswers = items.some((item) => item.answer.trim().length > 0);

          if (!hasAnswers) {
            // No transcript exists for any question — there's nothing for the
            // summary/study-plan prompts to work with, so asking the model
            // would only produce fabricated, plausible-sounding boilerplate.
            setSummary({
              summary: "No spoken answers were detected in this session, so we couldn't evaluate your responses.",
              strengths: [],
              weaknesses: [],
              nextSteps: ["Check your microphone and re-record your answers to get real feedback."],
            });
          } else {
            const overall = await generateOverallFeedback(
              {
                company: data.company,
                role: data.role,
                experienceLevel: data.experienceLevel,
                interviewType: data.interviewType,
                jobDescription: data.jobDescription,
                status: data.status,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
              },
              transcriptFromFeedbackItems(evaluations),
            );

            setSummary(overall.summary);
          }
        }

        setLoading(false);
      },
      (error) => {
        console.error("[firestore] feedback listener failed", error.code, error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [interviewId, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !interviewId || !interview || !evaluationsReady) {
      return;
    }

    const uid = user.uid;

    async function persistFeedback() {
      setSaving(true);
      try {
        const deliveryFields = liveDeliveryScores
          ? {
              deliveryClarityScore: liveDeliveryScores.clarityScore,
              deliveryVocalConfidenceScore: liveDeliveryScores.vocalConfidenceScore,
              deliveryAverageWordsPerMinute: liveDeliveryScores.averageWordsPerMinute,
              deliveryTotalFillerWords: liveDeliveryScores.totalFillerWords,
              deliveryFillerWordExamples: liveDeliveryScores.fillerWordExamples,
              deliveryFeedbackText: liveDeliveryScores.deliveryFeedback,
              deliveryImprovementTips: liveDeliveryScores.improvementTips,
            }
          : {};

        const evaluationsToPersist = Object.fromEntries(
          feedbackItems.filter((item) => item.evaluation).map((item) => [item.id, item.evaluation]),
        );

        const ref = doc(db, "users", uid, "interviews", interviewId);
        await setDoc(
          ref,
          {
            evaluations: evaluationsToPersist,
            feedback: {
              overallScore,
              communicationScore,
              technicalScore,
              behavioralScore,
              leadershipScore,
              problemSolvingScore,
              confidenceScore,
              englishProficiencyScore,
              summary,
              ...deliveryFields,
            },
            status: "completed",
            completedAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
          },
          { merge: true },
        );
      } catch {
        // Keep the UI resilient even if persistence fails.
      } finally {
        setSaving(false);
      }
    }

    void persistFeedback();
    // Runs once, gated by evaluationsReady — deliberately excludes score/summary values
    // from deps since they derive from feedbackItems, which this effect doesn't need to re-run for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationsReady, interview, interviewId, user?.uid]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Generating your feedback…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button variant="ghost" className="rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">AI feedback overview</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              Review your performance, focus areas, and next steps in one premium summary.
            </p>
          </div>
          <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {saving ? "Saving feedback…" : cachedFeedback || evaluationsReady ? "Feedback saved to your interview record" : "Generating feedback…"}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <ScoreCard label="Overall Score" value={overallScore} />
          <ScoreCard label="Communication" value={communicationScore} accent="text-secondary" />
          <ScoreCard label="Technical" value={technicalScore} accent="text-accent-foreground" />
          <ScoreCard label="Behavioral" value={behavioralScore} accent="text-primary" />
          <ScoreCard label="Confidence" value={confidenceScore} accent="text-secondary" />
          <ScoreCard label="English Proficiency" value={englishProficiencyScore} accent="text-accent-foreground" />
        </motion.div>

        {hasAnswers && englishProficiencyScore > 0 && englishProficiencyScore < ENGLISH_PROFICIENCY_THRESHOLD ? (
          <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Recommended English resources</CardTitle>
              <CardDescription>Your English proficiency score was below {ENGLISH_PROFICIENCY_THRESHOLD} — these resources can help.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ENGLISH_RESOURCES.length ? (
                ENGLISH_RESOURCES.map((resource) => (
                  <a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-border/70 bg-background/60 p-4 transition hover:border-primary/50"
                  >
                    <p className="font-semibold text-foreground">{resource.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{resource.description}</p>
                  </a>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Resources coming soon.</p>
              )}
            </CardContent>
          </Card>
        ) : null}

        {deliveryScores ? (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ScoreCard label="Speech Clarity" value={deliveryScores.clarityScore} accent="text-primary" />
              <ScoreCard label="Vocal Confidence" value={deliveryScores.vocalConfidenceScore} accent="text-secondary" />
              <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pace</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{deliveryScores.averageWordsPerMinute}</p>
                    <p className="text-xs text-muted-foreground">words / min</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Filler Words</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{deliveryScores.totalFillerWords}</p>
                    <p className="text-xs text-muted-foreground">across your answers</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>Spoken delivery feedback</CardTitle>
                <CardDescription>How you sounded — pacing, filler words, articulation, and vocal confidence.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-7 text-muted-foreground">{deliveryScores.deliveryFeedback}</p>
                {deliveryScores.fillerWordExamples.length ? (
                  <div className="flex flex-wrap gap-2">
                    {deliveryScores.fillerWordExamples.map((word) => (
                      <span key={word} className="rounded-full border border-border/70 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                        &ldquo;{word}&rdquo;
                      </span>
                    ))}
                  </div>
                ) : null}
                {deliveryScores.improvementTips.length ? (
                  <ul className="space-y-2 text-sm leading-7 text-muted-foreground">
                    {deliveryScores.improvementTips.map((tip) => (
                      <li key={tip} className="rounded-2xl border border-border/70 bg-background/60 px-3 py-3">
                        {tip}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {recordedItems.length ? (
          <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle>Your recordings</CardTitle>
              <CardDescription>Listen back to how you answered each question.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recordedItems.map((item) => (
                <div key={item.question} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <p className="text-sm font-medium text-foreground">{item.question}</p>
                  { }
                  <audio controls src={item.audioUrl} className="mt-3 h-9 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {attemptedItems.length ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">Question-by-question feedback</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Detailed feedback for each question you attempted — {attemptedItems.length} of {feedbackItems.length} question{feedbackItems.length === 1 ? "" : "s"}.
              </p>
            </div>
            <div className="space-y-4">
              {attemptedItems.map((item, index) => (
                <QuestionFeedbackCard key={item.question} item={item} index={index} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
