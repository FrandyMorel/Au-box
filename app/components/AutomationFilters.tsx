"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiClient } from "@/app/lib/api/client";

import type {
  Automation,
  AutomationStatus,
  PaginatedAutomationResponse,
} from "@/app/lib/api/types";

const PAGE_SIZE = 3;

const STATUS_OPTIONS: {
  value: AutomationStatus;
  label: string;
}[] = [
  {
    value: "ACTIVE",
    label: "Activa",
  },
  {
    value: "COMPLETED",
    label: "Completada",
  },
  {
    value: "IN_INCIDENT",
    label: "En incidencia",
  },
];

export default function AutomationsPage() {
  const router = useRouter();

  // ============================================================
  // ESTADO
  // ============================================================

  const [automations, setAutomations] = useState<Automation[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    AutomationStatus | ""
  >("");

  const [updatingStatusId, setUpdatingStatusId] = useState<
    number | null
  >(null);

  const [deletingId, setDeletingId] = useState<number | null>(
    null,
  );

  // ============================================================
  // CARGAR AUTOMATIZACIONES
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAutomations() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (statusFilter) {
          params.set("status", statusFilter);
        }

        const response =
          await apiClient<PaginatedAutomationResponse>(
            `/automations?${params.toString()}`,
          );

        if (cancelled) {
          return;
        }

        setAutomations(response.data);
        setTotal(response.total);
        setTotalPages(response.totalPages);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las automatizaciones",
        );

        setAutomations([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAutomations();

    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter]);

  // ============================================================
  // NUEVA AUTOMATIZACIÓN
  // ============================================================

  function handleCreate() {
    router.push("/automations/new");
  }

  // ============================================================
  // EDITAR AUTOMATIZACIÓN
  // ============================================================

  function handleEdit(automation: Automation) {
    router.push(`/automations/${automation.id}/edit`);
  }

  // ============================================================
  // CAMBIAR ESTADO
  // ============================================================

  async function handleStatusChange(
    automation: Automation,
    newStatus: AutomationStatus,
  ) {
    if (automation.status === newStatus) {
      return;
    }

    try {
      setUpdatingStatusId(automation.id);
      setError("");

      await apiClient<Automation>(
        `/automations/${automation.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: newStatus,
          }),
        },
      );

      // Actualizamos solamente la fila modificada.
      setAutomations((current) =>
        current.map((item) =>
          item.id === automation.id
            ? {
                ...item,
                status: newStatus,
                statusChangedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  async function handleDelete(automation: Automation) {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar la automatización "${automation.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(automation.id);
      setError("");

      await apiClient<{ message: string; id: number }>(
        `/automations/${automation.id}`,
        {
          method: "DELETE",
        },
      );

      // Eliminamos la fila del estado local.
      setAutomations((current) =>
        current.filter(
          (item) => item.id !== automation.id,
        ),
      );

      setTotal((current) => Math.max(0, current - 1));

      // Si eliminamos el último elemento de una página,
      // regresamos a la página anterior.
      if (automations.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la automatización",
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================
  // CAMBIAR BÚSQUEDA
  // ============================================================

  function handleSearchChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value);
    setPage(1);
  }

  // ============================================================
  // CAMBIAR FILTRO
  // ============================================================

  function handleStatusFilterChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const value =
      event.target.value as AutomationStatus | "";

    setStatusFilter(value);
    setPage(1);
  }

  // ============================================================
  // LIMPIAR FILTROS
  // ============================================================

  function handleClearFilters() {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================

  function handlePreviousPage() {
    if (page > 1) {
      setPage((current) => current - 1);
    }
  }

  function handleNextPage() {
    if (page < totalPages) {
      setPage((current) => current + 1);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function getStatusLabel(
    status: AutomationStatus,
  ): string {
    switch (status) {
      case "ACTIVE":
        return "Activa";

      case "COMPLETED":
        return "Completada";

      case "IN_INCIDENT":
        return "En incidencia";

      default:
        return status;
    }
  }

  function getStatusClasses(
    status: AutomationStatus,
  ): string {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "IN_INCIDENT":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function formatDate(
    date: string | Date | null | undefined,
  ): string {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("es-DO", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#6B4071" }}>
              Automatizaciones
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Gestiona las automatizaciones registradas en el
              sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="buttonPrimary px-5 py-3 text-sm font-medium"
          >
            + Nueva automatización
          </button>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 font-bold text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* ======================================================
            FILTROS
        ====================================================== */}

        <section className="mb-6 rounded-xl border p-5 shadow-sm" style={{ backgroundColor: "#E9DBD7" }}>
          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">

            {/* BUSCAR */}

            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Buscar
              </label>

              <input
                id="search"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre o descripción..."
                className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6B4071]"
              />
            </div>

            {/* ESTADO */}

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Estado
              </label>

              <select
                id="status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#6B4071]"
              >
                <option value="">
                  Todos los estados
                </option>

                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* LIMPIAR */}

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="buttonSecondary w-full px-4 py-2.5 text-sm font-medium md:w-auto"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================
            TABLA
        ====================================================== */}

        <section className="overflow-hidden rounded-xl border shadow-sm" style={{ backgroundColor: "#E9DBD7" }}>

          {/* CONTADOR */}

          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Lista de automatizaciones
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {total} automatización
                {total !== 1 ? "es" : ""}
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#6B4071]" />

                <p className="text-sm text-gray-500">
                  Cargando automatizaciones...
                </p>
              </div>
            </div>
          ) : automations.length === 0 ? (

            /* ==================================================
               EMPTY
            ================================================== */

            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
                ⚙️
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No hay automatizaciones
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                {search || statusFilter
                  ? "No encontramos automatizaciones que coincidan con los filtros."
                  : "Todavía no se ha creado ninguna automatización."}
              </p>

              {!search && !statusFilter && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="buttonPrimary mt-5 px-5 py-2.5 text-sm font-medium"
                >
                  Crear automatización
                </button>
              )}
            </div>
          ) : (

            /* ==================================================
               TABLE
            ================================================== */

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">

                <thead className="border-b" style={{ backgroundColor: "#f5f0ed" }}>
                  <tr>
                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Automatización
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Fecha de creación
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Solicitado por
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Creado por
                    </th>

                    <th className="px-5 py-4 font-semibold text-gray-600">
                      Estado
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {automations.map((automation) => (
                    <tr
                      key={automation.id}
                      className="transition hover:opacity-70"
                    >

                      {/* AUTOMATIZACIÓN */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {automation.name}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                            {automation.description}
                          </p>
                        </div>
                      </td>

                      {/* FECHA */}

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDate(automation.createdAt)}
                      </td>

                      {/* SOLICITADO POR */}

                      <td className="px-5 py-4 text-gray-600">
                        {automation.requestedBy}
                      </td>

                      {/* CREADO POR */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {automation.createdByUser?.name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {automation.createdByUser?.email}
                          </p>
                        </div>
                      </td>

                      {/* ESTADO */}

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">

                          <span
                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                              automation.status,
                            )}`}
                          >
                            {getStatusLabel(
                              automation.status,
                            )}
                          </span>

                          {/* CAMBIO RÁPIDO DE ESTADO */}

                          <select
                            value={automation.status}
                            disabled={
                              updatingStatusId ===
                              automation.id
                            }
                            onChange={(event) =>
                              handleStatusChange(
                                automation,
                                event.target
                                  .value as AutomationStatus,
                              )
                            }
                            className="w-fit rounded-md border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-[#6B4071]"
                          >
                            {STATUS_OPTIONS.map(
                              (option) => (
                                <option
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </option>
                              ),
                            )}
                          </select>

                          {updatingStatusId ===
                            automation.id && (
                            <span className="text-xs text-gray-400">
                              Actualizando...
                            </span>
                          )}

                        </div>
                      </td>

                      {/* ACCIONES */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">

                          {/* EDITAR */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(automation)
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            Editar
                          </button>

                          {/* ELIMINAR */}

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              automation.id
                            }
                            onClick={() =>
                              handleDelete(
                                automation,
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId ===
                            automation.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

          {/* ====================================================
              PAGINACIÓN
          ==================================================== */}

          {!loading && automations.length > 0 && (
            <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-gray-500">
                Página {page} de {totalPages}
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page <= 1}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Anterior
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente →
                </button>

              </div>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}