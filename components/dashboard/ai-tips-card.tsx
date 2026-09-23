"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_TIPS = [
  "Maintain steady eye contact with the camera to create a sense of confidence and direct engagement.",
  "Focus on speaking clearly and at a steady, natural pace so your tone and intent come through authentically.",
];

type AITipsCardProps = {
  title?: string;
  tips?: string[];
};

export function AITipsCard({ title = "Tips", tips = DEFAULT_TIPS }: AITipsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }} className="h-full">
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>Personalized guidance</CardDescription>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
              <BrainCircuit className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tips.map((tip, index) => (
            <p
              key={index}
              className="rounded-2xl border border-secondary/20 bg-secondary/10 p-4 text-sm leading-6 text-foreground/90"
            >
              {tip}
            </p>
          ))}
          <Button className="w-full rounded-full border border-border/70 bg-background/70 text-foreground hover:bg-background">
            Explore coaching <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
