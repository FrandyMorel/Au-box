import { apiClient } from "./client";

import type {
  Automation,
  AutomationQuery,
  AutomationStatistics,
  AutomationStatus,
  CreateAutomationRequest,
  DeleteAutomationResponse,
  PaginatedAutomationResponse,
  UpdateAutomationRequest,
  UpdateImplementationDateRequest,
  UpdateRequestedByRequest,
  UpdateStatusRequest,
} from "./types";

// ============================================
// LISTAR AUTOMATIZACIONES
// GET /automations
// ============================================

export async function getAutomations(
  params: AutomationQuery = {},
): Promise<PaginatedAutomationResponse> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page ?? 1));
  searchParams.set("limit", String(params.limit ?? 10));

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.requestedBy?.trim()) {
    searchParams.set(
      "requestedBy",
      params.requestedBy.trim(),
    );
  }

  return apiClient<PaginatedAutomationResponse>(
    `/automations?${searchParams.toString()}`,
  );
}

// ============================================
// OBTENER UNA AUTOMATIZACIÓN
// GET /automations/:id
// ============================================

export async function getAutomation(
  id: number,
): Promise<Automation> {
  return apiClient<Automation>(`/automations/${id}`);
}

// ============================================
// CREAR
// POST /automations
// ============================================

export async function createAutomation(
  data: CreateAutomationRequest,
): Promise<Automation> {
  return apiClient<Automation>("/automations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================
// ACTUALIZAR NOMBRE / DESCRIPCIÓN
// PATCH /automations/:id
// ============================================

export async function updateAutomation(
  id: number,
  data: UpdateAutomationRequest,
): Promise<Automation> {
  return apiClient<Automation>(`/automations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ============================================
// ACTUALIZAR SOLICITANTE
// PATCH /automations/:id/requested-by
// ============================================

export async function updateAutomationRequester(
  id: number,
  data: UpdateRequestedByRequest,
): Promise<Automation> {
  return apiClient<Automation>(
    `/automations/${id}/requested-by`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

// ============================================
// ACTUALIZAR FECHA
// PATCH /automations/:id/implementation-date
// ============================================

export async function updateAutomationImplementationDate(
  id: number,
  data: UpdateImplementationDateRequest,
): Promise<Automation> {
  return apiClient<Automation>(
    `/automations/${id}/implementation-date`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

// ============================================
// CAMBIAR ESTADO
// PATCH /automations/:id/status
// ============================================

export async function updateAutomationStatus(
  id: number,
  status: AutomationStatus,
): Promise<Automation> {
  const data: UpdateStatusRequest = {
    status,
  };

  return apiClient<Automation>(
    `/automations/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

// ============================================
// ELIMINAR
// DELETE /automations/:id
// ============================================

export async function deleteAutomation(
  id: number,
): Promise<DeleteAutomationResponse> {
  return apiClient<DeleteAutomationResponse>(
    `/automations/${id}`,
    {
      method: "DELETE",
    },
  );
}

// ============================================
// ESTADÍSTICAS
// GET /automations/stats/overview
// ============================================

export async function getAutomationStatistics(
  userId?: number,
): Promise<AutomationStatistics> {
  const searchParams = new URLSearchParams();

  if (userId !== undefined) {
    searchParams.set("userId", String(userId));
  }

  const query = searchParams.toString();

  return apiClient<AutomationStatistics>(
    `/automations/stats/overview${query ? `?${query}` : ""}`,
  );
}