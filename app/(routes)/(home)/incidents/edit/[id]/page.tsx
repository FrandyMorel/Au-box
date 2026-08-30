"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
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

export default function EditIncidentPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params.id;

  const id =
    typeof rawId === "string"
      ? Number(rawId)
      : Array.isArray(rawId)
        ? Number(rawId[0])
        : NaN;

  const validId = Number.isInteger(id) && id > 0;

  const [incident, setIncident] =
    useState<Incident | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] =
    useState<IncidentStatus>("OPEN");

  const [priority, setPriority] =
    useState<IncidentPriority>("MEDIUM");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /*
   * Si el ID no es válido, no necesitamos modificar
   * ningún estado. Lo calculamos directamente.
   */

  useEffect(() => {
    if (!validId) {
      return;
    }

    let cancelled = false;

    async function fetchIncident() {
      try {
        setLoading(true);
        setError("");

        const response = await apiClient<Incident>(
          `/incidents/${id}`,
        );

        if (cancelled) {
          return;
        }

        setIncident(response);
        setName(response.name);
        setDescription(response.description);
        setStatus(response.status);
        setPriority(response.priority);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la incidencia.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchIncident();

    return () => {
      cancelled = true;
    };
  }, [id, validId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      /*
       * Actualizar nombre y descripción
       */
      await apiClient<Incident>(`/incidents/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name,
          description,
        }),
      });

      /*
       * Actualizar estado solamente si cambió.
       */
      if (incident && status !== incident.status) {
        await apiClient<Incident>(
          `/incidents/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status,
            }),
          },
        );
      }

      /*
       * Actualizar prioridad solamente si cambió.
       */
      if (incident && priority !== incident.priority) {
        await apiClient<Incident>(
          `/incidents/${id}/priority`,
          {
            method: "PATCH",
            body: JSON.stringify({
              priority,
            }),
          },
        );
      }

      Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "La incidencia ha sido actualizada exitosamente",
        confirmButtonColor: "#6B4071",
        timer: 2000,
        timerProgressBar: true,
      });

      router.push("/incidents");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la incidencia.";

      setError(message);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#6B4071",
      });
    } finally {
      setSaving(false);
    }
  }

  /*
   * ID inválido
   */
  if (!validId) {
    return (
      <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Incidencia no válida
            </h1>

            <p className="mt-2 text-sm text-red-700">
              El ID proporcionado no es válido.
            </p>

            <button
              type="button"
              onClick={() => router.push("/incidents")}
              className="buttonPrimary mt-4 px-4 py-2 text-sm"
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Cargando
   */
  if (loading) {
    return (
      <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#6B4071]" />
              <p className="text-sm text-gray-500">
                Cargando incidencia...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.push("/incidents")}
            className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-300 transition"
            title="Volver a incidencias"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 512 512"
              className="w-6 h-6"
            >
              <path d="M0 0h512v512H0z" fill="none" />
              <path
                fill="#14243c"
                d="M48 256c0 114.87 93.13 208 208 208s208-93.13 208-208S370.87 48 256 48S48 141.13 48 256m212.65-91.36a16 16 0 0 1 .09 22.63L208.42 240H342a16 16 0 0 1 0 32H208.42l52.32 52.73A16 16 0 1 1 238 347.27l-79.39-80a16 16 0 0 1 0-22.54l79.39-80a16 16 0 0 1 22.65-.09"
              />
            </svg>
          </button>

          <h1 className="text-2xl font-bold" style={{ color: "#6B4071" }}>
            Editar incidencia
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Incidencia #{id}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* INFORMACIÓN ACTUAL */}
        {incident && (
          <div className="mb-5 rounded-xl border bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Automatización
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  #{incident.automationId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Usuario
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  #{incident.userId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500">
                  Fecha de reporte
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {new Date(incident.reportedAt).toLocaleString(
                    "es-DO",
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FORMULARIO */}
        <section className="rounded-xl border bg-white p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-400px)]">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* NOMBRE */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Nombre
                <span className="text-red-600 ml-1">*</span>
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                minLength={3}
                maxLength={255}
                disabled={saving}
                required
                className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Descripción
                <span className="text-red-600 ml-1">*</span>
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                minLength={10}
                maxLength={2000}
                rows={6}
                disabled={saving}
                required
                className="w-full resize-none rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
              />
            </div>

            {/* ESTADO */}
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium"
              >
                Estado
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as IncidentStatus,
                  )
                }
                disabled={saving}
                className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
              >
                {Object.entries(STATUS_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* PRIORIDAD */}
            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-medium"
              >
                Prioridad
              </label>

              <select
                id="priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as IncidentPriority,
                  )
                }
                disabled={saving}
                className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
              >
                {Object.entries(PRIORITY_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* BOTONES */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/incidents")}
                disabled={saving}
                className="buttonSecondary px-5 py-3 font-medium"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="buttonPrimary px-5 py-3 font-medium"
              >
                {saving
                  ? "Guardando..."
                  : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}