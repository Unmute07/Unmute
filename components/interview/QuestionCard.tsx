"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type QuestionCardProps = {
  question: {
    id: string;
    question: string;
    category: string;
    difficulty: string;
    rationale: string;
  };
  index: number;
  total: number;
};

export function QuestionCard({ question, index, total }: QuestionCardProps) {
  return (
    <motion.div key={question.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.24 }}>
      <Card className="border-border/70 bg-card/80 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Question {index + 1} of {total}
            </span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
              {question.category}
            </span>
            <span className="rounded-full border border-accent/70 bg-accent/50 px-3 py-1 text-xs font-medium text-accent-foreground">
              {question.difficulty}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">{question.question}</CardTitle>
              <CardDescription className="mt-2 text-sm leading-7">{question.rationale}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
