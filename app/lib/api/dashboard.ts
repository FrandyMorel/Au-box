import { apiClient } from "./client";

export type DashboardPeriod = "year" | "month" | "week";

// ============================================
// AUTOMATIZACIONES
// ============================================

export interface AutomationStats {
  total: number;
  active: number;
  completed: number;
  inIncident: number;
}

// ============================================
// INCIDENCIAS
// ============================================

export interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

// ============================================
// SOLICITANTES
// ============================================

export interface RequesterStats {
  requester: string;
  count: number;
}

// ============================================
// RESOLUCIÓN DE INCIDENCIAS
// ============================================

export interface IncidentResolutionStats {
  period: DashboardPeriod;
  year: number;
  month?: number;
  week?: number;
  data: {
    label: string;
    count: number;
  }[];
}

// ============================================
// COMPLETADO DE AUTOMATIZACIONES
// ============================================

export interface AutomationCompletionStats {
  period: DashboardPeriod;
  year: number;
  month?: number;
  week?: number;
  data: {
    label: string;
    count: number;
  }[];
}

// ============================================
// TRANSICIONES A INCIDENCIA
// ============================================

export interface IncidentTransitionStats {
  period: DashboardPeriod;
  year: number;
  month?: number;
  week?: number;
  data: {
    label: string;
    count: number;
  }[];
}

// ============================================
// OVERVIEW
// ============================================

export interface DashboardOverview {
  automations: AutomationStats;
  incidents: IncidentStats;
  requesters: RequesterStats[];
}

// ============================================
// OVERVIEW
// GET /dashboard/overview
// ============================================

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return apiClient<DashboardOverview>("/dashboard/overview");
}

// ============================================
// AUTOMATION STATS
// GET /dashboard/automations/stats
// ============================================

export async function getDashboardAutomationStats(): Promise<AutomationStats> {
  return apiClient<AutomationStats>("/dashboard/automations/stats");
}

// ============================================
// INCIDENT STATS
// GET /dashboard/incidents/stats
// ============================================

export async function getDashboardIncidentStats(): Promise<IncidentStats> {
  return apiClient<IncidentStats>("/dashboard/incidents/stats");
}

// ============================================
// REQUESTERS
// GET /dashboard/requesters
// ============================================

export async function getDashboardRequesters(): Promise<RequesterStats[]> {
  return apiClient<RequesterStats[]>("/dashboard/requesters");
}

// ============================================
// INCIDENT RESOLUTION
// GET /dashboard/incidents/resolution
// ============================================

export async function getIncidentResolutionStats(
  params: {
    period: DashboardPeriod;
    year?: number;
    month?: number;
    week?: number;
  },
): Promise<IncidentResolutionStats> {
  const searchParams = new URLSearchParams();

  searchParams.set("period", params.period);

  if (params.year !== undefined) {
    searchParams.set("year", String(params.year));
  }

  if (params.month !== undefined) {
    searchParams.set("month", String(params.month));
  }

  if (params.week !== undefined) {
    searchParams.set("week", String(params.week));
  }

  return apiClient<IncidentResolutionStats>(
    `/dashboard/incidents/resolution?${searchParams.toString()}`,
  );
}

// ============================================
// AUTOMATION COMPLETION
// GET /dashboard/automations/completion
// ============================================

export async function getAutomationCompletionStats(
  params: {
    period: DashboardPeriod;
    year?: number;
    month?: number;
    week?: number;
  },
): Promise<AutomationCompletionStats> {
  const searchParams = new URLSearchParams();

  searchParams.set("period", params.period);

  if (params.year !== undefined) {
    searchParams.set("year", String(params.year));
  }

  if (params.month !== undefined) {
    searchParams.set("month", String(params.month));
  }

  if (params.week !== undefined) {
    searchParams.set("week", String(params.week));
  }

  return apiClient<AutomationCompletionStats>(
    `/dashboard/automations/completion?${searchParams.toString()}`,
  );
}

// ============================================
// INCIDENT TRANSITION
// GET /dashboard/automations/incident-transition
// ============================================

export async function getIncidentTransitionStats(
  params: {
    period: DashboardPeriod;
    year?: number;
    month?: number;
    week?: number;
  },
): Promise<IncidentTransitionStats> {
  const searchParams = new URLSearchParams();

  searchParams.set("period", params.period);

  if (params.year !== undefined) {
    searchParams.set("year", String(params.year));
  }

  if (params.month !== undefined) {
    searchParams.set("month", String(params.month));
  }

  if (params.week !== undefined) {
    searchParams.set("week", String(params.week));
  }

  return apiClient<IncidentTransitionStats>(
    `/dashboard/automations/incident-transition?${searchParams.toString()}`,
  );
}