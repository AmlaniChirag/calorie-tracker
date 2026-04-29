"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 surface shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-green-600 text-lg">🥗 NutriTrack</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 surface border-t shadow-lg md:hidden">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors text-xs",
                  active ? "text-green-600 font-semibold" : "text-muted"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Side nav (desktop) */}
      <nav className="hidden md:flex fixed left-0 top-14 bottom-0 w-52 surface border-r flex-col gap-1 p-3 z-30">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium",
                active
                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : "text-muted hover:bg-gray-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
