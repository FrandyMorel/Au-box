/**
 * Interfaces para el módulo de Dashboard
 * Define los contratos de datos para todas las respuestas del dashboard
 */

/**
 * Estadísticas generales de automatizaciones
 */
export interface IAutomationStats {
  total: number;
  active: number;
  completed: number;
  inIncident: number;
}

/**
 * Estadísticas generales de incidencias
 */
export interface IIncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

/**
 * ✅ ACTUALIZADO: Información de un solicitante
 * Cambio: name → requester, automationCount → count
 */
export interface IRequester {
  requester: string; // ✅ Cambio: name -> requester
  count: number; // ✅ Cambio: automationCount -> count
}

/**
 * ✅ ACTUALIZADO: Dato estadístico por período de tiempo
 * Cambio: period → label (la propiedad "period" es más para casos específicos)
 */
export interface IPeriodStat {
  label: string; // ✅ Cambio: period -> label (más descriptivo y legible)
  count: number;
  percentage?: number; // Opcional para mostrar porcentaje
}

/**
 * Estadísticas de resolución de incidencias por período
 */
export interface IIncidentResolutionStats {
  period: 'year' | 'month' | 'week';
  year?: number;
  month?: number; // 1-12
  week?: number; // 1-53
  data: IPeriodStat[]; // Ahora usa label en lugar de period
  total: number;
  average: number;
}

/**
 * Estadísticas de automatizaciones completadas por período
 */
export interface IAutomationCompletionStats {
  period: 'year' | 'month' | 'week';
  year?: number;
  month?: number; // 1-12
  week?: number; // 1-53
  data: IPeriodStat[]; // Ahora usa label en lugar de period
  total: number;
  average: number;
}

/**
 * Estadísticas de cambios de estado (ACTIVE -> IN_INCIDENT)
 */
export interface IIncidentTransitionStats {
  period: 'year' | 'month' | 'week';
  year?: number;
  month?: number; // 1-12
  week?: number; // 1-53
  data: IPeriodStat[]; // Ahora usa label en lugar de period
  total: number;
  average: number;
}

/**
 * Respuesta general del dashboard (overview)
 */
export interface IDashboardOverview {
  automationStats: IAutomationStats;
  incidentStats: IIncidentStats;
  requesters: IRequester[]; // Ahora usa requester y count
  updatedAt: Date;
}

/**
 * Parámetro de período para consultas
 */
export interface IPeriodParam {
  period: 'year' | 'month' | 'week';
  year?: number;
  month?: number;
  week?: number;
}

/**
 * Dato histórico de transición de estado
 */
export interface IStateTransitionData {
  automationId: number;
  automationName: string;
  fromStatus: string;
  toStatus: string;
  changedAt: Date;
}

/**
 * Respuesta paginada para listados
 */
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
