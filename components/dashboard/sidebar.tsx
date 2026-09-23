"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Mail, MessageSquareText, Phone, Settings, Sparkles, Trophy } from "lucide-react";

import { LogoMark } from "@/components/shared/logo-mark";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutGrid;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Interviews", href: "/interviews", icon: MessageSquareText },
  { label: "Progress", href: "/progress", icon: Trophy },
  { label: "Profile", href: "/profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 bg-sidebar px-5 py-6 text-sidebar-foreground lg:m-3 lg:flex lg:flex-col lg:rounded-[1.75rem] lg:border lg:border-sidebar-border">
      <Link href="/" className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sidebar-primary text-white shadow-sm">
          <LogoMark className="text-xl" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight">Unmute</p>
          <p className="text-sm text-sidebar-foreground/60">Interview prep</p>
        </div>
      </Link>

      <div className="mt-8 rounded-[1.25rem] border border-sidebar-primary/25 bg-gradient-to-br from-sidebar-accent via-sidebar-accent/40 to-secondary/10 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-sidebar-accent-foreground">
          <Sparkles className="h-4 w-4 text-secondary" />
          Ready to practice?
        </div>
        <p className="mt-2 text-sm leading-6 text-sidebar-foreground/60">
          Keep your streak alive with a focused session today.
        </p>
      </div>

      <p className="mt-8 px-3 text-xs font-semibold uppercase tracking-[0.24em] text-sidebar-foreground/40">
        Menu
      </p>
      <nav className="mt-3 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.25rem] border border-sidebar-border bg-sidebar-accent/40 p-4">
        <p className="text-sm font-medium text-sidebar-foreground">Contact</p>
        <p className="mt-2 text-sm font-semibold text-sidebar-foreground">Aarush Tadi</p>
        <p className="text-sm text-sidebar-foreground/60">Founder, Unmute</p>
        <div className="mt-3 space-y-2">
          <a
            href="mailto:aarush.tadi2212@gmail.com"
            className="flex items-center gap-2 text-sm font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
          >
            <Mail className="h-4 w-4" />
            aarush.tadi2212@gmail.com
          </a>
          <a
            href="tel:+919352468510"
            className="flex items-center gap-2 text-sm font-medium text-sidebar-primary transition-colors hover:text-sidebar-primary/80"
          >
            <Phone className="h-4 w-4" />
            9352468510
          </a>
        </div>
      </div>
    </aside>
  );
}
