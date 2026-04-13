"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/format";
import { getLanguageLocale } from "@/src/i18n/settings";

type Item = {
  label: string;
  winRate: number;
};

export function WinRateTrendChart({ data }: { data: Item[] }) {
  const { t, i18n } = useTranslation();
  const locale = getLanguageLocale(i18n.language);

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>{t("charts.winRateTrend.title")}</CardTitle>
        <CardDescription>{t("charts.winRateTrend.description")}</CardDescription>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-stroke text-sm text-muted">
          {t("charts.winRateTrend.empty")}
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1f2a3d" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" stroke="#90a0bc" tickLine={false} axisLine={false} />
              <YAxis stroke="#90a0bc" tickLine={false} axisLine={false} tickFormatter={(value) => formatPercent(Number(value), 0, locale)} />
              <Tooltip
                contentStyle={{ backgroundColor: "#101725", borderColor: "#1f2a3d", borderRadius: 16 }}
                formatter={(value: number) => formatPercent(value, 2, locale)}
              />
              <Line type="monotone" dataKey="winRate" stroke="#3dd9b4" strokeWidth={3} dot={{ fill: "#3dd9b4" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
