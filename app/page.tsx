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
        <div className="page-container border-b border-border/70 py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Meet the founder</p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-lg font-semibold text-primary">
                  AT
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">Aarush Tadi</p>
                  <p className="text-sm text-muted-foreground">Founder, Unmute</p>
                  <p className="text-sm text-muted-foreground">EuroSchool Whitefield</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 text-sm leading-7 text-muted-foreground">
              <p>
                I&apos;m Aarush Tadi, a high school student at EuroSchool Whitefield. Unmute didn&apos;t start as a business
                idea — it started with my parents sharing their life story with me: where they came from, what they had to
                struggle through, and how they built the life that now funds my endless demand for new clothes.
              </p>
              <p>
                My dad grew up in Jaipur, a Tier 2 city. My mom grew up in Tonk, a Tier 3 city. Both households had barely
                any money. My dad walked to school at 5:30 every morning because there was no other way they could afford
                to get there, and both of my parents were brought up in Hindi-medium schools. My mom&apos;s father refused to
                fund her education even after she secured a top rank in her batch — it took weeks of convincing before he
                finally took out a loan.
              </p>
              <p className="border-l-2 border-primary/40 pl-4 text-base font-medium leading-7 text-foreground">
                Talent is everywhere, but access isn&apos;t.
              </p>
              <p>
                Despite everything working against them, they both became engineers and went on to hold senior positions at
                Fortune 500 companies like Qualcomm and Intel. Their story stayed with me. My parents had no interview
                practice, no mentorship, and none of the guidance that builds real confidence before you walk into a room.
                They had to figure it all out on their own, the hard way.
              </p>
              <p>
                This isn&apos;t just about students in Tier 2 and Tier 3 cities. It&apos;s about anyone facing a similar
                struggle — students in Tier 1 cities with few or no resources they can afford, and those who have migrated
                from smaller towns to big cities and are still finding their footing.
              </p>
              <p>
                That&apos;s why I built Unmute: a bilingual, AI-powered interview coaching platform that gives people the
                access my parents never had. If two people from Jaipur and Tonk could build the careers they did without any
                of that support, I believe giving people that support can take them even further. What my parents
                accomplished can happen on a much larger scale — and Unmute is how I want to make that possible.
              </p>
            </div>
          </div>
        </div>

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
