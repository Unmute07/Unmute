"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type InterviewReadinessCardProps = {
  score?: number;
  improvement?: string;
  description?: string;
};

export function InterviewReadinessCard({
  score = 92,
  improvement = "+8% this month",
  description = "You are in a strong position for the next round.",
}: InterviewReadinessCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Interview Readiness</CardTitle>
              <CardDescription>Overall score</CardDescription>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[conic-gradient(var(--primary)_0deg,var(--secondary)_calc(var(--score)*3.6deg),var(--accent)_0deg)] [--score:92]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-lg font-semibold text-foreground">
                {score}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{improvement}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
          <Button className="primary-button h-10 rounded-full px-4">
            View insights <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
