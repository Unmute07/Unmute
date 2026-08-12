"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type WelcomeCardProps = {
  name?: string;
  headline?: string;
  description?: string;
};

export function WelcomeCard({
  name = "there",
  headline = "You’re ready for your next interview.",
  description = "Keep the momentum going with a focused practice session and a clear path to stronger answers.",
}: WelcomeCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/8 via-background to-accent/70 shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-sm font-medium text-primary dark:bg-card/70">
              <Sparkles className="h-4 w-4" />
              Welcome back, {name}
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{headline}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          <Button asChild className="primary-button h-11 rounded-full px-5">
            <Link href="/interviews/new">
              Start Practice <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
