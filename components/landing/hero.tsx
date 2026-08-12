"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, CirclePlay, Sparkles, Trophy, Video, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type HeroProps = {
  badge?: string;
  title: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  highlights?: string[];
  children?: React.ReactNode;
};

export function Hero({
  badge = "AI-Powered Interview Coach",
  title,
  description,
  primaryCtaLabel = "Start Practicing",
  primaryCtaHref = "/signup",
  secondaryCtaLabel = "Watch Demo",
  secondaryCtaHref = "#how-it-works",
  highlights = ["Tailored interview prep", "Instant AI guidance"],
  children,
}: HeroProps) {
  return (
    <section className="section-container px-4 pt-16 sm:pt-20 lg:pt-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {badge}
          </div>
          <h1 className="hero-title mt-6">{title}</h1>
          <p className="hero-subtitle">{description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="primary-button h-12 rounded-full px-6">
              <Link href={primaryCtaHref}>
                {primaryCtaLabel} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="secondary-button h-12 rounded-full px-6">
              <Link href={secondaryCtaHref}>
                <CirclePlay className="mr-2 h-4 w-4" /> {secondaryCtaLabel}
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 blur-3xl" />
          {children ?? (
            <Card className="relative border-border/70 bg-card/80 p-2 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Interview Readiness</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">92%</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Trophy className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-border/70 bg-background/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Sparkles className="h-4 w-4" /> AI Feedback
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        “Your answer structure was clear, but your opening could be stronger.”
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-background/80">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Video className="h-4 w-4" /> Upcoming Interview
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">Senior Product Designer • Tomorrow at 10:00 AM</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-border/70 bg-primary/5">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">Practice Streak</p>
                      <p className="mt-1 text-sm text-muted-foreground">8 days strong</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-medium text-primary shadow-sm dark:bg-card/70">
                      <Play className="h-4 w-4" /> Continue
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </section>
  );
}
