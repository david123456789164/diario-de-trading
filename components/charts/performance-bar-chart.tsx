"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatCompactCurrency } from "@/lib/utils/format";
import { getLanguageLocale } from "@/src/i18n/settings";

type Item = {
  name: string;
  pnl: number;
  trades?: number;
};

export function PerformanceBarChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Item[];
}) {
  const { t, i18n } = useTranslation();
  const locale = getLanguageLocale(i18n.language);

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-stroke text-sm text-muted">
          {t("charts.performance.empty")}
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
              <CartesianGrid stroke="#1f2a3d" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" stroke="#90a0bc" tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactCurrency(Number(value), "USD", locale)} />
              <YAxis type="category" dataKey="name" width={92} stroke="#90a0bc" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#101725", borderColor: "#1f2a3d", borderRadius: 16 }}
                formatter={(value: number) => formatCurrency(value, "USD", locale)}
              />
              <Bar dataKey="pnl" radius={[0, 10, 10, 0]} fill="#3dd9b4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
