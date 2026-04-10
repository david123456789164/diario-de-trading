"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

type Item = {
  label: string;
  pnl: number;
};

export function MonthlyPnlChart({ data }: { data: Item[] }) {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>P&amp;L mensual</CardTitle>
        <CardDescription>Te ayuda a detectar meses fuertes, meses débiles y consistencia.</CardDescription>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-stroke text-sm text-muted">
          Todavía no hay suficiente historial mensual.
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#1f2a3d" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" stroke="#90a0bc" tickLine={false} axisLine={false} />
              <YAxis stroke="#90a0bc" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#101725", borderColor: "#1f2a3d", borderRadius: 16 }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="pnl" radius={[10, 10, 0, 0]} fill="#67b3ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

