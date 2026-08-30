"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";

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

      // SweetAlert de éxito
      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: "La automatización ha sido actualizada correctamente.",
        confirmButtonText: "OK",
        confirmButtonColor: "#6B4071",
      });

      router.push("/automations");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo actualizar la automatización";

      setError(message);

      // SweetAlert de error
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonText: "Intentar de nuevo",
        confirmButtonColor: "#DC2626",
      });

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
      <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
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
              className="buttonPrimary mt-4 px-4 py-2 text-sm"
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
      <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
        <div className="mx-auto max-w-4xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#6B4071]" />
              <p className="text-sm text-gray-500">
                Cargando automatización...
              </p>
            </div>
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
      <main className="min-h-screen p-6" style={{ backgroundColor: "#E9DBD7" }}>
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
              className="buttonPrimary mt-4 px-4 py-2 text-sm"
            >
              Volver a automatizaciones
            </button>
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
            onClick={handleCancel}
            className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-300 transition"
            title="Volver a automatizaciones"
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
            Editar automatización
          </h1>

          <p className="mt-1 text-sm text-gray-600">
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
        <div className="mb-5 rounded-xl border bg-transparent p-5">
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
        <section className="rounded-xl border bg-transparent p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-400px)]">
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