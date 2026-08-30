"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import AutomationForm, {
  type AutomationFormData,
} from "@/app/components/AutomationForm";

import { apiClient } from "@/app/lib/api/client";

import type { Automation } from "@/app/lib/api/types";

export default function EditAutomationPage() {
  const router = useRouter();
  const params = useParams();

  const id = Number(params.id);

  const [automation, setAutomation] =
    useState<Automation | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  /**
   * Obtener automatización
   */
  useEffect(() => {
    async function fetchAutomation() {
      if (!Number.isInteger(id) || id <= 0) {
        setError("El ID de la automatización no es válido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await apiClient<Automation>(
          `/automations/${id}`,
        );

        setAutomation(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la automatización",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAutomation();
  }, [id]);

  /**
   * Actualizar automatización
   */
  async function handleSubmit(data: AutomationFormData) {
    try {
      setSaving(true);
      setError("");

      await apiClient<Automation>(
        `/automations/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: data.name,
            description: data.description,
          }),
        },
      );

      router.push("/automations");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la automatización";

      setError(message);

      throw err;
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    router.push("/automations");
  }

  /**
   * ID inválido
   */
  if (!Number.isInteger(id) || id <= 0) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Automatización no válida
            </h1>

            <p className="mt-2 text-sm text-red-700">
              El ID proporcionado no es válido.
            </p>

            <button
              type="button"
              onClick={handleCancel}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Cargando
   */
  if (loading) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-gray-500">
              Cargando automatización...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Error / no encontrada
   */
  if (!automation) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              No se pudo cargar la automatización
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error ||
                "La automatización no existe o no está disponible."}
            </p>

            <button
              type="button"
              onClick={handleCancel}
              className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
            >
              Volver a automatizaciones
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 text-sm text-gray-500 hover:text-gray-900"
          >
            ← Volver a automatizaciones
          </button>

          <h1 className="text-2xl font-bold text-gray-900">
            Editar automatización
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Modifica la información de la automatización.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* INFORMACIÓN ACTUAL */}
        <div className="mb-5 rounded-xl border bg-gray-50 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500">
                ID
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                #{automation.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">
                Estado actual
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {getStatusLabel(automation.status)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500">
                Creado por
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {automation.createdByUser?.name ?? "Usuario"}
              </p>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <AutomationForm
            key={automation.id}
            initialData={{
              name: automation.name,
              description: automation.description,
              requestedBy: automation.requestedBy,
              implementDate:
                automation.implementDate ?? undefined,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
          />
        </section>
      </div>
    </main>
  );
}

/**
 * Texto amigable para el estado
 */
function getStatusLabel(status: Automation["status"]) {
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