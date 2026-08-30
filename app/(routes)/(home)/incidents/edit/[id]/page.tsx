"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

      router.push("/incidents");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la incidencia.",
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ID inválido
   */
  if (!validId) {
    return (
      <main className="p-6">
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          ID de incidencia inválido.
        </div>

        <button
          type="button"
          onClick={() => router.push("/incidents")}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Volver
        </button>
      </main>
    );
  }

  /*
   * Cargando
   */
  if (loading) {
    return (
      <main className="p-6">
        <p>Cargando incidencia...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Editar incidencia
        </h1>

        <p className="text-sm text-gray-500">
          Incidencia #{id}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border p-6"
      >
        {/* NOMBRE */}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-medium"
          >
            Nombre
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
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* DESCRIPCIÓN */}

        <div>
          <label
            htmlFor="description"
            className="mb-2 block font-medium"
          >
            Descripción
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
            required
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {/* ESTADO */}

        <div>
          <label
            htmlFor="status"
            className="mb-2 block font-medium"
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
            className="w-full rounded-lg border px-3 py-2"
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
            className="mb-2 block font-medium"
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
            className="w-full rounded-lg border px-3 py-2"
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

        {/* INFORMACIÓN */}

        {incident && (
          <div className="rounded-lg bg-gray-50 p-4 text-sm">
            <p>
              <strong>Automatización:</strong>{" "}
              #{incident.automationId}
            </p>

            <p>
              <strong>Usuario:</strong> #{incident.userId}
            </p>

            <p>
              <strong>Fecha de reporte:</strong>{" "}
              {new Date(
                incident.reportedAt,
              ).toLocaleString("es-DO")}
            </p>
          </div>
        )}

        {/* BOTONES */}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/incidents")}
            className="rounded-lg border px-4 py-2"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </form>
    </main>
  );
}