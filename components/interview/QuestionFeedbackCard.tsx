"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnswerEvaluation } from "@/services/ai.service";

export type QuestionFeedbackData = {
  question: string;
  answer: string;
  audioUrl?: string;
  evaluation?: AnswerEvaluation;
};

type QuestionFeedbackCardProps = {
  item: QuestionFeedbackData;
  index: number;
};

export function QuestionFeedbackCard({ item, index }: QuestionFeedbackCardProps) {
  const evaluation = item.evaluation;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
      <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">
                Question {index + 1}
              </CardTitle>
              <CardDescription className="mt-1 text-foreground/80">{item.question}</CardDescription>
            </div>
            {evaluation ? (
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {evaluation.score}/100
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your answer</p>
            {item.audioUrl ? <audio controls src={item.audioUrl} className="mt-3 h-9 w-full" /> : null}
            {item.answer.trim() ? (
              <p className="mt-3 text-sm leading-7 text-foreground/90">{item.answer}</p>
            ) : !item.audioUrl ? (
              <p className="mt-3 text-sm text-muted-foreground">No answer recorded for this question.</p>
            ) : null}
          </div>

          {evaluation ? (
            <>
              <p className="text-sm leading-7 text-muted-foreground">{evaluation.feedback}</p>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Strengths</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                    {(evaluation.strengths?.length ? evaluation.strengths : ["No specific strengths identified."]).map((s) => (
                      <li key={s} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Weaknesses</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                    {(evaluation.weaknesses?.length ? evaluation.weaknesses : ["No specific weaknesses identified."]).map((w) => (
                      <li key={w} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {evaluation.improvements?.length ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">How to improve</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                    {evaluation.improvements.map((tip) => (
                      <li key={tip} className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {typeof evaluation.englishProficiency === "number" ? (
                <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">English evaluation</p>
                    <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {evaluation.englishProficiency}/100
                    </span>
                  </div>
                  {evaluation.englishFeedback ? (
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{evaluation.englishFeedback}</p>
                  ) : null}
                  {evaluation.englishIssues?.length ? (
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      {evaluation.englishIssues.map((issue) => (
                        <li key={issue} className="rounded-xl border border-border/70 bg-card/60 px-3 py-2">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {evaluation.suggestedAnswer ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">A stronger answer</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{evaluation.suggestedAnswer}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Evaluation unavailable for this question.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
