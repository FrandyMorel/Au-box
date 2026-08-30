// ============================================
// AUTH
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  department: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  department: string;
  token: string;
}


// ============================================
// AUTOMATIONS
// ============================================

export type AutomationStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "IN_INCIDENT";


export interface CreatedByUser {
  id: number;
  name: string;
  email: string;
}


export interface Automation {
  id: number;
  name: string;
  description: string;
  status: AutomationStatus;
  requestedBy: string;
  implementDate: string | null;
  statusChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUser: CreatedByUser;
  incidentCount: number;
  activeIncidents: number;
}


export interface CreateAutomationRequest {
  name: string;
  description: string;
  requestedBy: string;
  implementDate?: string;
}


export interface UpdateAutomationRequest {
  name?: string;
  description?: string;
}


export interface UpdateRequestedByRequest {
  requestedBy: string;
}


export interface UpdateImplementationDateRequest {
  implementDate: string;
}


export interface UpdateStatusRequest {
  status: AutomationStatus;
}


export interface AutomationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: AutomationStatus;
  requestedBy?: string;
}


export interface PaginatedAutomationResponse {
  data: Automation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface DeleteAutomationResponse {
  message: string;
  id: number;
}


export interface AutomationStatistics {
  total: number;
  active: number;
  completed: number;
  inIncident: number;
  totalIncidents: number;
  openIncidents: number;
  requesters: string[];
}