/**
 * Mappers between frontend types and backend API types
 */

import type { TodoItemDto, TodoStatus, Priority } from './types';
import type { Task, TaskStatus as FrontendTaskStatus, Priority as FrontendPriority } from '../types';

// Map backend TodoStatus to frontend TaskStatus
export function mapTodoStatusToFrontend(status: TodoStatus): FrontendTaskStatus {
  switch (status) {
    case 'Open':
      return 'todo';
    case 'Done':
      return 'done';
    case 'Archived':
      return 'done'; // Archived todos are treated as done in frontend
    default:
      return 'todo';
  }
}

// Map frontend TaskStatus to backend TodoStatus
export function mapTaskStatusToBackend(status: FrontendTaskStatus): TodoStatus {
  switch (status) {
    case 'todo':
    case 'in_progress':
      return 'Open';
    case 'done':
      return 'Done';
    default:
      return 'Open';
  }
}

// Map backend Priority to frontend Priority
export function mapPriorityToFrontend(priority: Priority): FrontendPriority {
  switch (priority) {
    case 'Low':
      return 'low';
    case 'Medium':
      return 'medium';
    case 'High':
      return 'high';
    default:
      return 'medium';
  }
}

// Map frontend Priority to backend Priority
export function mapPriorityToBackend(priority: FrontendPriority): Priority {
  switch (priority) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    case 'urgent':
      return 'High'; // Map urgent to High
    case 'none':
      return 'Low'; // Map none to Low
    default:
      return 'Medium';
  }
}

// Convert backend TodoItemDto to frontend Task
export function mapTodoDtoToTask(dto: TodoItemDto, projectId?: string): Task {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    status: mapTodoStatusToFrontend(dto.status),
    priority: mapPriorityToFrontend(dto.priority),
    projectId: projectId || dto.orgId, // Use orgId as projectId for now
    dueDate: dto.dueDate ? dto.dueDate.split('T')[0] : undefined, // Extract date part
    tags: dto.tags,
    assignedToUserId: dto.assignedToUserId,
    assignedAt: dto.assignedAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    completedAt: dto.status === 'Done' ? dto.updatedAt : undefined,
    order: 0, // Backend doesn't have order, use 0
    version: dto.version,
  };
}

// Convert frontend Task to backend CreateTodoRequest
export function mapTaskToCreateRequest(task: Partial<Task>, orgId: string) {
  return {
    orgId,
    title: task.title!,
    description: task.description,
    priority: task.priority ? mapPriorityToBackend(task.priority) : undefined,
    tags: task.tags || [],
    dueDate: task.dueDate ? `${task.dueDate}T00:00:00Z` : undefined,
    assignedToUserId: task.assignedToUserId || undefined,
  };
}

// Convert frontend Task to backend UpdateTodoRequest
export function mapTaskToUpdateRequest(task: Task, version: number) {
  return {
    id: task.id,
    orgId: task.projectId || '',
    title: task.title,
    description: task.description,
    priority: task.priority ? mapPriorityToBackend(task.priority) : undefined,
    tags: task.tags || [],
    dueDate: task.dueDate ? `${task.dueDate}T00:00:00Z` : undefined,
    expectedVersion: version,
    assignedToUserId: task.assignedToUserId || undefined,
  };
}
