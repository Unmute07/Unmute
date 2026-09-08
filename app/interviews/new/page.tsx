"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { z } from "zod";
import { FileText, Loader2, Sparkles, X } from "lucide-react";
import { addDoc, collection, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { analyzeJobDescription, generateInterviewQuestions } from "@/services/ai-client";
import { buildInterviewQuestions } from "@/services/interview.service";
import { fetchRecentQuestionsForMock, fetchRecentQuestionsForPractice, recordAskedQuestions } from "@/services/question-history.service";
import { parseResumePdf } from "@/services/resume-client";
import type { JobAnalysis, InterviewQuestionSet } from "@/services/ai.service";
import {
  MAX_QUESTION_COUNT,
  MIN_QUESTION_COUNT,
  QUESTION_COUNT_OPTIONS,
  QUESTION_DIFFICULTY_OPTIONS,
  type InterviewDocument,
  type InterviewMode,
  type QuestionDifficulty,
} from "@/types/interview";
import type { PreferredDifficulty } from "@/types/user";

const DIFFICULTY_TO_EXPERIENCE_LEVEL: Record<PreferredDifficulty, string> = {
  Easy: "Entry-level",
  Medium: "Mid-level",
  Hard: "Senior",
};

const schema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  experienceLevel: z.string().min(1, "Experience level is required"),
  interviewType: z.enum(["Technical", "Behavioral", "HR", "Mixed"]),
  jobDescription: z.string().min(1, "Job description is required"),
  questionCount: z
    .number()
    .int()
    .min(MIN_QUESTION_COUNT, `Must be at least ${MIN_QUESTION_COUNT}`)
    .max(MAX_QUESTION_COUNT, `Must be at most ${MAX_QUESTION_COUNT}`),
  difficulty: z.enum(QUESTION_DIFFICULTY_OPTIONS),
});

type FormValues = z.infer<typeof schema>;

type InterviewDraftState = {
  jobAnalysis?: JobAnalysis;
  questions?: InterviewQuestionSet;
};

// The selected question count is a total budget for the whole session, not just the
// pre-generated set — roughly half is reserved as headroom for live, answer-aware
// follow-ups (see app/interview/[id]/page.tsx), so the session never grows past what
// the user picked.
function getOriginalQuestionCount(totalQuestionCount: number): number {
  return Math.max(1, Math.ceil(totalQuestionCount / 2));
}

function NewInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draft, setDraft] = useState<InterviewDraftState>({});
  const [error, setError] = useState<string | null>(null);
  const [useCustomCount, setUseCustomCount] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const mode: InterviewMode = searchParams.get("mode") === "mock" ? "mock" : "practice";
  const isMock = mode === "mock";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: "",
      role: "",
      experienceLevel: "Mid-level",
      interviewType: "Mixed",
      jobDescription: "",
      questionCount: 10,
      difficulty: "Mixed",
    },
  });

  const questionCount = watch("questionCount");
  const difficulty = watch("difficulty");

  useEffect(() => {
    if (!profile) return;

    reset((current) => ({
      ...current,
      interviewType: profile.preferredInterviewType,
      experienceLevel: DIFFICULTY_TO_EXPERIENCE_LEVEL[profile.preferredDifficulty],
    }));
  }, [profile, reset]);

  const interviewTypeOptions = useMemo(() => ["Technical", "Behavioral", "HR", "Mixed"], []);

  const handleResumeDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setResumeError(null);
    setIsParsingResume(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const result = await parseResumePdf(base64, file.type || "application/pdf");
      if (result.success) {
        setResumeText(result.text);
        setResumeFileName(file.name);
      } else {
        setResumeError(result.error);
      }
    } catch {
      setResumeError("Unable to read this file. Please try a different PDF.");
    } finally {
      setIsParsingResume(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => void handleResumeDrop(files),
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    multiple: false,
  });

  const onSubmit = async (values: FormValues) => {
    if (!user?.uid) {
      setError("Please sign in to create an interview.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const effectiveDifficulty: QuestionDifficulty = isMock ? "Mixed" : values.difficulty;
      const originalQuestionCount = getOriginalQuestionCount(values.questionCount);

      const avoidQuestions = isMock
        ? await fetchRecentQuestionsForMock(user.uid, {
            company: values.company,
            role: values.role,
            experienceLevel: values.experienceLevel,
          })
        : await fetchRecentQuestionsForPractice(user.uid);

      const [analysisResult, questionsResult] = await Promise.all([
        analyzeJobDescription(values.jobDescription),
        generateInterviewQuestions(
          values.jobDescription,
          values.role,
          values.experienceLevel,
          values.interviewType,
          originalQuestionCount,
          effectiveDifficulty,
          resumeText || undefined,
          avoidQuestions,
          // Live, answer-aware follow-ups now fire after every answered question in
          // both modes (see app/interview/[id]/page.tsx), superseding the static
          // pre-generated "follow-up" question bucket.
          false,
        ),
      ]);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error);
      }
      if (!questionsResult.success) {
        throw new Error(questionsResult.error);
      }

      const newInterview: Omit<InterviewDocument, "id"> = {
        company: values.company,
        role: values.role,
        experienceLevel: values.experienceLevel,
        interviewType: values.interviewType,
        jobDescription: values.jobDescription,
        status: "analyzing",
        mode,
        difficulty: effectiveDifficulty,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        targetQuestionCount: values.questionCount,
        questions: buildInterviewQuestions(questionsResult.data, values.interviewType, effectiveDifficulty).slice(
          0,
          originalQuestionCount,
        ),
        answers: {},
        feedback: {},
        analysis: analysisResult.data,
        ...(resumeText ? { resumeText } : {}),
      };

      const interviewRef = await addDoc(collection(db, "users", user.uid, "interviews"), newInterview);

      void recordAskedQuestions(user.uid, newInterview.questions, {
        role: values.role,
        experienceLevel: values.experienceLevel,
        company: values.company,
        mode,
      });

      setDraft({ jobAnalysis: analysisResult.data, questions: questionsResult.data });
      router.push(`/interview/${interviewRef.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze this interview right now.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">{isMock ? "New mock interview" : "New practice session"}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {isMock ? "Set up a realistic, full-length mock interview." : "Build a focused practice session with AI-guided context."}
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              {isMock
                ? "Tell us about the company and role, paste the job description, and Unmute will run a mixed-difficulty interview — working in live follow-up questions on your answers — with feedback at the end."
                : "Tell us about the company and role, paste the job description, and choose your own difficulty and feedback style. Unmute will also work in live follow-up questions on your answers."}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card className="border-border/70 bg-card/80 shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <CardHeader>
              <CardTitle className="text-2xl">Interview details</CardTitle>
              <CardDescription>Required fields are marked and validated before analysis begins.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-5 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Company</span>
                    <Input {...register("company")} placeholder="e.g. Northstar Labs" />
                    {errors.company ? <p className="text-sm text-destructive">{errors.company.message}</p> : null}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Role</span>
                    <Input {...register("role")} placeholder="e.g. Product Designer" />
                    {errors.role ? <p className="text-sm text-destructive">{errors.role.message}</p> : null}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Experience level</span>
                    <Input {...register("experienceLevel")} placeholder="e.g. Mid-level" />
                    {errors.experienceLevel ? <p className="text-sm text-destructive">{errors.experienceLevel.message}</p> : null}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Interview type</span>
                    <select {...register("interviewType")} className="flex h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                      {interviewTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.interviewType ? <p className="text-sm text-destructive">{errors.interviewType.message}</p> : null}
                  </label>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Number of questions</span>
                  <p className="text-sm text-muted-foreground">Choose how many questions Unmute should prepare for this session.</p>
                  <div className="flex flex-wrap gap-2">
                    {QUESTION_COUNT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setUseCustomCount(false);
                          setValue("questionCount", option, { shouldValidate: true });
                        }}
                        className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                          !useCustomCount && questionCount === option
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {option} questions
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUseCustomCount(true)}
                      className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                        useCustomCount
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      Other
                    </button>
                  </div>
                  {useCustomCount ? (
                    <Input
                      type="number"
                      min={MIN_QUESTION_COUNT}
                      max={MAX_QUESTION_COUNT}
                      placeholder={`${MIN_QUESTION_COUNT}-${MAX_QUESTION_COUNT}`}
                      className="max-w-[10rem]"
                      onChange={(event) => {
                        const parsed = Number.parseInt(event.target.value, 10);
                        setValue("questionCount", Number.isNaN(parsed) ? 0 : parsed, { shouldValidate: true });
                      }}
                    />
                  ) : null}
                  {errors.questionCount ? <p className="text-sm text-destructive">{errors.questionCount.message}</p> : null}
                </div>

                {!isMock ? (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Question difficulty</span>
                    <p className="text-sm text-muted-foreground">Choose how challenging your practice questions should be.</p>
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_DIFFICULTY_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setValue("difficulty", option, { shouldValidate: true })}
                          className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                            difficulty === option
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-background text-foreground hover:border-primary/50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!isMock ? (
                  <div className="rounded-[1.25rem] border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                    You&apos;ll see an <span className="font-medium text-foreground">AI Feedback</span> button under each question
                    during the session — click it anytime to get feedback on that answer right away, plus the full summary at the
                    end.
                  </div>
                ) : null}

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Job description</span>
                  <p className="text-sm text-muted-foreground">Paste the JD and Unmute will tailor which technical, behavioral, HR, and follow-up questions you get asked.</p>
                  <textarea {...register("jobDescription")} rows={10} className="min-h-48 w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-4 text-sm leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Paste the role description here..." />
                  {errors.jobDescription ? <p className="text-sm text-destructive">{errors.jobDescription.message}</p> : null}
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Resume (optional)</span>
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF or paste your resume text so questions probe your actual background against this role.
                  </p>
                  <div
                    {...getRootProps()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition ${
                      isDragActive ? "border-primary bg-primary/5" : "border-border/70 bg-background/60 hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {isParsingResume ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Reading your resume…</p>
                      </>
                    ) : resumeFileName ? (
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <FileText className="h-4 w-4 text-primary" />
                        {resumeFileName}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setResumeFileName(null);
                            setResumeText("");
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Drop a PDF here, or click to browse.</p>
                    )}
                  </div>
                  {resumeError ? <p className="text-sm text-destructive">{resumeError}</p> : null}
                  <p className="text-sm text-muted-foreground">Or paste your resume text directly:</p>
                  <textarea
                    value={resumeFileName ? "" : resumeText}
                    onChange={(event) => {
                      setResumeFileName(null);
                      setResumeText(event.target.value);
                    }}
                    rows={6}
                    className="min-h-32 w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-4 text-sm leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Paste your resume text here..."
                  />
                </div>

                {error ? <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-background/60 p-4">
                  <div className="text-sm text-muted-foreground">
                    {isAnalyzing ? "Analyzing requirements and generating your interview questions..." : "Once you submit, the AI will build your practice set."}
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button type="submit" className="primary-button rounded-full px-5" disabled={isAnalyzing || isSubmitting}>
                      {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Analyze Job Description
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {draft.jobAnalysis ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }} className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>AI analysis preview</CardTitle>
                <CardDescription>Review the role context before you begin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p><span className="font-semibold text-foreground">Summary:</span> {draft.jobAnalysis.companySummary}</p>
                <p><span className="font-semibold text-foreground">Difficulty:</span> {draft.jobAnalysis.difficulty}</p>
                <div>
                  <p className="font-semibold text-foreground">Focus areas</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {draft.jobAnalysis.interviewFocusAreas.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
              <CardHeader>
                <CardTitle>Generated question set</CardTitle>
                <CardDescription>Questions are saved into Firestore with the interview record.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p><span className="font-semibold text-foreground">Technical:</span> {draft.questions?.technical.length ?? 0}</p>
                <p><span className="font-semibold text-foreground">Behavioral:</span> {draft.questions?.behavioural.length ?? 0}</p>
                <p><span className="font-semibold text-foreground">HR:</span> {draft.questions?.hr.length ?? 0}</p>
                <p className="text-xs text-muted-foreground/80">The rest of your selected question count is held as headroom for live follow-up questions, generated from what you actually say as you answer.</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export default function NewInterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      }
    >
      <NewInterviewForm />
    </Suspense>
  );
}
