"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import { AutomationStats } from "@/app/lib/api/dashboard";

interface AutomationStatusChartProps {
  data: AutomationStats;
}

const COLORS = [
  "#6B4071",
  "#6C6A84",
  "#14243C",
];

export default function AutomationStatusChart({
  data,
}: AutomationStatusChartProps) {
  const chartData = [
    {
      name: "Activas",
      value: data.active,
    },
    {
      name: "Completadas",
      value: data.completed,
    },
    {
      name: "En incidencia",
      value: data.inIncident,
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