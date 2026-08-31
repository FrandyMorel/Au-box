"use client";

import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  DashboardPeriod,
  IncidentResolutionStats,
  getIncidentResolutionStats,
} from "@/app/lib/api/dashboard";

type PeriodType = "year" | "month" | "week";

interface IncidentResolutionChartProps {
  initialYear?: number;
}

export default function IncidentResolutionChart({
  initialYear,
}: IncidentResolutionChartProps) {
  const currentDate = new Date();

  const [periodType, setPeriodType] =
    useState<PeriodType>("month");

  const [year, setYear] = useState(
    initialYear ?? currentDate.getFullYear(),
  );

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1,
  );

  const [week, setWeek] = useState(
    getWeekNumber(currentDate),
  );

  const [data, setData] =
    useState<IncidentResolutionStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const period: DashboardPeriod = {
          period: periodType,
          year,
        };

        if (periodType === "month") {
          period.month = month;
        }

        if (periodType === "week") {
          period.week = week;
        }

        const result =
          await getIncidentResolutionStats(period);

        console.log("📊 Incident Resolution Data:", result);

        setData(result);
      } catch (err) {
        console.error("❌ Error loading data:", err);

        setError(
          "No se pudieron cargar las estadísticas de resolución.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [periodType, year, month, week]);

  return (
    <div className="rounded-2xl border border-[#6C6A84]/30 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#14243C]">
            Tiempo de resolución
          </h2>

          <p className="text-xs text-[#6C6A84]">
            Incidencias resueltas por período
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setPeriodType("month")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${
              periodType === "month"
                ? "bg-[#6B4071] text-white"
                : "border border-[#6C6A84]/40 bg-transparent text-[#6C6A84] hover:bg-[#6C6A84]/10"
            }`}
          >
            Mes
          </button>

          <button
            type="button"
            onClick={() => setPeriodType("week")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${
              periodType === "week"
                ? "bg-[#6B4071] text-white"
                : "border border-[#6C6A84]/40 bg-transparent text-[#6C6A84] hover:bg-[#6C6A84]/10"
            }`}
          >
            Semana
          </button>

          <button
            type="button"
            onClick={() => setPeriodType("year")}
            className={`rounded px-2 py-0.5 text-xs font-medium transition ${
              periodType === "year"
                ? "bg-[#6B4071] text-white"
                : "border border-[#6C6A84]/40 bg-transparent text-[#6C6A84] hover:bg-[#6C6A84]/10"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        <select
          value={year}
          onChange={(e) =>
            setYear(Number(e.target.value))
          }
          className="rounded border border-[#6C6A84]/40 bg-[#E9DBD7] px-1.5 py-0.5 text-xs text-[#14243C] outline-none"
        >
          {Array.from(
            { length: 5 },
            (_, index) =>
              currentDate.getFullYear() - index,
          ).map((itemYear) => (
            <option key={itemYear} value={itemYear}>
              {itemYear}
            </option>
          ))}
        </select>

        {periodType === "month" && (
          <select
            value={month}
            onChange={(e) =>
              setMonth(Number(e.target.value))
            }
            className="rounded border border-[#6C6A84]/40 bg-[#E9DBD7] px-1.5 py-0.5 text-xs text-[#14243C] outline-none"
          >
            <option value={1}>Enero</option>
            <option value={2}>Febrero</option>
            <option value={3}>Marzo</option>
            <option value={4}>Abril</option>
            <option value={5}>Mayo</option>
            <option value={6}>Junio</option>
            <option value={7}>Julio</option>
            <option value={8}>Agosto</option>
            <option value={9}>Septiembre</option>
            <option value={10}>Octubre</option>
            <option value={11}>Noviembre</option>
            <option value={12}>Diciembre</option>
          </select>
        )}

        {periodType === "week" && (
          <select
            value={week}
            onChange={(e) =>
              setWeek(Number(e.target.value))
            }
            className="rounded border border-[#6C6A84]/40 bg-[#E9DBD7] px-1.5 py-0.5 text-xs text-[#14243C] outline-none"
          >
            {Array.from(
              { length: 53 },
              (_, index) => index + 1,
            ).map((weekNumber) => (
              <option
                key={weekNumber}
                value={weekNumber}
              >
                Sem {weekNumber}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-3 h-40 w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-[#6C6A84]">
            Cargando...
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center text-xs text-red-500">
            {error}
          </div>
        ) : !data || !data.data || data.data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-[#6C6A84]">
            No hay datos
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={50}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10 }}
                width={30}
              />

              <Tooltip 
                contentStyle={{ fontSize: "11px" }}
                formatter={(value) => [value, "Resueltas"]}
              />

              <Line
                type="monotone"
                dataKey="count"
                stroke="#6B4071"
                strokeWidth={1.5}
                dot={{ fill: "#6B4071", r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {data && (
        <div className="mt-2 text-xs text-[#6C6A84]">
          Total: <span className="font-semibold text-[#14243C]">{data.total}</span>
        </div>
      )}
    </div>
  );
}

function getWeekNumber(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);

  const firstThursday = new Date(
    target.getFullYear(),
    0,
    4,
  );

  const firstThursdayDay =
    (firstThursday.getDay() + 6) % 7;

  firstThursday.setDate(
    firstThursday.getDate() -
      firstThursdayDay +
      3,
  );

  const week =
    1 +
    Math.round(
      (target.getTime() -
        firstThursday.getTime()) /
        (7 * 24 * 60 * 60 * 1000),
    );

  return week;
}