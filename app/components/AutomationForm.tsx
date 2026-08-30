"use client";

import { FormEvent, useState } from "react";

export interface AutomationFormData {
  name: string;
  description: string;
  requestedBy: string;
  implementDate?: string;
}

interface AutomationFormProps {
  initialData?: AutomationFormData;
  onSubmit: (data: AutomationFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function AutomationForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: AutomationFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");

  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );

  const [requestedBy, setRequestedBy] = useState(
    initialData?.requestedBy ?? "",
  );

  const [implementDate, setImplementDate] = useState(
    initialData?.implementDate
      ? formatDateTimeLocal(initialData.implementDate)
      : "",
  );

  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es requerida");
      return;
    }

    if (!requestedBy.trim()) {
      setError("El solicitante es requerido");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        requestedBy: requestedBy.trim(),
        implementDate: implementDate
          ? new Date(implementDate).toISOString()
          : undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al guardar la automatización",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-[#E9DBD7]">
      {/* Nombre */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium"
        >
          Nombre de la automatización
          <span className="text-red-600 ml-1">*</span>
        </label>

        <input
          id="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Automatización de reportes"
          maxLength={100}
          disabled={loading}
          required
          className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Descripción */}
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
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe qué hace la automatización..."
          maxLength={500}
          rows={5}
          disabled={loading}
          required
          className="w-full resize-none rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        />

        <div className="mt-1 text-right text-xs text-gray-500">
          {description.length}/500
        </div>
      </div>

      {/* Solicitante */}
      <div>
        <label
          htmlFor="requestedBy"
          className="mb-2 block text-sm font-medium"
        >
          Solicitado por
          <span className="text-red-600 ml-1">*</span>
        </label>

        <input
          id="requestedBy"
          type="text"
          value={requestedBy}
          onChange={(event) => setRequestedBy(event.target.value)}
          placeholder="Nombre del solicitante"
          maxLength={150}
          disabled={loading}
          required
          className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        />
      </div>

      {/* Fecha de implementación */}
      <div>
        <label
          htmlFor="implementDate"
          className="mb-2 block text-sm font-medium"
        >
          Fecha de implementación
        </label>

        <input
          id="implementDate"
          type="datetime-local"
          value={implementDate}
          onChange={(event) => setImplementDate(event.target.value)}
          disabled={loading}
          className="w-full rounded-lg bg-[#E9DBD7] border border-[#14243C] px-4 py-3 outline-none focus:ring-2 focus:ring-[#6B4071] focus:border-transparent disabled:opacity-50"
        />

        <p className="mt-1 text-xs text-gray-500">
          Selecciona la fecha y hora prevista para implementar la automatización.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="buttonSecondary px-5 py-3 font-medium"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="buttonPrimary px-5 py-3 font-medium"
        >
          {loading
            ? "Guardando..."
            : initialData
              ? "Guardar cambios"
              : "Crear automatización"}
        </button>
      </div>
    </form>
  );
}

/**
 * Convierte una fecha ISO del backend:
 *
 * 2026-08-30T18:30:00.000Z
 *
 * a:
 *
 * 2026-08-30T14:30
 *
 * para que pueda ser utilizada por <input type="datetime-local">
 */
function formatDateTimeLocal(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const hours = String(parsedDate.getHours()).padStart(2, "0");
  const minutes = String(parsedDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}