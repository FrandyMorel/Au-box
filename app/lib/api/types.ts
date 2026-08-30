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


// ============================================
// USERS
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserNameRequest {
  name: string;
}

export interface UpdateUserNameResponse {
  id: number;
  name: string;
  email: string;
  department: string;
  updatedAt: string;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  id: number;
  email: string;
  message: string;
  updatedAt: string;
}

export interface MessageResponse {
  message: string;
}

// ============================================
// DASHBOARD
// ============================================

export interface DashboardOverview {
  automations: AutomationStatistics;
  incidents: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  requesters: string[];
}

export interface AutomationDashboardStats {
  total: number;
  active: number;
  completed: number;
  inIncident: number;
}

export interface IncidentDashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface DashboardRequester {
  requester: string;
  count: number;
}

export interface IncidentResolutionStats {
  period: "year" | "month" | "week";
  year: number;
  month?: number;
  week?: number;
  total: number;
  resolved: number;
  closed: number;
}

export interface AutomationCompletionStats {
  period: "year" | "month" | "week";
  year: number;
  month?: number;
  week?: number;
  total: number;
  completed: number;
}

export interface IncidentTransitionStats {
  period: "year" | "month" | "week";
  year: number;
  month?: number;
  week?: number;
  total: number;
  transitions: number;
}