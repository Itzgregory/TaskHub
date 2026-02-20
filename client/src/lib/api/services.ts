/**
 * API service functions for all endpoints
 */

import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
  ToggleStatusRequest,
  ToggleStatusResponse,
  ListTodosQuery,
  ListTodosResponse,
  CreateOrgRequest,
  CreateOrgResponse,
  ListUserOrgsResponse,
  SetActiveOrgRequest,
  AddMemberRequest,
  AddMemberResponse,
  ChangeRoleRequest,
  RemoveMemberRequest,
  ListOrgMembersResponse,
  ExportTodosQuery,
  ImportTodosRequest,
  ImportTodosResponse,
  ListAuditQuery,
  ListAuditResponse,
  CompleteOnboardingRequest,
  CompleteOnboardingResponse,
} from './types';

// Auth API
export const authApi = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>('/auth/register', data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },
};

// Todos API
export const todosApi = {
  create: async (data: CreateTodoRequest): Promise<CreateTodoResponse> => {
    return apiClient.post<CreateTodoResponse>('/todos', data);
  },

  update: async (id: string, data: UpdateTodoRequest): Promise<UpdateTodoResponse> => {
    return apiClient.put<UpdateTodoResponse>(`/todos/${id}`, data);
  },

  toggleStatus: async (id: string, data: ToggleStatusRequest): Promise<ToggleStatusResponse> => {
    return apiClient.patch<ToggleStatusResponse>(`/todos/${id}/toggle-status`, data);
  },

  softDelete: async (id: string, orgId: string, version: number): Promise<void> => {
    return apiClient.delete<void>(`/todos/${id}?orgId=${orgId}&version=${version}`);
  },

  hardDelete: async (id: string, orgId: string): Promise<void> => {
    return apiClient.delete<void>(`/todos/${id}/hard?orgId=${orgId}`);
  },

  restore: async (id: string, orgId: string, version: number): Promise<void> => {
    return apiClient.post<void>(`/todos/${id}/restore`, { id, orgId, version });
  },

  list: async (query: ListTodosQuery): Promise<ListTodosResponse> => {
    const params = new URLSearchParams();
    params.append('orgId', query.orgId);
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());
    if (query.status) params.append('status', query.status);
    if (query.priority) params.append('priority', query.priority);
    if (query.tag) params.append('tag', query.tag);
    if (query.isOverdue !== undefined) params.append('isOverdue', query.isOverdue.toString());
    if (query.sortBy) params.append('sortBy', query.sortBy);
    if (query.ascending !== undefined) params.append('ascending', query.ascending.toString());
    if (query.includeDeleted) params.append('includeDeleted', 'true');
    if (query.includeArchived) params.append('includeArchived', 'true');

    return apiClient.get<ListTodosResponse>(`/todos?${params.toString()}`);
  },

  archive: async (orgId: string, daysThreshold: number = 90): Promise<{ archivedCount: number }> => {
    return apiClient.post<{ archivedCount: number }>('/todos/archive', { orgId, daysThreshold });
  },
};

// Organisations API
export const organisationsApi = {
  create: async (data: CreateOrgRequest): Promise<CreateOrgResponse> => {
    return apiClient.post<CreateOrgResponse>('/organisations', data);
  },

  listMyOrgs: async (): Promise<ListUserOrgsResponse> => {
    return apiClient.get<ListUserOrgsResponse>('/organisations/me');
  },

  setActiveOrg: async (data: SetActiveOrgRequest): Promise<void> => {
    return apiClient.post<void>('/organisations/set-active', data);
  },

  addMember: async (orgId: string, data: AddMemberRequest): Promise<AddMemberResponse> => {
    return apiClient.post<AddMemberResponse>(`/organisations/${orgId}/members`, data);
  },

  removeMember: async (orgId: string, userId: string): Promise<void> => {
    return apiClient.delete<void>(`/organisations/${orgId}/members/${userId}`);
  },

  changeRole: async (orgId: string, userId: string, data: ChangeRoleRequest): Promise<void> => {
    return apiClient.patch<void>(`/organisations/${orgId}/members/${userId}/role`, data);
  },

  listMembers: async (orgId: string): Promise<ListOrgMembersResponse> => {
    return apiClient.get<ListOrgMembersResponse>(`/organisations/${orgId}/members`);
  },
};

// Import/Export API
export const importExportApi = {
  export: async (query: ExportTodosQuery): Promise<Blob> => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5078/api/v1';
    const params = new URLSearchParams();
    params.append('orgId', query.orgId);
    params.append('format', query.format);

    const response = await fetch(
      `${API_BASE_URL}/importexport/export?${params.toString()}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw {
        code: error.error?.code || 'EXPORT_ERROR',
        message: error.error?.message || 'Failed to export todos',
        status: response.status,
      };
    }

    return response.blob();
  },

  import: async (data: ImportTodosRequest): Promise<ImportTodosResponse> => {
    return apiClient.post<ImportTodosResponse>('/importexport/import', data);
  },
};

// Audit API
export const auditApi = {
  list: async (query: ListAuditQuery): Promise<ListAuditResponse> => {
    const params = new URLSearchParams();
    params.append('orgId', query.orgId);
    if (query.page) params.append('page', query.page.toString());
    if (query.pageSize) params.append('pageSize', query.pageSize.toString());

    return apiClient.get<ListAuditResponse>(`/audit?${params.toString()}`);
  },
};

// Onboarding API
export const onboardingApi = {
  complete: async (data: CompleteOnboardingRequest): Promise<CompleteOnboardingResponse> => {
    return apiClient.post<CompleteOnboardingResponse>('/onboarding/complete', data);
  },
};
