"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { evaluateAnswer, evaluateSpokenDelivery, generateInterviewSummary, generateStudyPlan } from "@/services/ai-client";
import type { AnswerEvaluation, DeliveryEvaluation, InterviewSummary, StudyPlan } from "@/services/ai.service";
import { computeDeliveryScores, computeFeedbackScores, type DeliveryScores } from "@/services/interview.service";
import type { InterviewDocument, InterviewFeedback } from "@/types/interview";

type FeedbackItem = {
  question: string;
  answer: string;
  audioUrl?: string;
  evaluation?: AnswerEvaluation;
  delivery?: DeliveryEvaluation;
  improvedAnswer?: string;
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
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluationsReady, setEvaluationsReady] = useState(false);
  const [cachedFeedback, setCachedFeedback] = useState<Partial<InterviewFeedback> | null>(null);

  const interviewId = params?.id;

  const liveScores = useMemo(() => computeFeedbackScores(feedbackItems), [feedbackItems]);
  const liveDeliveryScores = useMemo(() => computeDeliveryScores(feedbackItems), [feedbackItems]);
  const recordedItems = useMemo(() => feedbackItems.filter((item) => item.audioUrl), [feedbackItems]);
  const hasAnswers = useMemo(() => feedbackItems.some((item) => item.answer.trim().length > 0), [feedbackItems]);

  const scores = cachedFeedback ?? liveScores;
  const { overallScore = 0, communicationScore = 0, technicalScore = 0, behavioralScore = 0, leadershipScore = 0, problemSolvingScore = 0, confidenceScore = 0 } = scores;

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

        const data = { id: snapshot.id, ...snapshot.data() } as InterviewDocument;
        setInterview(data);

        const questions = data.questions ?? [];
        const answers = data.answers ?? {};
        const audioUrls = data.audioUrls ?? {};
        const items = questions.map((question) => ({
          question: question.question,
          answer: answers[question.id] ?? "",
          audioUrl: audioUrls[question.id],
          improvedAnswer: answers[question.id] ?? "",
        }));

        setFeedbackItems(items);

        // Feedback was already generated and persisted for this interview — reuse it
        // instead of re-running the AI pipeline (which would also re-trigger this very
        // listener via the write below, causing an endless refresh loop).
        if (data.status === "completed" && typeof data.feedback?.overallScore === "number") {
          setCachedFeedback(data.feedback);
          setSummary(data.feedback.summary ?? null);
          setStudyPlan(data.feedback.studyPlan ?? null);
          setLoading(false);
          return;
        }

        if (items.length > 0) {
          // Evaluated sequentially, not via Promise.all — firing every question's
          // delivery + answer evaluation at once easily bursts past Groq's per-minute
          // rate limit, which no amount of per-call retrying can recover from in time.
          const evaluations: FeedbackItem[] = [];
          for (const item of items) {
            const delivery = item.audioUrl ? await evaluateDelivery(item.question, item.audioUrl) : undefined;

            if (!item.answer) {
              evaluations.push({ ...item, delivery, evaluation: undefined });
              continue;
            }

            const result = await evaluateAnswer(item.question, item.answer);
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
            setStudyPlan({ weeklyPlan: [], plan: [] });
          } else {
            const summaryResult = await generateInterviewSummary({
              company: data.company,
              role: data.role,
              experienceLevel: data.experienceLevel,
              interviewType: data.interviewType,
              jobDescription: data.jobDescription,
              status: data.status,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });

            if (summaryResult.success) {
              setSummary(summaryResult.data);
            }

            const studyPlanResult = await generateStudyPlan((summaryResult.success ? summaryResult.data.summary : "Improve interview delivery") + "\n" + (evaluations[0]?.evaluation?.feedback ?? ""));
            if (studyPlanResult.success) {
              setStudyPlan(studyPlanResult.data);
            }
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

        const ref = doc(db, "users", uid, "interviews", interviewId);
        await setDoc(
          ref,
          {
            feedback: {
              overallScore,
              communicationScore,
              technicalScore,
              behavioralScore,
              leadershipScore,
              problemSolvingScore,
              confidenceScore,
              summary,
              studyPlan,
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

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <ScoreCard label="Overall Score" value={overallScore} />
          <ScoreCard label="Communication" value={communicationScore} accent="text-secondary" />
          <ScoreCard label="Technical" value={technicalScore} accent="text-accent-foreground" />
          <ScoreCard label="Behavioral" value={behavioralScore} accent="text-primary" />
          <ScoreCard label="Confidence" value={confidenceScore} accent="text-secondary" />
        </motion.div>

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

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
                <CardDescription>What stood out in your interview delivery.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {(summary?.strengths?.length
                    ? summary.strengths
                    : [hasAnswers ? "We couldn't identify specific strengths from this session." : "No spoken answer was recorded, so there's nothing to assess yet."]
                  ).map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-background/60 px-3 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>Weaknesses</CardTitle>
                <CardDescription>Opportunities to sharpen your responses.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {(summary?.weaknesses?.length
                    ? summary.weaknesses
                    : [hasAnswers ? "We couldn't identify specific weaknesses from this session." : "No spoken answer was recorded, so there's nothing to assess yet."]
                  ).map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-background/60 px-3 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>AI suggestions</CardTitle>
                <CardDescription>Practical coaching guidance.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(studyPlan?.plan?.length
                  ? studyPlan.plan
                  : [
                      hasAnswers
                        ? { title: "No suggestions yet", description: "We couldn't generate coaching guidance from this session.", priority: "low" as const }
                        : { title: "Record an answer first", description: "No spoken answer was detected, so there's no coaching guidance to give.", priority: "low" as const },
                    ]
                ).map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>Next steps</CardTitle>
                <CardDescription>What to do before your next round.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                  {(summary?.nextSteps?.length
                    ? summary.nextSteps
                    : [hasAnswers ? "Re-attempt this interview to get personalized next steps." : "Check your microphone and re-record your answers to get real feedback."]
                  ).map((item) => (
                    <li key={item} className="rounded-2xl border border-border/70 bg-background/60 px-3 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-primary" />
              Improved answer example
            </CardTitle>
            <CardDescription>One stronger way to frame your response.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm leading-8 text-muted-foreground">
              {feedbackItems[0]?.improvedAnswer || (hasAnswers ? "Practice a stronger answer with a clear opening, evidence, and impact statement." : "No spoken answer was recorded for this question.")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
