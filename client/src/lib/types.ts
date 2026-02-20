
export type Priority = "urgent" | "high" | "medium" | "low" | "none";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId?: string;
  dueDate?: string; // ISO date string YYYY-MM-DD
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  order: number;
  version: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: string;
  taskCount?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export type Theme = "light" | "dark";

export interface AppState {
  tasks: Task[];
  projects: Project[];
  profile: UserProfile;
  theme: Theme;
}
