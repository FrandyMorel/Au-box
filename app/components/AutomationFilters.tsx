"use client";

import type {
  AutomationStatus,
} from "@/app/lib/api/types";

interface Props {
  search: string;
  status: AutomationStatus | "";
  requestedBy: string;

  onSearchChange: (value: string) => void;
  onStatusChange: (
    value: AutomationStatus | "",
  ) => void;
  onRequestedByChange: (value: string) => void;

  onClear: () => void;
}

export default function AutomationFilters({
  search,
  status,
  requestedBy,
  onSearchChange,
  onStatusChange,
  onRequestedByChange,
  onClear,
}: Props) {
  const hasFilters =
    search !== "" ||
    status !== "" ||
    requestedBy !== "";

  return (
    <div className="automation-filters">
      <div className="automation-filter-field search-field">
        <label htmlFor="automation-search">
          Buscar
        </label>

        <input
          id="automation-search"
          type="text"
          placeholder="Nombre o descripción..."
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
        />
      </div>

      <div className="automation-filter-field">
        <label htmlFor="automation-status">
          Estado
        </label>

        <select
          id="automation-status"
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as AutomationStatus | "",
            )
          }
        >
          <option value="">Todos</option>
          <option value="ACTIVE">Activas</option>
          <option value="COMPLETED">
            Completadas
          </option>
          <option value="IN_INCIDENT">
            En incidencia
          </option>
        </select>
      </div>

      <div className="automation-filter-field">
        <label htmlFor="automation-requested-by">
          Solicitado por
        </label>

        <input
          id="automation-requested-by"
          type="text"
          placeholder="Nombre del solicitante..."
          value={requestedBy}
          onChange={(event) =>
            onRequestedByChange(event.target.value)
          }
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          className="button-secondary"
          onClick={onClear}
        >
          Limpiar
        </button>
      )}
    </div>
  );
}