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
            Nueva automatización
          </h1>

          <p className="mt-1 text-sm text-gray-600">
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
        <section className="rounded-xl border bg-transparent p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-200px)]">
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