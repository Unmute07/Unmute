"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What is Unmute?",
    answer:
      "Unmute is a bilingual, AI-powered interview coaching platform. It simulates realistic interview scenarios — from college admissions panels to job and internship interviews — so you can practice, stumble, and improve in a low-pressure space before it counts.",
  },
  {
    question: "What does \"bilingual\" actually mean here?",
    answer:
      "You're not forced to think and respond entirely in English. Unmute lets you prepare and receive feedback in the language you're most comfortable thinking in, so language itself isn't a barrier to showing your best answer.",
  },
  {
    question: "What kinds of sessions can I practice?",
    answer:
      "Choose a Practice session for untimed reps with feedback after each answer, or a Mock Interview for a realistic, full-length run-through with feedback at the end. Either way, you pick the interview type (Technical, Behavioral, HR, or Mixed) and a difficulty from Easy up to Hard.",
  },
  {
    question: "How does the AI feedback work?",
    answer:
      "Paste in a job description (and optionally your resume), and Unmute tailors questions to that role — including live, answer-aware follow-up questions. After each answer, or at the end of a session, you get structured feedback on content, clarity, and delivery, plus scores across skills like technical ability, communication, and problem-solving.",
  },
  {
    question: "Do I need a job description to get started?",
    answer:
      "Yes — paste in the job description for the role you're targeting and Unmute analyzes it to generate technical, behavioral, and HR questions that actually match what that interview will cover.",
  },
  {
    question: "Can I track my progress over time?",
    answer:
      "Yes. Your Progress page shows your overall readiness score, a skill-by-skill breakdown, your score trend across recent interviews, and your practice streak, so you can see improvement session over session.",
  },
  {
    question: "Is Unmute free to use?",
    answer: "Yes — creating an account and practicing today is free.",
  },
];

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
            <ThemeToggle />
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

        <section className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">About Unmute</p>
            <h2 className="hero-title mt-4 max-w-2xl text-3xl sm:text-4xl">
              The bilingual, AI-powered way to walk into any interview ready.
            </h2>

            <div className="mt-8 rounded-[1.75rem] border border-border/70 bg-card/60 p-6 shadow-sm sm:p-8">
              <div className="space-y-5 text-base leading-7 text-muted-foreground">
                <p>
                  Unmute is the market-leading bilingual, AI-powered interview coaching platform, built to help
                  students and young professionals walk into real interviews with confidence. It simulates realistic
                  interview scenarios — from college admissions panels to job and internship interviews — giving
                  users a low-pressure space to practice, stumble, and improve before it counts.
                </p>
                <p className="border-l-2 border-primary/40 pl-4 text-base font-medium leading-7 text-foreground">
                  What sets Unmute apart from every other interview-prep tool on the market is its bilingual design,
                  letting users prepare and receive feedback in the language they think best in, rather than forcing
                  everything through English.
                </p>
                <p>
                  Powered by best-in-class AI, the platform delivers the most personalized, structured feedback
                  available on content, clarity, and delivery after each session — making Unmute the smartest, most
                  effective way to turn interview prep from a nerve-wracking guessing game into a guided, repeatable
                  practice loop.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="faq" className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">FAQ</p>
            <h2 className="hero-title mt-4 text-3xl sm:text-4xl">Frequently asked questions.</h2>
            <div className="mt-8 max-w-3xl rounded-[1.75rem] border border-border/70 bg-card/60 px-6 shadow-sm sm:px-8">
              <Accordion type="single" collapsible>
                {FAQS.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`faq-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
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
          <div className="grid gap-8 rounded-[2rem] border border-border/70 bg-card/60 p-6 shadow-sm sm:p-8 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12">
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
              <li><a href="mailto:aarush.tadi2212@gmail.com" className="transition-colors hover:text-foreground">aarush.tadi2212@gmail.com</a></li>
              <li><a href="tel:+919352468510" className="transition-colors hover:text-foreground">9352468510</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
