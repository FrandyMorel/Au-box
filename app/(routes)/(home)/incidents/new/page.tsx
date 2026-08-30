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
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Nueva incidencia
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Registra una incidencia asociada a una
          automatización.
        </p>
      </div>

      <IncidentForm
        userId={userId}
        onSuccess={() => {
          router.push("/incidents");
          router.refresh();
        }}
      />
    </main>
  );
}