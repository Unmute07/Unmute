"use client";

import Link from "next/link";

import { LogoMark } from "@/components/shared/logo-mark";

type FooterLink = {
  label: string;
  href: string;
};

type FooterProps = {
  brandName?: string;
  description?: string;
  columns?: Array<{
    title: string;
    links: FooterLink[];
  }>;
};

export function Footer({
  brandName = "Unmute",
  description = "AI-powered interview preparation for candidates who want to feel ready and perform with confidence.",
  columns = [
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How it Works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "aarush.tadi2212@gmail.com", href: "mailto:aarush.tadi2212@gmail.com" },
        { label: "9352468510", href: "tel:+919352468510" },
        { label: "LinkedIn", href: "#" },
        { label: "X", href: "#" },
      ],
    },
  ],
}: FooterProps) {
  return (
    <footer id="contact" className="border-t border-border/70 bg-background/80">
      <div className="page-container grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
              <LogoMark />
            </div>
            <span className="text-lg font-semibold tracking-tight">{brandName}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
