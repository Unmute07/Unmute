"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

type CtaProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export function Cta({
  eyebrow = "Ready to begin?",
  title = "Turn preparation into momentum.",
  description = "Create your account and start practicing with a smarter, calmer path to interview confidence.",
  primaryCtaLabel = "Create Account",
  primaryCtaHref = "/signup",
  secondaryCtaLabel = "Talk to Sales",
  secondaryCtaHref = "#contact",
}: CtaProps) {
  return (
    <section id="pricing" className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35 }}
        className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/8 via-background to-accent/60 p-8 text-center shadow-sm sm:p-12"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <h2 className="hero-title mt-4 text-3xl sm:text-4xl">{title}</h2>
        <p className="hero-subtitle mx-auto mt-4 text-base">{description}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="primary-button h-12 rounded-full px-6">
            <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
          </Button>
          <Button asChild variant="outline" className="secondary-button h-12 rounded-full px-6">
            <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
