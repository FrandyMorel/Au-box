import { apiClient } from "./client";

// ============================================
// TIPOS
// ============================================

export type DashboardPeriod = {
  period: "year" | "month" | "week";
  year?: number;
  month?: number;
  week?: number;
};

// ============================================
// OVERVIEW
// GET /dashboard/overview
// ============================================

export interface DashboardOverview {
  totalAutomations: number;
  activeAutomations: number;
  completedAutomations: number;
  incidentAutomations: number;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  requesters: string[];
}

// ============================================
// AUTOMATION STATS
// GET /dashboard/automations/stats
// ============================================

export interface AutomationStats {
  total: number;
  active: number;
  completed: number;
  inIncident: number;
}

// ============================================
// INCIDENT STATS
// GET /dashboard/incidents/stats
// ============================================

export interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

// ============================================
// REQUESTERS
// GET /dashboard/requesters
// ============================================

export interface Requester {
  requester: string;
  count: number;
}

// ============================================
// INCIDENT RESOLUTION
// GET /dashboard/incidents/resolution
// ============================================

export interface IncidentResolutionStats {
  period: string;
  total: number;
  data: Array<{
    label: string;
    count: number;
  }>;
}

// ============================================
// AUTOMATION COMPLETION
// GET /dashboard/automations/completion
// ============================================

export interface AutomationCompletionStats {
  period: string;
  total: number;
  data: Array<{
    label: string;
    count: number;
  }>;
}

// ============================================
// INCIDENT TRANSITION
// GET /dashboard/automations/incident-transition
// ============================================

export interface IncidentTransitionStats {
  period: string;
  total: number;
  data: Array<{
    label: string;
    count: number;
  }>;
}

// ============================================
// HELPER PARA QUERY DE PERÍODO
// ============================================

function buildPeriodQuery(period: DashboardPeriod): string {
  const params = new URLSearchParams();

  params.set("period", period.period);

  if (period.year !== undefined) {
    params.set("year", String(period.year));
  }

  if (period.month !== undefined) {
    params.set("month", String(period.month));
  }

  if (period.week !== undefined) {
    params.set("week", String(period.week));
  }

  return params.toString();
}

// ============================================
// DASHBOARD OVERVIEW
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

export async function getDashboardRequesters(): Promise<Requester[]> {
  return apiClient<Requester[]>("/dashboard/requesters");
}

// ============================================
// INCIDENT RESOLUTION
// GET /dashboard/incidents/resolution
// ============================================

export async function getIncidentResolutionStats(
  period: DashboardPeriod,
): Promise<IncidentResolutionStats> {
  const query = buildPeriodQuery(period);

  return apiClient<IncidentResolutionStats>(
    `/dashboard/incidents/resolution?${query}`,
  );
}

// ============================================
// AUTOMATION COMPLETION
// GET /dashboard/automations/completion
// ============================================

export async function getAutomationCompletionStats(
  period: DashboardPeriod,
): Promise<AutomationCompletionStats> {
  const query = buildPeriodQuery(period);

  return apiClient<AutomationCompletionStats>(
    `/dashboard/automations/completion?${query}`,
  );
}

// ============================================
// AUTOMATION INCIDENT TRANSITION
// GET /dashboard/automations/incident-transition
// ============================================

export async function getIncidentTransitionStats(
  period: DashboardPeriod,
): Promise<IncidentTransitionStats> {
  const query = buildPeriodQuery(period);

  return apiClient<IncidentTransitionStats>(
    `/dashboard/automations/incident-transition?${query}`,
  );
}