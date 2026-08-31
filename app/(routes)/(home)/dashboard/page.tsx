"use client";

import { useEffect, useState } from "react";

import {
  DashboardOverview,
  AutomationStats,
  IncidentStats,
  Requester,
  getDashboardOverview,
  getDashboardAutomationStats,
  getDashboardIncidentStats,
  getDashboardRequesters,
} from "@/app/lib/api/dashboard";

import DashboardCard from "@/app/components/DashboardCard";
import AutomationStatusChart from "@/app/components/AutomationStatusChart";
import IncidentStatusChart from "@/app/components/IncidentStatusChart";
import RequestersChart from "@/app/components/RequesterChart";
import IncidentResolutionChart from "@/app/components/IncidentResolutionChart";

interface DashboardData {
  overview: DashboardOverview;
  automationStats: AutomationStats;
  incidentStats: IncidentStats;
  requesters: Requester[];
}

type TabType = "automatizaciones" | "incidencias";

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<TabType>("automatizaciones");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [
          overview,
          automationStats,
          incidentStats,
          requesters,
        ] = await Promise.all([
          getDashboardOverview(),
          getDashboardAutomationStats(),
          getDashboardIncidentStats(),
          getDashboardRequesters(),
        ]);

        setData({
          overview,
          automationStats,
          incidentStats,
          requesters,
        });
      } catch (err) {
        console.error(err);

        setError(
          "No se pudieron cargar los datos del dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E9DBD7] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-[#6C6A84]">
              Cargando dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#E9DBD7] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-300 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-[#14243C]">
              Error
            </h1>

            <p className="mt-2 text-red-500">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#E9DBD7] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER - COMPACTO */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#6B4071]">
            Dashboard
          </h1>
          <p className="text-sm text-[#6C6A84]">
            Resumen general de automatizaciones e incidencias.
          </p>
        </div>

        {/* TABS - MEJORADO */}
        <div className="mb-6 flex gap-2 border-b border-gray-300">
          <button
            onClick={() => setActiveTab("automatizaciones")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "automatizaciones"
                ? "border-b-2 border-[#6C5B8C] text-[#6C5B8C]"
                : "text-[#6C6A84] hover:text-[#14243C]"
            }`}
          >
            Automatizaciones
          </button>
          <button
            onClick={() => setActiveTab("incidencias")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "incidencias"
                ? "border-b-2 border-[#6C5B8C] text-[#6C5B8C]"
                : "text-[#6C6A84] hover:text-[#14243C]"
            }`}
          >
            Incidencias
          </button>
        </div>

        {/* CONTENIDO AUTOMATIZACIONES */}
        {activeTab === "automatizaciones" && (
          <div className="space-y-4">
            {/* CARDS - GRID COMPACTO 4 COLUMNAS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total"
                value={
                  data.automationStats.total
                }
                description="Automatizaciones registradas"
              />

              <DashboardCard
                title="Activas"
                value={
                  data.automationStats.active
                }
                description="Actualmente activas"
              />

              <DashboardCard
                title="Completadas"
                value={
                  data.automationStats.completed
                }
                description="Automatizaciones completadas"
              />

              <DashboardCard
                title="En incidencia"
                value={
                  data.automationStats.inIncident
                }
                description="Con incidencias activas"
              />
            </div>

            {/* GRÁFICOS - GRID COMPACTO 2 COLUMNAS */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-[#14243C]">
                  Automatizaciones por estado
                </h3>
                <p className="mb-3 text-xs text-[#6C6A84]">
                  Distribución actual de las automatizaciones
                </p>
                <AutomationStatusChart
                  data={data.automationStats}
                />
              </div>

              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-[#14243C]">
                  Automatizaciones por solicitante
                </h3>
                <p className="mb-3 text-xs text-[#6C6A84]">
                  Distribución según el solicitante
                </p>
                <RequestersChart
                  data={data.requesters}
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO INCIDENCIAS */}
        {activeTab === "incidencias" && (
          <div className="space-y-4">
            {/* CARDS - GRID COMPACTO 4 COLUMNAS */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total"
                value={
                  data.incidentStats.total
                }
                description="Incidencias registradas"
              />

              <DashboardCard
                title="Abiertas"
                value={
                  data.incidentStats.open
                }
                description="Incidencias abiertas"
              />

              <DashboardCard
                title="En progreso"
                value={
                  data.incidentStats.inProgress
                }
                description="Incidencias en progreso"
              />

              <DashboardCard
                title="Resueltas"
                value={
                  data.incidentStats.resolved +
                  data.incidentStats.closed
                }
                description="Resueltas o cerradas"
              />
            </div>

            {/* GRÁFICOS - GRID COMPACTO 2 COLUMNAS */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-[#14243C]">
                  Incidencias por estado
                </h3>
                <p className="mb-3 text-xs text-[#6C6A84]">
                  Distribución actual de incidencias
                </p>
                <IncidentStatusChart
                  data={data.incidentStats}
                />
              </div>

              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <h3 className="mb-2 text-sm font-bold text-[#14243C]">
                  Tiempo de resolución
                </h3>
                <p className="mb-3 text-xs text-[#6C6A84]">
                  Historial de resoluciones
                </p>
                <IncidentResolutionChart />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}