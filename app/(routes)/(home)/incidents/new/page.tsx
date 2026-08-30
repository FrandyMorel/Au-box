"use client";

import { useRouter } from "next/navigation";
import IncidentForm from "@/app/components/IncidentForm";

export default function NewIncidentPage() {
  const router = useRouter();

  /*
   * Sustituye esto por tu mecanismo real
   * para obtener el usuario autenticado.
   */
  const userId = 1;

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
            Nueva incidencia
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Registra una incidencia asociada a una
            automatización.
          </p>
        </div>

        {/* FORMULARIO */}
        <section className="rounded-xl border bg-transparent p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-200px)]">
          <IncidentForm
            userId={userId}
            onSuccess={() => {
              router.push("/incidents");
              router.refresh();
            }}
          />
        </section>
      </div>
    </main>
  );
}