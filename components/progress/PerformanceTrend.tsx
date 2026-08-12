"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PerformanceTrendProps = {
  data?: Array<{ name: string; score: number }>;
};

export function PerformanceTrend({ data = [] }: PerformanceTrendProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your overall score across your most recent interviews</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="progressTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in srgb, var(--muted-foreground) 16%, transparent)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="var(--chart-1)" fill="url(#progressTrendFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 text-center text-sm text-muted-foreground">
              Complete an interview to see your trend.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
