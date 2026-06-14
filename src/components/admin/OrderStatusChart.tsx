"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#a855f7",
  delivered: "#22c55e",
  cancelled: "#ef4444",
};

interface Props {
  data: { status: string; count: number }[];
}

export default function OrderStatusChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return <p className="text-sm text-neutral-400 text-center py-8">No orders yet.</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
            dataKey="count"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? "#d1d5db"}
              />
            ))}
          </Pie>
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(v: any) => [
              `${Number(v)} (${((Number(v) / total) * 100).toFixed(0)}%)`,
              "",
            ]}
            contentStyle={{
              fontSize: 12,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-1.5 mt-3">
        {data.map((d) => (
          <div key={d.status} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                style={{ background: STATUS_COLORS[d.status] ?? "#d1d5db" }}
              />
              <span className="capitalize text-neutral-600">{d.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">
                {((d.count / total) * 100).toFixed(0)}%
              </span>
              <span className="font-medium text-neutral-800 w-6 text-right">{d.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
