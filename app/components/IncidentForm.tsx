"use client";

import { FormEvent, useState } from "react";
import {
  createIncident,
  updateIncident,
  type Incident,
  type IncidentPriority,
} from "@/app/lib/api/incidencias";

interface IncidentFormProps {
  initialData?: Incident;
  userId: number;
  onSuccess?: (incident: Incident) => void;
}

const priorities: IncidentPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const priorityLabels: Record<IncidentPriority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export default function IncidentForm({
  initialData,
  userId,
  onSuccess,
}: IncidentFormProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(
    initialData?.name ?? "",
  );

  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const [automationId, setAutomationId] = useState(
    initialData?.automationId
      ? String(initialData.automationId)
      : "",
  );

  const [priority, setPriority] =
    useState<IncidentPriority>(
      initialData?.priority ?? "MEDIUM",
    );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es obligatoria.");
      return;
    }

    if (!isEditing && !automationId) {
      setError("Debes indicar el ID de la automatización.");
      return;
    }

    const parsedAutomationId = Number(automationId);

    if (
      !isEditing &&
      (!Number.isInteger(parsedAutomationId) ||
        parsedAutomationId <= 0)
    ) {
      setError(
        "El ID de la automatización debe ser un número válido.",
      );
      return;
    }

    try {
      setLoading(true);

      let response: Incident;

      if (isEditing && initialData) {
        response = await updateIncident(initialData.id, {
          name: name.trim(),
          description: description.trim(),
        });

        if (priority !== initialData.priority) {
          // La prioridad se actualiza por su endpoint independiente.
          // Se hará desde la página de edición.
        }
      } else {
        response = await createIncident({
          name: name.trim(),
          description: description.trim(),
          automationId: parsedAutomationId,
          userId,
        });
      }

      onSuccess?.(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium"
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
          maxLength={255}
          placeholder="Base de datos sin respuesta"
          className="w-full rounded-lg border px-4 py-2"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium"
        >
          Descripción
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          maxLength={2000}
          rows={5}
          placeholder="La base de datos no está respondiendo..."
          className="w-full resize-none rounded-lg border px-4 py-2"
          disabled={loading}
        />
      </div>

      {!isEditing && (
        <div>
          <label
            htmlFor="automationId"
            className="mb-2 block text-sm font-medium"
          >
            ID de automatización
          </label>

          <input
            id="automationId"
            type="number"
            min={1}
            value={automationId}
            onChange={(event) =>
              setAutomationId(event.target.value)
            }
            placeholder="1"
            className="w-full rounded-lg border px-4 py-2"
            disabled={loading}
          />

          <p className="mt-1 text-xs text-gray-500">
            La automatización debe estar en estado ACTIVE.
          </p>
        </div>
      )}

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
          className="w-full rounded-lg border px-4 py-2"
          disabled={loading}
        >
          {priorities.map((item) => (
            <option key={item} value={item}>
              {priorityLabels[item]}
            </option>
          ))}
        </select>
      </div>

      {!isEditing && (
        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          <p>
            <strong>Estado inicial:</strong> Abierta
          </p>

          <p>
            <strong>Fecha de reporte:</strong>{" "}
            Se generará automáticamente.
          </p>

          <p>
            <strong>Usuario:</strong> Se utilizará el
            usuario autenticado.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-black px-5 py-2.5 text-white disabled:opacity-50"
      >
        {loading
          ? "Guardando..."
          : isEditing
            ? "Guardar cambios"
            : "Crear incidencia"}
      </button>
    </form>
  );
}