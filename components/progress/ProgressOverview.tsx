"use client";

import { motion } from "framer-motion";
import { Flame, ListChecks, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EMPTY_STATS, type InterviewStats } from "@/services/interview.service";

type ProgressOverviewProps = {
  stats?: InterviewStats;
};

export function ProgressOverview({ stats = EMPTY_STATS }: ProgressOverviewProps) {
  const tiles = [
    {
      label: "Interviews Completed",
      value: `${stats.completedInterviews}`,
      description: `${stats.totalInterviews} total started`,
      icon: ListChecks,
    },
    {
      label: "Average AI Score",
      value: stats.completedInterviews ? `${stats.averageScore}` : "—",
      description: stats.completedInterviews
        ? `Range ${stats.lowestScore}–${stats.highestScore}`
        : "Complete an interview to see this.",
      icon: Sparkles,
    },
    {
      label: "Weekly Practice Streak",
      value: `${stats.currentStreak}`,
      description: `Best streak: ${stats.bestStreak} week${stats.bestStreak === 1 ? "" : "s"}`,
      icon: Flame,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {tiles.map((tile, index) => {
        const Icon = tile.icon;
        return (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{tile.label}</CardTitle>
                    <CardDescription>{tile.description}</CardDescription>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight text-foreground">{tile.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
