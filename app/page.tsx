"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo-mark";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="page-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
              <LogoMark />
            </div>
            <span className="text-lg font-semibold tracking-tight">Unmute</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              Login
            </Link>
            <Button asChild className="primary-button h-10 rounded-full px-4">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="section-container px-4 pt-16 sm:pt-20 lg:pt-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                AI-Powered Interview Coach
              </div>
              <h1 className="hero-title mt-6">
                Find your voice.
                <br />
                Ace every interview.
              </h1>
              <p className="hero-subtitle">
                Practice with realistic questions, get nuanced AI feedback, and build confidence with a guided plan tailored to the roles you want.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="primary-button h-12 rounded-full px-6">
                  <Link href="/signup">
                    Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tailored interview prep
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Instant AI guidance
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="pricing" className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
            className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/8 via-background to-accent/60 p-8 text-center shadow-sm sm:p-12"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Ready to begin?</p>
            <h2 className="hero-title mt-4 text-3xl sm:text-4xl">
              Turn preparation into momentum.
            </h2>
            <p className="hero-subtitle mx-auto mt-4 text-base">
              Create your account and start practicing with a smarter, calmer path to interview confidence.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="primary-button h-12 rounded-full px-6">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>

      <footer id="contact" className="border-t border-border/70 bg-background/80">
        <div className="page-container grid gap-10 py-12 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
                <LogoMark />
              </div>
              <span className="text-lg font-semibold tracking-tight">Unmute</span>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              AI-powered interview preparation for candidates who want to feel ready and perform with confidence.
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="mailto:hello@unmute.ai" className="transition-colors hover:text-foreground">hello@unmute.ai</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
