"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LineChart, Mic, PlayCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: typeof PlayCircle;
};

const actions: QuickAction[] = [
  { title: "Practice", description: "Untimed reps with optional feedback after each answer", href: "/interviews/new?mode=practice", icon: Mic },
  { title: "Mock Interview", description: "A realistic run-through with feedback only at the end", href: "/interviews/new?mode=mock", icon: PlayCircle },
  { title: "View Progress", description: "Monitor your readiness trend", href: "/progress", icon: LineChart },
];

export function QuickActions() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div key={action.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.05 }}>
            <Link href={action.href}>
              <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CardTitle>{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
