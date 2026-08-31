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
  console.log("📊 Requesters Data:", data);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-[#6C6A84]">
        No hay datos disponibles
      </div>
    );
  }

  // Validar que los datos tengan la estructura correcta
  const validData = data.filter(
    (d) => d.requester && typeof d.count === "number",
  );

  if (validData.length === 0) {
    console.warn("⚠️ Los datos no tienen la estructura esperada:", data);
    return (
      <div className="flex h-56 items-center justify-center text-xs text-[#6C6A84]">
        Formato de datos inválido
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={validData}
          layout="vertical"
          margin={{
            top: 5,
            right: 15,
            left: 70,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e0e0e0"
            horizontal={true}
            vertical={false}
          />

          <XAxis 
            type="number" 
            allowDecimals={false} 
            tick={{ fontSize: 10 }}
            width={40}
          />

          <YAxis
            type="category"
            dataKey="requester"
            width={65}
            tick={{ fontSize: 10 }}
          />

          <Tooltip 
            contentStyle={{ fontSize: "11px" }}
            formatter={(value) => [value, "Automatizaciones"]}
          />

          <Bar
            dataKey="count"
            name="Automatizaciones"
            fill="#6B4071"
            radius={[0, 4, 4, 0]}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}