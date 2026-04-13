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

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="glass-panel sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col p-6 xl:flex">
      <div className="space-y-10">
        <div className="space-y-3">
          <p className="rtl-kicker text-xs font-semibold uppercase tracking-[0.24em] text-accent">{t("layout.brand")}</p>
          <div>
            <h2 className="text-2xl font-semibold text-text">{t("layout.title")}</h2>
            <p className="text-sm text-muted">{t("layout.subtitle")}</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-transparent px-4 py-3 text-sm font-medium transition",
                  active
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "text-muted hover:border-stroke hover:bg-background/40 hover:text-text",
                )}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>

    </aside>
  );
}
