"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatKRWShort } from "@/lib/utils/format";

interface MonthlyData {
  month: string;
  total: number;
}

interface ClientData {
  clientName: string;
  total: number;
}

const PIE_COLORS = ["#4F46E5", "#7C3AED", "#2563EB", "#059669", "#D97706"];

function formatMonthLabel(month: string): string {
  const [, m] = month.split("-");
  return `${Number(m)}월`;
}

export function MonthlyRevenueChart({ data }: { data: MonthlyData[] }) {
  const hasData = data.some((d) => d.total > 0);

  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        매출 데이터가 없습니다
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(17,24,39,0.06)" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatKRWShort}
          tick={{ fontSize: 11, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value) => [`${formatKRWShort(Number(value))}원`, "매출"]}
          labelFormatter={(label) => formatMonthLabel(String(label))}
          contentStyle={{
            borderRadius: 8,
            border: "none",
            boxShadow: "0 2px 8px rgba(17,24,39,0.08)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ClientRevenueChart({ data }: { data: ClientData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        고객 매출 데이터가 없습니다
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            dataKey="total"
            nameKey="clientName"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${formatKRWShort(Number(value))}원`]}
            contentStyle={{
              borderRadius: 8,
              border: "none",
              boxShadow: "0 2px 8px rgba(17,24,39,0.08)",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="flex-1 space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
            />
            <span className="flex-1 truncate text-muted-foreground">
              {d.clientName}
            </span>
            <span className="font-medium text-foreground">
              {formatKRWShort(d.total)}원
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
