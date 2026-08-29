import { AutomationStatus, IncidentStatus } from '@prisma/client';

/**
 * Interfaz base para una automatización
 * IncidentPriority,s
 */
export interface IAutomation {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly status: AutomationStatus;
  readonly requestedBy: string;
  readonly implementDate: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly userId: number;
}

/**
 * Interfaz para usuario relacionado con automatización
 */
export interface IAutomationUser {
  readonly id: number;
  readonly email: string;
  readonly name: string;
}

/**
 * Interfaz para incidente relacionado con automatización
 */
export interface IAutomationIncident {
  readonly id: number;
  readonly status: IncidentStatus;
}

/**
 * Interfaz para automatización con relaciones
 */
export interface IAutomationWithRelations extends IAutomation {
  readonly user?: IAutomationUser;
  readonly incidents?: IAutomationIncident[];
}

/**
 * Interfaz para respuesta de automatización (DTO de respuesta)
 */
export interface IAutomationResponse {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly status: AutomationStatus;
  readonly requestedBy: string;
  readonly implementDate: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdByUser: {
    readonly id: number;
    readonly name: string;
    readonly email: string;
  };
  readonly incidentCount: number;
  readonly activeIncidents: number;
}

/**
 * Interfaz para entrada de creación de automatización
 */
export interface ICreateAutomationInput {
  readonly name: string;
  readonly description: string;
  readonly requestedBy: string;
  readonly userId: number;
  readonly implementDate?: string | null;
}

/**
 * Interfaz para entrada de actualización de automatización
 */
export interface IUpdateAutomationInput {
  readonly name?: string;
  readonly description?: string;
  readonly status?: AutomationStatus;
}

/**
 * Interfaz para opciones de búsqueda de automatización
 */
export interface IAutomationQueryOptions {
  readonly skip?: number;
  readonly take?: number;
  readonly search?: string;
  readonly status?: AutomationStatus;
  readonly requestedBy?: string;
  readonly userId?: number;
}

/**
 * Interfaz para respuesta de estadísticas
 */
export interface IStatisticsResponse {
  readonly total: number;
  readonly active: number;
  readonly maintenance: number;
  readonly discontinued: number;
  readonly totalIncidents: number;
  readonly openIncidents: number;
  readonly requesters: string[];
}

/**
 * Interfaz genérica para respuesta paginada
 */
export interface IPaginatedResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

/**
 * Interfaz para respuesta de eliminación
 */
export interface IDeleteResponse {
  readonly message: string;
  readonly id: number;
}

/**
 * Interfaz para donde cláusula de Prisma (búsqueda y filtros)
 */
export interface IAutomationWhereInput {
  OR?: Array<{
    name?: {
      contains: string;
      mode: 'insensitive';
    };
    description?: {
      contains: string;
      mode: 'insensitive';
    };
  }>;

  status?: AutomationStatus;

  requestedBy?: {
    contains: string;
    mode: 'insensitive';
  };
}
