"use client";

import { BarChart3, CandlestickChart, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Trades", icon: CandlestickChart },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel flex gap-2 overflow-x-auto p-2 xl:hidden">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-[140px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
              active ? "bg-accent text-background" : "bg-background/30 text-muted hover:text-text",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

