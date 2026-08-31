"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { IncidentStats } from "@/app/lib/api/dashboard";

interface IncidentStatusChartProps {
  data: IncidentStats;
}

const COLORS = [
  "#6B4071",
  "#6C6A84",
  "#14243C",
  "#8F899F",
];

export default function IncidentStatusChart({
  data,
}: IncidentStatusChartProps) {
  const chartData = [
    {
      name: "Abiertas",
      value: data.open,
    },
    {
      name: "En progreso",
      value: data.inProgress,
    },
    {
      name: "Resueltas",
      value: data.resolved,
    },
    {
      name: "Cerradas",
      value: data.closed,
    },
  ];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}