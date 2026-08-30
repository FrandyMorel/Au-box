"use client";

import { useState } from "react";
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

    const message =
      newStatus === "IN_INCIDENT"
        ? "La automatización pasará a estado EN INCIDENCIA. ¿Deseas continuar?"
        : `¿Cambiar el estado a ${newStatus}?`;

    if (!window.confirm(message)) {
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
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado",
      );

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