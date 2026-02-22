/**
 * TypeScript types matching backend DTOs
 */

// Enums matching backend
export type TodoStatus = 'Open' | 'Done' | 'Archived';
export type Priority = 'Low' | 'Medium' | 'High';
export type UserRole = 'Member' | 'OrgAdmin';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: string;
  email: string;
  sessionToken: string;
  onboardingCompleted: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  personalOrgId: string;
}

// Todo types
export interface TodoItemDto {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  dueDate?: string; // ISO datetime string
  assignedToUserId?: string;
  assignedAt?: string; // ISO datetime string
  isDeleted: boolean;
  isArchived: boolean;
  version: number;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  eTag: string;
  orgId?: string; // Added for frontend convenience
}

export interface CreateTodoRequest {
  orgId: string;
  title: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  dueDate?: string; // ISO datetime string
  assignedToUserId?: string;
}

export interface CreateTodoResponse {
  id: string;
  orgId: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  assignedToUserId?: string;
  assignedAt?: string;
  version: number;
  createdAt: string;
  eTag: string;
}

export interface UpdateTodoRequest {
  id: string;
  orgId: string;
  title?: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  dueDate?: string;
  expectedVersion: number; // Required for optimistic concurrency
  assignedToUserId?: string;
}

export interface UpdateTodoResponse {
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  tags: string[];
  dueDate?: string;
  assignedToUserId?: string;
  assignedAt?: string;
  version: number;
  updatedAt: string;
  eTag: string;
}

export interface ToggleStatusRequest {
  id: string;
  orgId: string;
  expectedVersion: number;
}

export interface ToggleStatusResponse {
  id: string;
  status: TodoStatus;
  version: number;
  updatedAt: string;
  eTag: string;
}

export interface ListTodosQuery {
  orgId: string;
  page?: number;
  pageSize?: number;
  status?: TodoStatus;
  priority?: Priority;
  tag?: string;
  isOverdue?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  ascending?: boolean;
  includeDeleted?: boolean;
  includeArchived?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListTodosResponse {
  todos: PagedResult<TodoItemDto>;
}

// Organisation types
export interface CreateOrgRequest {
  name: string;
}

export interface CreateOrgResponse {
  id: string;
  name: string;
  ownerId: string;
}

export interface OrgMembershipDto {
  orgId: string;
  orgName: string;
  role: UserRole;
  joinedAt: string;
}

export interface ListUserOrgsResponse {
  organisations: OrgMembershipDto[];
}

export interface OrgMemberDto {
  userId: string;
  username: string;
  role: UserRole;
  joinedAt: string;
}

export interface ListOrgMembersResponse {
  members: OrgMemberDto[];
}

export interface SetActiveOrgRequest {
  orgId: string;
}

export interface AddMemberRequest {
  orgId: string;
  username: string;
  role: UserRole;
}

export interface AddMemberResponse {
  membershipId: string;
  userId: string;
  orgId: string;
  role: UserRole;
}

export interface ChangeRoleRequest {
  orgId: string;
  userId: string;
  role: UserRole;
}

export interface RemoveMemberRequest {
  orgId: string;
  userId: string;
}

// Import/Export types
export interface ExportTodosQuery {
  orgId: string;
  format: 'json' | 'csv';
}

export interface ImportTodosRequest {
  orgId: string;
  format: 'json' | 'csv';
  content: string;
}

export interface ImportReport {
  acceptedCount: number;
  rejectedCount: number;
  rejectedRows: Array<{
    rowIndex: number;
    errors: string[];
  }>;
}

export interface ImportTodosResponse {
  report: ImportReport;
}

// Audit types
export interface ListAuditQuery {
  orgId: string;
  page?: number;
  pageSize?: number;
}

export interface AuditEntryDto {
  id: string;
  timestamp: string;
  actorUserId: string;
  orgId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  correlationId: string;
  additionalInfo?: string;
}

export interface ListAuditResponse {
  entries: PagedResult<AuditEntryDto>;
}

// Onboarding types
export type UsageType = 0 | 1 | 2; // Work=0, Personal=1, Student=2

export interface CompleteOnboardingRequest {
  fullName: string;
  username: string;
  avatarUrl?: string;
  usageType: UsageType;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export interface CompleteOnboardingResponse {
  userId: string;
  fullName: string;
  username: string;
  onboardingCompleted: boolean;
}
