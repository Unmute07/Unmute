"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type SkillProgress = {
  name: string;
  value: number;
};

type SkillsProgressCardProps = {
  skills: SkillProgress[];
};

export function SkillsProgressCard({ skills }: SkillsProgressCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Skills Progress</CardTitle>
          <CardDescription>How your focus areas are improving</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.length > 0 ? (
            skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  <span className="text-muted-foreground">{skill.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-accent/70">
                  <div className="h-2.5 rounded-full bg-primary" style={{ width: `${skill.value}%` }} />
                </div>
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
