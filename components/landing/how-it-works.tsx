"use client";

import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/landing/section-heading";

type Step = {
  title: string;
  description: string;
  number: string;
};

type HowItWorksProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  steps: Step[];
};

export function HowItWorks({
  eyebrow = "How It Works",
  title = "Prepare in four clear steps",
  description = "Move from upload to readiness with a focused workflow that keeps each session practical and useful.",
  steps,
}: HowItWorksProps) {
  return (
    <section id="how-it-works" className="section-container">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: index * 0.06 }}
          >
            <Card className="hover-card h-full border-border/70 bg-card/80 p-1 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-primary">
                  <span className="text-sm font-semibold">{step.number}</span>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription className="mt-2">{step.description}</CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
