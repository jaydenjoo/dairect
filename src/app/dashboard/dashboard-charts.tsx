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

// Studio Anthem palette — Ink 계열 + Signal Amber + Rust + Dust
const PIE_COLORS = ["#141414", "#FFB800", "#C85A3B", "#8B8680", "#1F1F1F"];

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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,20,0.06)" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 12, fill: "#8B8680" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatKRWShort}
          tick={{ fontSize: 11, fill: "#8B8680" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value) => [`${formatKRWShort(Number(value))}원`, "매출"]}
          labelFormatter={(label) => formatMonthLabel(String(label))}
          contentStyle={{
            borderRadius: 2,
            border: "1px solid rgba(20,20,20,0.12)",
            boxShadow: "2px 2px 0 0 rgba(20,20,20,0.08)",
            fontSize: 12,
            background: "#FAF7F0",
          }}
        />
        <Bar dataKey="total" fill="#141414" radius={[2, 2, 0, 0]} />
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
              borderRadius: 2,
              border: "1px solid rgba(20,20,20,0.12)",
              boxShadow: "2px 2px 0 0 rgba(20,20,20,0.08)",
              fontSize: 12,
              background: "#FAF7F0",
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
