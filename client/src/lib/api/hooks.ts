/**
 * React Query hooks for API calls
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authApi,
  todosApi,
  organisationsApi,
  importExportApi,
  auditApi,
  onboardingApi,
} from './services';
import type {
  LoginRequest,
  RegisterRequest,
  CreateTodoRequest,
  UpdateTodoRequest,
  ToggleStatusRequest,
  ListTodosQuery,
  CreateOrgRequest,
  SetActiveOrgRequest,
  AddMemberRequest,
  ChangeRoleRequest,
  RemoveMemberRequest,
  ExportTodosQuery,
  ImportTodosRequest,
  ListAuditQuery,
  CompleteOnboardingRequest,
  ListOrgMembersResponse,
} from './types';

// Query keys
export const queryKeys = {
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (query: ListTodosQuery) => [...queryKeys.todos.lists(), query] as const,
    detail: (id: string) => [...queryKeys.todos.all, 'detail', id] as const,
  },
  organisations: {
    all: ['organisations'] as const,
    myOrgs: () => [...queryKeys.organisations.all, 'my'] as const,
  },
  audit: {
    all: ['audit'] as const,
    list: (query: ListAuditQuery) => [...queryKeys.audit.all, 'list', query] as const,
  },
};

export const useOrgMembers = (orgId: string | undefined) => {
  return useQuery<ListOrgMembersResponse>({
    queryKey: ['organisations', 'members', orgId],
    queryFn: () => {
      if (!orgId) {
        throw new Error('Organisation ID is required');
      }
      return organisationsApi.listMembers(orgId);
    },
    enabled: !!orgId,
  });
};

// Auth hooks
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
};

// Todo hooks
export const useTodos = (query: ListTodosQuery) => {
  return useQuery({
    queryKey: queryKeys.todos.list(query),
    queryFn: () => todosApi.list(query),
    enabled: !!query.orgId,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => todosApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidate todos list for the org
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      todosApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate todos list and detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.detail(variables.id),
      });
    },
  });
};

export const useToggleTodoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleStatusRequest }) =>
      todosApi.toggleStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.detail(variables.id),
      });
    },
    onError: () => {
      // Rollback: refetch todos to get correct server state on conflict
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

export const useSoftDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orgId, version }: { id: string; orgId: string; version: number }) =>
      todosApi.softDelete(id, orgId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

export const useHardDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orgId }: { id: string; orgId: string }) =>
      todosApi.hardDelete(id, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

export const useRestoreTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orgId, version }: { id: string; orgId: string; version: number }) =>
      todosApi.restore(id, orgId, version),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

export const useArchiveTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, daysThreshold }: { orgId: string; daysThreshold?: number }) =>
      todosApi.archive(orgId, daysThreshold),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

// Organisation hooks
export const useMyOrganisations = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.organisations.myOrgs(),
    queryFn: () => organisationsApi.listMyOrgs(),
    enabled: options?.enabled !== false,
  });
};

export const useCreateOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgRequest) => organisationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organisations.myOrgs(),
      });
    },
  });
};

export const useSetActiveOrg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetActiveOrgRequest) => organisationsApi.setActiveOrg(data),
    onSuccess: () => {
      // Invalidate todos when switching orgs
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

export const useAddMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: AddMemberRequest }) =>
      organisationsApi.addMember(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organisations.myOrgs(),
      });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId }: { orgId: string; userId: string }) =>
      organisationsApi.removeMember(orgId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organisations.myOrgs(),
      });
    },
  });
};

export const useChangeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, userId, data }: { orgId: string; userId: string; data: ChangeRoleRequest }) =>
      organisationsApi.changeRole(orgId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organisations.myOrgs(),
      });
    },
  });
};

// Import/Export hooks
export const useExportTodos = () => {
  return useMutation({
    mutationFn: (query: ExportTodosQuery) => importExportApi.export(query),
  });
};

export const useImportTodos = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ImportTodosRequest) => importExportApi.import(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.todos.lists(),
      });
    },
  });
};

// Audit hooks
export const useAuditLog = (query: ListAuditQuery) => {
  return useQuery({
    queryKey: queryKeys.audit.list(query),
    queryFn: () => auditApi.list(query),
    enabled: !!query.orgId,
  });
};

// Onboarding hooks
export const useCompleteOnboarding = () => {
  return useMutation({
    mutationFn: (data: CompleteOnboardingRequest) => onboardingApi.complete(data),
  });
};
