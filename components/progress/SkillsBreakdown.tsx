"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SKILL_KEYS, SKILL_LABELS, type SkillKey } from "@/types/interview";

type SkillsBreakdownProps = {
  skills?: Record<SkillKey, number>;
};

const EMPTY_SKILLS: Record<SkillKey, number> = {
  technical: 0,
  communication: 0,
  behavioral: 0,
  leadership: 0,
  problemSolving: 0,
};

export function SkillsBreakdown({ skills = EMPTY_SKILLS }: SkillsBreakdownProps) {
  const hasData = SKILL_KEYS.some((key) => skills[key] > 0);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Skills Breakdown</CardTitle>
          <CardDescription>Averaged across your completed interviews</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {hasData ? (
            SKILL_KEYS.map((key) => (
              <div key={key}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{SKILL_LABELS[key]}</span>
                  <span className="text-muted-foreground">{skills[key]}%</span>
                </div>
                <Progress value={skills[key]} />
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-center text-sm text-muted-foreground">
              No skill data yet. Practice more to unlock progress insights.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
