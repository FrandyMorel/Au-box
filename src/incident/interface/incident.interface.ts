import { IncidentStatus, IncidentPriority } from '@prisma/client';

export interface IIncident {
  id: number;
  name: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  reportedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  automationId: number;
  userId: number;
}

export interface IIncidentResponse {
  id: number;
  name: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  reportedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  automationId: number;
  userId: number;
}

export interface IPaginatedIncidents {
  data: IIncident[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IIncidentFilters {
  status?: IncidentStatus;
  priority?: IncidentPriority;
  automationId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface IIncidentHistoryItem {
  id: number;
  name: string;
  description: string;
  priority: IncidentPriority;
  reportedAt: Date;
  resolvedAt: Date | null;
  resolutionTime?: string;
}
