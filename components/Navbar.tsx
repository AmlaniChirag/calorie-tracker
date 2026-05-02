"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 nav-blur bg-white/80 dark:bg-[rgb(var(--surface))]/80 backdrop-blur-md border-b border-[rgb(var(--border))]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <span className="font-bold text-[rgb(var(--text))] text-base tracking-tight select-none">
            Cal<span className="text-green-600">Track</span>
          </span>

          {/* Desktop nav — inline in header */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                      : "text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] hover:bg-slate-100 dark:hover:bg-white/5"
                  )}
                >
                  <Icon size={15} strokeWidth={active ? 2.5 : 1.8} />
                  {label}
                </Link>
              );
            })}
          </nav>

          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* ── Bottom tab bar (mobile only) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden nav-blur bg-white/90 dark:bg-[rgb(var(--surface))]/90 backdrop-blur-md border-t border-[rgb(var(--border))]">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-6 safe-bottom">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 min-w-[64px] press"
              >
                <span
                  className={cn(
                    "w-10 h-8 flex items-center justify-center rounded-2xl transition-all duration-200",
                    active
                      ? "bg-green-100 dark:bg-green-950/50"
                      : ""
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={cn(
                      "transition-colors duration-200",
                      active
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-400 dark:text-slate-500"
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    active
                      ? "text-green-600 dark:text-green-400"
                      : "text-slate-400 dark:text-slate-500"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
