"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Flame, ListChecks, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import type { InterviewStats } from "@/services/interview.service";

type StatStripProps = {
  stats: InterviewStats;
};

export function StatStrip({ stats }: StatStripProps) {
  const tiles = [
    { label: "Total Interviews", value: `${stats.totalInterviews}`, icon: ListChecks, highlight: false },
    { label: "Completed", value: `${stats.completedInterviews}`, icon: CheckCircle2, highlight: false },
    { label: "Current Streak", value: `${stats.currentStreak}w`, icon: Flame, highlight: false },
    { label: "Readiness Score", value: `${stats.readinessScore}`, icon: Sparkles, highlight: true },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
          >
            <div
              className={cn(
                "hover-card flex h-full flex-col justify-between rounded-2xl border p-4",
                tile.highlight
                  ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                  : "border-border/70 bg-card/80 shadow-sm"
              )}
            >
              <div className="flex items-center justify-between">
                <p className={cn("text-sm", tile.highlight ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {tile.label}
                </p>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    tile.highlight ? "bg-white/15" : "bg-accent text-primary"
                  )}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Icon className="h-5 w-5 opacity-70" />
                <p className="text-3xl font-semibold tracking-tight">{tile.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
