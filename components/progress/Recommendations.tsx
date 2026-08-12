"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeRecommendations, EMPTY_STATS, type InterviewStats } from "@/services/interview.service";

type RecommendationsProps = {
  stats?: InterviewStats;
};

export function Recommendations({ stats = EMPTY_STATS }: RecommendationsProps) {
  const recommendations = computeRecommendations(stats, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Where to focus your next practice session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((recommendation) => (
            <div
              key={recommendation.title}
              className="flex items-start gap-3 rounded-2xl border border-border/70 bg-background/60 p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{recommendation.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
