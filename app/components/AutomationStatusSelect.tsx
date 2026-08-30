"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import type { AutomationStatus } from "@/app/lib/api/types";
import {
  updateAutomationStatus,
} from "@/app/lib/api/automations";
import AutomationStatusBadge from "./AutomationBadge";

interface Props {
  id: number;
  status: AutomationStatus;
  onChanged: (status: AutomationStatus) => void;
}

export default function AutomationStatusSelect({
  id,
  status,
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    const newStatus =
      event.target.value as AutomationStatus;

    if (newStatus === status) {
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Cambiar estado",
      text:
        newStatus === "IN_INCIDENT"
          ? "La automatización pasará a estado EN INCIDENCIA. ¿Deseas continuar?"
          : `¿Cambiar el estado a ${
              newStatus === "ACTIVE"
                ? "Activa"
                : newStatus === "COMPLETED"
                  ? "Completada"
                  : "En incidencia"
            }?`,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      confirmButtonColor: "#6B4071",
    });

    if (!result.isConfirmed) {
      event.target.value = status;
      return;
    }

    try {
      setLoading(true);

      const updated =
        await updateAutomationStatus(
          id,
          newStatus,
        );

      onChanged(updated.status);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "No se pudo cambiar el estado",
        confirmButtonColor: "#6B4071",
      });

      event.target.value = status;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="automation-status-control">
      <AutomationStatusBadge status={status} />

      <select
        value={status}
        onChange={handleChange}
        disabled={loading}
        aria-label="Cambiar estado"
        className="rounded-md border border-gray-300 px-2 py-1 text-xs outline-none focus:border-[#6B4071] disabled:opacity-50"
        style={{ backgroundColor: "#E9DBD7" }}
      >
        <option value="ACTIVE">Activa</option>
        <option value="COMPLETED">Completada</option>
        <option value="IN_INCIDENT">
          En incidencia
        </option>
      </select>
    </div>
  );
}