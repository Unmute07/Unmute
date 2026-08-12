"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AITipsCardProps = {
  title?: string;
  tip?: string;
};

export function AITipsCard({ title = "AI coaching tip", tip = "Use the STAR method to structure your stories with clearer examples and measurable outcomes." }: AITipsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
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
        <CardContent className="space-y-4">
          <p className="text-sm leading-7 text-muted-foreground">{tip}</p>
          <Button className="rounded-full border border-border/70 bg-background/70 text-foreground hover:bg-background">
            Explore coaching <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
