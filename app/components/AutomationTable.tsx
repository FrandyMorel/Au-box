"use client";

import Link from "next/link";

import type {
  Automation,
  AutomationStatus,
} from "@/app/lib/api/types";

import {
  deleteAutomation,
} from "@/app/lib/api/automations";

import AutomationStatusSelect from "./AutomationStatusSelect";

interface Props {
  automations: Automation[];

  onUpdated: (
    id: number,
    status: AutomationStatus,
  ) => void;

  onDeleted: (id: number) => void;
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export default function AutomationTable({
  automations,
  onUpdated,
  onDeleted,
}: Props) {
  async function handleDelete(
    automation: Automation,
  ) {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar "${automation.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAutomation(automation.id);

      onDeleted(automation.id);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la automatización",
      );
    }
  }

  if (automations.length === 0) {
    return (
      <div className="automation-empty">
        <h3>No hay automatizaciones</h3>
        <p>
          No encontramos automatizaciones con los
          filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <div className="automation-table-wrapper">
      <table className="automation-table">
        <thead>
          <tr>
            <th>Fecha de creación</th>
            <th>Automatización</th>
            <th>Solicitado por</th>
            <th>Creado por</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {automations.map((automation) => (
            <tr key={automation.id}>
              <td>
                {formatDate(automation.createdAt)}
              </td>

              <td>
                <div className="automation-name">
                  {automation.name}
                </div>

                <div className="automation-description">
                  {automation.description}
                </div>
              </td>

              <td>{automation.requestedBy}</td>

              <td>
                <div className="created-by">
                  <strong>
                    {automation.createdByUser.name}
                  </strong>

                  <small>
                    {automation.createdByUser.email}
                  </small>
                </div>
              </td>

              <td>
                <AutomationStatusSelect
                  id={automation.id}
                  status={automation.status}
                  onChanged={(status) =>
                    onUpdated(
                      automation.id,
                      status,
                    )
                  }
                />
              </td>

              <td>
                <div className="automation-actions">
                  <Link
                    href={`/automations/${automation.id}/editar`}
                    className="button-small"
                  >
                    Editar
                  </Link>

                  <button
                    type="button"
                    className="button-small button-danger"
                    onClick={() =>
                      handleDelete(automation)
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}