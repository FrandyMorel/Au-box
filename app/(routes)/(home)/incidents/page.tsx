"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/app/lib/api/client";

interface Incident {
  id: number;
  name: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  reportedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  automationId: number;
  userId: number;
}

interface PaginatedIncidents {
  data: Incident[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

type IncidentStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

type IncidentPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

const STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: "Abierta",
  IN_PROGRESS: "En progreso",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
};

const PRIORITY_LABELS: Record<IncidentPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export default function IncidentsPage() {
  const router = useRouter();

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /*
   * Cargar incidencias.
   *
   * El fetch es una operación externa/asíncrona.
   * Los setState ocurren después de obtener la respuesta.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchIncidents() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("pageSize", "10");

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        if (priorityFilter) {
          params.set("priority", priorityFilter);
        }

        const response = await apiClient<PaginatedIncidents>(
          `/incidents?${params.toString()}`,
        );

        if (cancelled) {
          return;
        }

        setIncidents(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las incidencias.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchIncidents();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, priorityFilter]);

  function handleStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function handlePriorityFilter(value: string) {
    setPriorityFilter(value);
    setPage(1);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("es-DO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Incidencias
          </h1>

          <p className="text-sm text-gray-500">
            Administración de incidencias registradas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/incidents/new")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Nueva incidencia
        </button>
      </div>

      {/* FILTROS */}

      <div className="mb-6 flex gap-4">
        <select
          value={statusFilter}
          onChange={(event) =>
            handleStatusFilter(event.target.value)
          }
          className="rounded-lg border px-3 py-2"
        >
          <option value="">Todos los estados</option>

          {Object.entries(STATUS_LABELS).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            handlePriorityFilter(event.target.value)
          }
          className="rounded-lg border px-3 py-2"
        >
          <option value="">Todas las prioridades</option>

          {Object.entries(PRIORITY_LABELS).map(
            ([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ),
          )}
        </select>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (
        <div className="py-10 text-center">
          Cargando incidencias...
        </div>
      ) : incidents.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          No hay incidencias registradas.
        </div>
      ) : (
        <>
          {/* TABLA */}

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Nombre
                  </th>

                  <th className="px-4 py-3 text-left">
                    Descripción
                  </th>

                  <th className="px-4 py-3 text-left">
                    Fecha de reporte
                  </th>

                  <th className="px-4 py-3 text-left">
                    Automatización
                  </th>

                  <th className="px-4 py-3 text-left">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-left">
                    Prioridad
                  </th>

                  <th className="px-4 py-3 text-left">
                    Acción
                  </th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="border-t"
                  >
                    <td className="px-4 py-3 font-medium">
                      {incident.name}
                    </td>

                    <td className="max-w-xs px-4 py-3">
                      <p className="line-clamp-2">
                        {incident.description}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {formatDate(incident.reportedAt)}
                    </td>

                    <td className="px-4 py-3">
                      #{incident.automationId}
                    </td>

                    <td className="px-4 py-3">
                      {STATUS_LABELS[incident.status]}
                    </td>

                    <td className="px-4 py-3">
                      {PRIORITY_LABELS[incident.priority]}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/incidents/edit/${incident.id}`,
                          )
                        }
                        className="rounded-lg border px-3 py-1 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => current - 1)
              }
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Anterior
            </button>

            <span>
              Página {page} de {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) => current + 1)
              }
              className="rounded-lg border px-4 py-2 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </main>
  );
}