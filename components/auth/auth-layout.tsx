"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { LogoMark } from "@/components/shared/logo-mark";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  footerText?: string;
  footerHref?: string;
  footerLinkText?: string;
};

export function AuthLayout({
  children,
  title,
  description,
  footerText,
  footerHref,
  footerLinkText,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
        <section className="hidden lg:flex">
          <div className="relative flex w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-secondary p-10 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_32%)]" />
            <div className="relative z-10">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <LogoMark className="text-xl" />
                </div>
                <span className="text-lg font-semibold tracking-tight">Unmute</span>
              </Link>

              <div className="mt-14 max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                  <Sparkles className="h-4 w-4" /> AI Interview Coach
                </div>
                <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
                  Prepare with clarity, confidence, and calm.
                </h1>
                <p className="mt-4 text-base leading-7 text-white/80">
                  Practice realistic interview questions, receive actionable AI feedback, and build momentum with every session.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-background px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
                  <LogoMark />
                </div>
                <span className="text-lg font-semibold tracking-tight">Unmute</span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
            </div>

            {children}

            {footerText && footerHref && footerLinkText ? (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {footerText}{" "}
                <Link href={footerHref} className="font-medium text-primary transition-colors hover:text-primary/80">
                  {footerLinkText}
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
