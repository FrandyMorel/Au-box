"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Requester } from "@/app/lib/api/dashboard";

interface RequestersChartProps {
  data: Requester[];
}

export default function RequestersChart({
  data,
}: RequestersChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-[#6C6A84]">
        No hay datos disponibles.
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 0,
            right: 20,
            left: 80,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />

          <YAxis
            type="category"
            dataKey="requester"
            width={75}
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Bar
            dataKey="count"
            name="Automatizaciones"
            fill="#6B4071"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}