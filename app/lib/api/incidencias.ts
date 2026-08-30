import { apiClient } from "./client";

export type IncidentStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type IncidentPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface Incident {
  id: number;
  name: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  reportedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  automationId: number;
  userId: number;

  // Lo utilizaremos cuando el backend lo incluya
  automation?: {
    id: number;
    name: string;
    status: string;
  };
}

export interface IncidentPagination {
  data: Incident[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IncidentFilters {
  page?: number;
  pageSize?: number;
  status?: IncidentStatus;
  priority?: IncidentPriority;
  automationId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateIncidentRequest {
  name: string;
  description: string;
  automationId: number;
  userId: number;
}

export interface UpdateIncidentRequest {
  name?: string;
  description?: string;
}

export interface UpdateIncidentStatusRequest {
  status: IncidentStatus;
  resolvedAt?: string;
}

export interface UpdateIncidentPriorityRequest {
  priority: IncidentPriority;
}

/**
 * Obtener incidencias
 */
export async function getIncidents(
  filters: IncidentFilters = {},
): Promise<IncidentPagination> {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }

  if (filters.pageSize) {
    params.set("pageSize", String(filters.pageSize));
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.automationId) {
    params.set("automationId", String(filters.automationId));
  }

  if (filters.userId) {
    params.set("userId", String(filters.userId));
  }

  if (filters.startDate) {
    params.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    params.set("endDate", filters.endDate);
  }

  const query = params.toString();

  return apiClient<IncidentPagination>(
    `/incidents${query ? `?${query}` : ""}`,
  );
}

/**
 * Obtener una incidencia por ID
 */
export async function getIncidentById(
  id: number,
): Promise<Incident> {
  return apiClient<Incident>(`/incidents/${id}`);
}

/**
 * Crear una incidencia
 */
export async function createIncident(
  data: CreateIncidentRequest,
): Promise<Incident> {
  return apiClient<Incident>("/incidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Actualizar nombre/descripción
 */
export async function updateIncident(
  id: number,
  data: UpdateIncidentRequest,
): Promise<Incident> {
  return apiClient<Incident>(`/incidents/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Cambiar estado
 */
export async function updateIncidentStatus(
  id: number,
  data: UpdateIncidentStatusRequest,
): Promise<Incident> {
  return apiClient<Incident>(`/incidents/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Cambiar prioridad
 */
export async function updateIncidentPriority(
  id: number,
  data: UpdateIncidentPriorityRequest,
): Promise<Incident> {
  return apiClient<Incident>(`/incidents/${id}/priority`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Historial
 */
export async function getIncidentHistory(
  automationId?: number,
) {
  const query = automationId
    ? `?automationId=${automationId}`
    : "";

  return apiClient<Incident[]>(
    `/incidents/history/all${query}`,
  );
}

/**
 * Incidencias activas de una automatización
 */
export async function getActiveIncidentsByAutomation(
  automationId: number,
): Promise<Incident[]> {
  return apiClient<Incident[]>(
    `/incidents/automation/${automationId}/active`,
  );
}