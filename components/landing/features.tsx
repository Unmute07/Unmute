"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { FeatureCard } from "@/components/landing/feature-card";
import { SectionHeading } from "@/components/landing/section-heading";

type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type FeaturesProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  features: FeatureItem[];
};

export function Features({
  eyebrow = "Features",
  title = "A premium practice experience built for real interviews",
  description = "Everything you need to prepare with confidence, from role-specific questions to intelligent feedback and measurable progress.",
  features,
}: FeaturesProps) {
  return (
    <section id="features" className="section-container">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
