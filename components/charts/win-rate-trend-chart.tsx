"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/format";

type Item = {
  label: string;
  winRate: number;
};

export function WinRateTrendChart({ data }: { data: Item[] }) {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>Evolución del win rate</CardTitle>
        <CardDescription>Permite ver si la calidad de ejecución mejora o empeora a lo largo del tiempo.</CardDescription>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-stroke text-sm text-muted">
          Aún no hay meses suficientes para mostrar evolución.
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#1f2a3d" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" stroke="#90a0bc" tickLine={false} axisLine={false} />
              <YAxis stroke="#90a0bc" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#101725", borderColor: "#1f2a3d", borderRadius: 16 }}
                formatter={(value: number) => formatPercent(value)}
              />
              <Line type="monotone" dataKey="winRate" stroke="#3dd9b4" strokeWidth={3} dot={{ fill: "#3dd9b4" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

