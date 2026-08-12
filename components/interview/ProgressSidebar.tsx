"use client";

import { CheckCircle2, Clock3, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProgressSidebarProps = {
  total: number;
  answeredCount: number;
  timeElapsed: number;
  company?: string;
  role?: string;
};

export function ProgressSidebar({ total, answeredCount, timeElapsed, company, role }: ProgressSidebarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((answeredCount / total) * 100)) : 0;

  return (
    <Card className="border-border/70 bg-card/80 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4" />
          Practice overview
        </div>
        <CardTitle className="text-xl">{company ?? "Interview prep"}</CardTitle>
        <CardDescription>{role ?? "Mock interview"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{percentage}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-accent/70">
            <div className="h-2.5 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Answered</p>
            <p className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {answeredCount} / {total}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Timer</p>
            <p className="mt-1 flex items-center gap-2 text-base font-semibold text-foreground">
              <Clock3 className="h-4 w-4 text-primary" />
              {new Date(timeElapsed * 1000).toISOString().slice(14, 19)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <p className="text-sm font-semibold text-foreground">Focus tips</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• Keep your examples specific and measurable.</li>
            <li>• Lead with impact and structure your answer.</li>
            <li>• Pause briefly before answering for clarity.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
