"use client";

import { motion } from "framer-motion";
import { Award, Lock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { computeAchievements, EMPTY_STATS, type InterviewStats } from "@/services/interview.service";

type AchievementsProps = {
  stats?: InterviewStats;
};

export function Achievements({ stats = EMPTY_STATS }: AchievementsProps) {
  const achievements = computeAchievements(stats);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Milestones unlocked through consistent practice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {achievements.map((achievement) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-smooth ${
                      achievement.unlocked
                        ? "border-primary/20 bg-accent/60 text-primary"
                        : "border-border/70 bg-background/60 text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {achievement.unlocked ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                    </div>
                    <p className="text-xs font-semibold leading-tight">{achievement.label}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{achievement.description}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
