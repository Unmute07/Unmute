"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PerformanceChartProps = {
  data?: Array<{ name: string; score: number }>;
};

export function PerformanceChart({ data = [
  { name: "Mon", score: 74 },
  { name: "Tue", score: 80 },
  { name: "Wed", score: 78 },
  { name: "Thu", score: 88 },
  { name: "Fri", score: 84 },
  { name: "Sat", score: 92 },
  { name: "Sun", score: 90 },
] }: PerformanceChartProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }}>
      <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your weekly readiness trajectory</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in srgb, var(--muted-foreground) 16%, transparent)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} domain={[60, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="var(--chart-1)" fill="url(#performanceFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
