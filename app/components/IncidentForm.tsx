"use client";

import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
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

        Swal.fire({
          icon: "success",
          title: "¡Actualizado!",
          text: "La incidencia ha sido actualizada exitosamente",
          confirmButtonColor: "#6B4071",
          timer: 2000,
          timerProgressBar: true,
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

        Swal.fire({
          icon: "success",
          title: "¡Creada!",
          text: "La incidencia ha sido creada exitosamente",
          confirmButtonColor: "#6B4071",
          timer: 2000,
          timerProgressBar: true,
        });
      }

      onSuccess?.(response);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrió un error.";

      setError(message);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#6B4071",
      });
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
          maxLength={255}
          placeholder="Base de datos sin respuesta"
          disabled={loading}
          required
          className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        />
      </div>

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
          maxLength={2000}
          rows={5}
          placeholder="La base de datos no está respondiendo..."
          disabled={loading}
          required
          className="w-full resize-none rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        />
      </div>

      {!isEditing && (
        <div>
          <label
            htmlFor="automationId"
            className="mb-2 block text-sm font-medium"
          >
            ID de automatización
            <span className="text-red-600 ml-1">*</span>
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
            disabled={loading}
            required
            className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
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
          disabled={loading}
          className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        >
          {priorities.map((item) => (
            <option key={item} value={item}>
              {priorityLabels[item]}
            </option>
          ))}
        </select>
      </div>

      {!isEditing && (
        <div className="rounded-lg p-4 text-sm text-gray-600" style={{ backgroundColor: "#f5f0ed" }}>
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
        className="buttonPrimary w-full py-3 font-medium"
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