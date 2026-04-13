"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Item = {
  bucket: string;
  count: number;
};

export function RDistributionChart({ data }: { data: Item[] }) {
  const { t } = useTranslation();

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>{t("charts.rDistribution.title")}</CardTitle>
        <CardDescription>{t("charts.rDistribution.description")}</CardDescription>
      </div>

      {data.every((item) => item.count === 0) ? (
        <div className="flex h-[280px] items-center justify-center rounded-2xl border border-dashed border-stroke text-sm text-muted">
          {t("charts.rDistribution.empty")}
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#1f2a3d" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="bucket" stroke="#90a0bc" tickLine={false} axisLine={false} />
              <YAxis stroke="#90a0bc" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#101725", borderColor: "#1f2a3d", borderRadius: 16 }} />
              <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#f6ad55" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
