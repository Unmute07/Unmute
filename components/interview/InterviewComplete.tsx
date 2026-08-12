"use client";

import { BrainCircuit, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type InterviewCompleteProps = {
  onRestart: () => void;
  onViewFeedback: () => void;
};

export function InterviewComplete({ onRestart, onViewFeedback }: InterviewCompleteProps) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <CardHeader className="space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl">Practice session complete</CardTitle>
          <CardDescription className="mt-2 text-base leading-7">
            Get your AI feedback on confidence, communication, and technical depth, or restart for another round.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button onClick={onViewFeedback} className="primary-button rounded-full px-5">
          <BrainCircuit className="mr-2 h-4 w-4" />
          View AI feedback
        </Button>
        <Button onClick={onRestart} variant="outline" className="rounded-full px-5">
          <Sparkles className="mr-2 h-4 w-4" />
          Restart practice
        </Button>
      </CardContent>
    </Card>
  );
}
