"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";

type Point = {
  label: string;
  equity: number;
  drawdown: number;
};

export function EquityCurveChart({ data }: { data: Point[] }) {
  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <CardTitle>Equity curve</CardTitle>
        <CardDescription>Muestra la evolución acumulada del P&amp;L neto de trades cerrados.</CardDescription>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-stroke text-sm text-muted">
          Aún no hay trades cerrados para dibujar la curva.
        </div>
      ) : (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3dd9b4" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3dd9b4" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2a3d" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" stroke="#90a0bc" tickLine={false} axisLine={false} />
              <YAxis stroke="#90a0bc" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#101725", borderColor: "#1f2a3d", borderRadius: 16 }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="equity" stroke="#3dd9b4" strokeWidth={2.5} fill="url(#equityFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

