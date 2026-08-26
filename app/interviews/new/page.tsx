"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { addDoc, collection, Timestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { analyzeJobDescription, generateInterviewQuestions } from "@/services/ai-client";
import type { JobAnalysis, InterviewQuestionSet } from "@/services/ai.service";
import type { InterviewDocument } from "@/types/interview";
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
});

type FormValues = z.infer<typeof schema>;

type InterviewDraftState = {
  jobAnalysis?: JobAnalysis;
  questions?: InterviewQuestionSet;
};

export default function NewInterviewPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [draft, setDraft] = useState<InterviewDraftState>({});
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: "",
      role: "",
      experienceLevel: "Mid-level",
      interviewType: "Mixed",
      jobDescription: "",
    },
  });

  useEffect(() => {
    if (!profile) return;

    reset((current) => ({
      ...current,
      interviewType: profile.preferredInterviewType,
      experienceLevel: DIFFICULTY_TO_EXPERIENCE_LEVEL[profile.preferredDifficulty],
    }));
  }, [profile, reset]);

  const interviewTypeOptions = useMemo(() => ["Technical", "Behavioral", "HR", "Mixed"], []);

  const onSubmit = async (values: FormValues) => {
    if (!user?.uid) {
      setError("Please sign in to create an interview.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const [analysisResult, questionsResult] = await Promise.all([
        analyzeJobDescription(values.jobDescription),
        generateInterviewQuestions(values.jobDescription, values.role, values.experienceLevel, values.interviewType),
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
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        questions: [
          ...questionsResult.data.technical.map((question, index) => ({
            id: `technical-${index}`,
            question,
            category: "Technical",
            difficulty: "medium",
            rationale: "Generated from the job description and role context.",
          })),
          ...questionsResult.data.behavioural.map((question, index) => ({
            id: `behavioural-${index}`,
            question,
            category: "Behavioral",
            difficulty: "medium",
            rationale: "Generated from the job description and role context.",
          })),
          ...questionsResult.data.hr.map((question, index) => ({
            id: `hr-${index}`,
            question,
            category: "HR",
            difficulty: "easy",
            rationale: "Generated from the job description and role context.",
          })),
          ...questionsResult.data.followUps.map((question, index) => ({
            id: `followup-${index}`,
            question,
            category: "Follow-up",
            difficulty: "hard",
            rationale: "Generated from the job description and role context.",
          })),
        ],
        answers: {},
        feedback: {},
        analysis: analysisResult.data,
      };

      const interviewRef = await addDoc(collection(db, "users", user.uid, "interviews"), newInterview);

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
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">New interview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Create your next mock interview with AI-guided context.</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Tell us about the company and role, paste the job description, and Unmute will generate a structured practice set.
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

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">Job description</span>
                  <p className="text-sm text-muted-foreground">Paste the JD and Unmute will tailor which technical, behavioral, HR, and follow-up questions you get asked.</p>
                  <textarea {...register("jobDescription")} rows={10} className="min-h-48 w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-4 text-sm leading-7 text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Paste the role description here..." />
                  {errors.jobDescription ? <p className="text-sm text-destructive">{errors.jobDescription.message}</p> : null}
                </label>

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
                <p><span className="font-semibold text-foreground">Follow-ups:</span> {draft.questions?.followUps.length ?? 0}</p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
