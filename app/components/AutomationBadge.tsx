import type { AutomationStatus } from "@/app/lib/api/types";

interface Props {
  status: AutomationStatus;
}

const statusConfig = {
  ACTIVE: {
    label: "Activa",
    className: "automation-status active",
  },
  COMPLETED: {
    label: "Completada",
    className: "automation-status completed",
  },
  IN_INCIDENT: {
    label: "En incidencia",
    className: "automation-status incident",
  },
};

export default function AutomationStatusBadge({
  status,
}: Props) {
  const config = statusConfig[status];

  return (
    <span className={config.className}>
      <span className="automation-status-dot" />
      {config.label}
    </span>
  );
}