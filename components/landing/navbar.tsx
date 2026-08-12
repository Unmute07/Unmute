"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/shared/logo-mark";

type NavbarLink = {
  label: string;
  href: string;
};

type NavbarProps = {
  brandName?: string;
  links?: NavbarLink[];
  loginHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function Navbar({
  brandName = "Unmute",
  links = [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ],
  loginHref = "/login",
  ctaHref = "/signup",
  ctaLabel = "Get Started",
}: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl"
    >
      <div className="page-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <LogoMark />
          </div>
          <span className="text-lg font-semibold tracking-tight">{brandName}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href={loginHref} className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
            Login
          </Link>
          <Button asChild className="primary-button h-10 rounded-full px-4">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
