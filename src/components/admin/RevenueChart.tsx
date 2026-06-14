"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/lib/utils/format";

interface Props {
  data: { date: string; revenue: number }[];
}

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tickFormatter={(v: any) => {
            const d = new Date(v as string);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          interval="preserveStartEnd"
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          tickFormatter={(v: any) => `$${Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : Number(v)}`}
          width={40}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [formatPrice(Number(v)), "Revenue"]}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelFormatter={(label: any) =>
            new Date(label as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
          contentStyle={{
            fontSize: 12,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#111827"
          fill="#f3f4f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
