"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WeeklyStreakCardProps = {
  currentStreak?: number;
  bestStreak?: number;
  practiceDays?: number;
};

export function WeeklyStreakCard({ currentStreak = 8, bestStreak = 14, practiceDays = 24 }: WeeklyStreakCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Weekly Streak</CardTitle>
              <CardDescription>Consistency wins</CardDescription>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <Flame className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Current</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{currentStreak} days</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Best</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{bestStreak} days</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Practice</p>
              <p className="mt-1 text-xl font-semibold text-foreground">{practiceDays} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
