"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { doc, onSnapshot, setDoc, Timestamp } from "firebase/firestore";

import { AnswerInput } from "@/components/interview/AnswerInput";
import { InterviewComplete } from "@/components/interview/InterviewComplete";
import { InterviewNavigation } from "@/components/interview/InterviewNavigation";
import { ProgressSidebar } from "@/components/interview/ProgressSidebar";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { uploadAnswerAudio } from "@/services/audio-client";
import type { InterviewDocument, InterviewQuestion } from "@/types/interview";

const defaultQuestions: InterviewQuestion[] = [
  {
    id: "q1",
    question: "Tell me about a time you solved a complex problem under pressure.",
    category: "Behavioral",
    difficulty: "medium",
    rationale: "This helps uncover how you structure thinking, action, and reflection.",
  },
  {
    id: "q2",
    question: "How do you balance speed and quality when shipping product work?",
    category: "Leadership",
    difficulty: "medium",
    rationale: "This question gauges product judgment and tradeoff clarity.",
  },
  {
    id: "q3",
    question: "Describe a time you influenced stakeholders without direct authority.",
    category: "Behavioral",
    difficulty: "hard",
    rationale: "This evaluates collaboration, communication, and executive presence.",
  },
];

export default function InterviewPracticePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [interview, setInterview] = useState<InterviewDocument | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const autosaveTimer = useRef<number | null>(null);

  const interviewId = params?.id;
  const questions = useMemo(() => interview?.questions?.length ? interview.questions : defaultQuestions, [interview]);
  const isComplete = currentIndex >= questions.length;

  useEffect(() => {
    if (!user?.uid || !interviewId) {
      return;
    }

    const ref = doc(db, "users", user.uid, "interviews", interviewId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as InterviewDocument;
          setInterview(data);
          setAnswers(data.answers ?? {});
          setAudioUrls(data.audioUrls ?? {});
          setLoading(false);
        } else {
          setLoading(false);
        }
      },
      (error) => {
        console.error("[firestore] interview listener failed", error.code, error.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [interviewId, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !interviewId) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeElapsed((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [interviewId, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !interviewId) {
      return;
    }

    const uid = user.uid;

    async function saveAnswers() {
      try {
        setSaving(true);
        const ref = doc(db, "users", uid, "interviews", interviewId);
        await setDoc(
          ref,
          {
            answers,
            updatedAt: Timestamp.fromDate(new Date()),
          },
          { merge: true },
        );
      } catch {
        // Swallow autosave errors while keeping the practice experience intact.
      } finally {
        setSaving(false);
      }
    }

    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }

    autosaveTimer.current = window.setTimeout(() => {
      void saveAnswers();
    }, 2500);

    return () => {
      if (autosaveTimer.current) {
        window.clearTimeout(autosaveTimer.current);
      }
    };
  }, [answers, interviewId, user?.uid]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-3 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Preparing your practice interview…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="max-w-xl border-border/70 bg-card/80 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in to continue</CardTitle>
            <CardDescription className="text-base leading-7">You need an authenticated session to practice.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/login")} className="primary-button rounded-full px-5">
              Go to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions.length) {
    return null;
  }

  const activeQuestion = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    setCurrentIndex(questions.length);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
    } else {
      setCurrentIndex(questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setTimeElapsed(0);
  };

  const handleAudioRecorded = async (blob: Blob) => {
    if (!user?.uid || !interviewId) {
      return;
    }

    const questionId = activeQuestion.id;

    try {
      setUploadingAudio(true);
      const result = await uploadAnswerAudio(user.uid, interviewId, questionId, blob);

      if (!result.success) {
        console.error("[audio] failed to upload answer recording", result.error);
        return;
      }

      const nextAudioUrls = { ...audioUrls, [questionId]: result.url };
      setAudioUrls(nextAudioUrls);

      const ref = doc(db, "users", user.uid, "interviews", interviewId);
      await setDoc(ref, { audioUrls: nextAudioUrls, updatedAt: Timestamp.fromDate(new Date()) }, { merge: true });
    } finally {
      setUploadingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Interview practice</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Sharpen your answers with calm, focused repetition.</h1>
          </div>
          <div className="rounded-full border border-border/70 bg-card/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            {uploadingAudio ? "Saving recording…" : saving ? "Autosaving…" : "Auto-saved locally"}
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {isComplete ? (
              <InterviewComplete onRestart={handleRestart} onViewFeedback={() => router.push(`/feedback/${interviewId}`)} />
            ) : (
              <>
                <QuestionCard question={activeQuestion} index={currentIndex} total={questions.length} />
                <AnswerInput
                  value={answers[activeQuestion.id] ?? ""}
                  onChange={(value) => setAnswers((previous) => ({ ...previous, [activeQuestion.id]: value }))}
                  savedAudioUrl={audioUrls[activeQuestion.id]}
                  onAudioRecorded={(blob) => void handleAudioRecorded(blob)}
                />
                <InterviewNavigation
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onSkip={handleSkip}
                  isFirst={currentIndex === 0}
                  isLast={currentIndex === questions.length - 1}
                />
              </>
            )}
          </div>

          <ProgressSidebar
            total={questions.length}
            answeredCount={Object.values(answers).filter(Boolean).length}
            timeElapsed={timeElapsed}
            company={interview?.company}
            role={interview?.role}
          />
        </div>
      </div>
    </div>
  );
}
