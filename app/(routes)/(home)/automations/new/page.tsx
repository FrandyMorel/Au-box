"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import AutomationForm, {
  type AutomationFormData,
} from "@/app/components/AutomationForm";

import { apiClient } from "@/app/lib/api/client";

import type { Automation } from "@/app/lib/api/types";

export default function NewAutomationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: AutomationFormData) {
    try {
      setLoading(true);
      setError("");

      await apiClient<Automation>("/automations", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          requestedBy: data.requestedBy,
          implementDate: data.implementDate || undefined,
        }),
      });

      // Volver al listado después de crear
      router.push("/automations");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo crear la automatización";

      setError(message);

      // Importante:
      // AutomationForm también puede mostrar errores propios.
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push("/automations");
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
            Nueva automatización
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Registra una nueva automatización en el sistema.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <AutomationForm
            initialData={undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </section>
      </div>
    </main>
  );
}