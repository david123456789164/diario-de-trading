"use client";

import { BarChart3, CandlestickChart, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils/cn";

const navigation = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/trades", labelKey: "nav.trades", icon: CandlestickChart },
  { href: "/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="glass-panel flex gap-2 overflow-x-auto p-2 xl:hidden">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition",
              active ? "bg-accent text-background" : "bg-background/30 text-muted hover:text-text",
            )}
          >
            <item.icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
