import {
  AutomationStatus,
  IncidentPriority,
  IncidentStatus,
} from '@prisma/client';

export interface IAutomation {
  id: number;
  name: string;
  description: string;
  status: AutomationStatus;
  requestedBy: string;
  implementDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}

export interface IAutomationWithRelations extends IAutomation {
  user?: {
    id: number;
    email: string;
    name: string;
  };

  incidents?: Array<{
    id: number;
    name: string;
    status: IncidentStatus;
    priority: IncidentPriority;
  }>;
}

export interface IAutomationResponse {
  id: number;
  name: string;
  description: string;
  status: AutomationStatus;
  requestedBy: string;
  implementDate: Date | null;
  createdAt: Date;
  updatedAt: Date;

  createdByUser: {
    id: number;
    name: string;
    email: string;
  };

  incidentCount: number;
  activeIncidents: number;
}

export interface ICreateAutomationInput {
  name: string;
  description: string;
  requestedBy: string;
  userId: number;
}

export interface IUpdateAutomationInput {
  name?: string;
  description?: string;
  status?: AutomationStatus;
}

export interface IAutomationQueryOptions {
  skip?: number;
  take?: number;
  search?: string;
  status?: AutomationStatus;
  requestedBy?: string;
  userId?: number;
}

export interface IStatisticsResponse {
  total: number;
  active: number;
  maintenance: number;
  discontinued: number;
  totalIncidents: number;
  openIncidents: number;
  requesters: string[];
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IDeleteResponse {
  message: string;
  id: number;
}
