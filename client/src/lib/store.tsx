
import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { Task, Project, UserProfile, Theme, AppState, Priority, TaskStatus } from "./types";

// ---- HELPERS ----
const generateId = () => Math.random().toString(36).slice(2, 11);
const now = () => new Date().toISOString();

// ---- INITIAL DATA ----
const defaultProjects: Project[] = [
  { id: "p1", name: "Personal", color: "#6366f1", description: "Personal tasks", createdAt: now() },
  { id: "p2", name: "Work", color: "#f59e0b", description: "Work related tasks", createdAt: now() },
  { id: "p3", name: "Learning", color: "#10b981", description: "Study and learning goals", createdAt: now() },
];

const today = new Date().toISOString().slice(0, 10);
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

const defaultTasks: Task[] = [
  {
    id: "t1", title: "Review quarterly report", description: "Go through Q4 numbers and prepare summary",
    status: "todo", priority: "urgent", projectId: "p2", dueDate: today,
    tags: ["report", "q4"], createdAt: now(), updatedAt: now(), order: 0,
  },
  {
    id: "t2", title: "Team standup at 10am", description: "Daily sync with the engineering team",
    status: "done", priority: "medium", projectId: "p2", dueDate: today,
    tags: ["meeting"], createdAt: now(), updatedAt: now(), completedAt: now(), order: 1,
  },
  {
    id: "t3", title: "Buy groceries", description: "Milk, eggs, bread, veggies",
    status: "todo", priority: "low", projectId: "p1", dueDate: today,
    tags: ["errands"], createdAt: now(), updatedAt: now(), order: 2,
  },
  {
    id: "t4", title: "Read \"Atomic Habits\" chapter 5", description: "",
    status: "in_progress", priority: "medium", projectId: "p3", dueDate: tomorrow,
    tags: ["reading", "habits"], createdAt: now(), updatedAt: now(), order: 3,
  },
  {
    id: "t5", title: "Prepare presentation slides", description: "Keynote for product demo",
    status: "todo", priority: "high", projectId: "p2", dueDate: tomorrow,
    tags: ["presentation"], createdAt: now(), updatedAt: now(), order: 4,
  },
  {
    id: "t6", title: "Set up home office desk", description: "Cable management + new monitor stand",
    status: "todo", priority: "low", projectId: "p1", dueDate: nextWeek,
    tags: [], createdAt: now(), updatedAt: now(), order: 5,
  },
  {
    id: "t7", title: "Complete TypeScript course", description: "Finish advanced generics module",
    status: "todo", priority: "medium", projectId: "p3", dueDate: nextWeek,
    tags: ["typescript", "coding"], createdAt: now(), updatedAt: now(), order: 6,
  },
  {
    id: "t8", title: "Schedule dentist appointment", description: "",
    status: "todo", priority: "none", projectId: "p1", dueDate: undefined,
    tags: ["health"], createdAt: now(), updatedAt: now(), order: 7,
  },
];

const defaultProfile: UserProfile = {
  name: "Alex Johnson",
  email: "alex@taskhub.app",
};

// ---- ACTIONS ----
type Action =
  | { type: "ADD_TASK"; task: Omit<Task, "id" | "createdAt" | "updatedAt" | "order"> }
  | { type: "UPDATE_TASK"; id: string; updates: Partial<Task> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "TOGGLE_TASK"; id: string }
  | { type: "ADD_PROJECT"; project: Omit<Project, "id" | "createdAt"> }
  | { type: "UPDATE_PROJECT"; id: string; updates: Partial<Project> }
  | { type: "DELETE_PROJECT"; id: string }
  | { type: "UPDATE_PROFILE"; updates: Partial<UserProfile> }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "LOAD_STATE"; state: AppState };

// ---- REDUCER ----
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.state;

    case "ADD_TASK": {
      const maxOrder = state.tasks.reduce((m, t) => Math.max(m, t.order), -1);
      const task: Task = {
        ...action.task,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        order: maxOrder + 1,
      };
      return { ...state, tasks: [...state.tasks, task] };
    }

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.id ? { ...t, ...action.updates, updatedAt: now() } : t
        ),
      };

    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };

    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map(t => {
          if (t.id !== action.id) return t;
          const isDone = t.status === "done";
          return {
            ...t,
            status: isDone ? "todo" : "done",
            completedAt: isDone ? undefined : now(),
            updatedAt: now(),
          };
        }),
      };

    case "ADD_PROJECT": {
      const project: Project = {
        ...action.project,
        id: generateId(),
        createdAt: now(),
      };
      return { ...state, projects: [...state.projects, project] };
    }

    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map(p =>
          p.id === action.id ? { ...p, ...action.updates } : p
        ),
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.id),
        tasks: state.tasks.map(t =>
          t.projectId === action.id ? { ...t, projectId: undefined } : t
        ),
      };

    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.updates } };

    case "SET_THEME":
      return { ...state, theme: action.theme };

    default:
      return state;
  }
}

// ---- INITIAL STATE ----
const STORAGE_KEY = "taskhub_state_v1";

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const defaultState: AppState = {
  tasks: defaultTasks,
  projects: defaultProjects,
  profile: defaultProfile,
  theme: "light",
};

// ---- CONTEXT ----
interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Convenience selectors
  getTodayTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getCompletedTasks: () => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getProjectTaskCount: (projectId: string) => number;
  searchTasks: (query: string) => Task[];
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  console.log('React version in StoreProvider:', React.version);
  console.log('React object identity:', React);
  const [state, dispatch] = useReducer(reducer, defaultState, () => {
    return loadFromStorage() ?? defaultState;
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("taskhub-light-theme", "taskhub-dark-theme", "dark");
    if (state.theme === "dark") {
      root.classList.add("taskhub-dark-theme", "dark");
    } else {
      root.classList.add("taskhub-light-theme");
    }
  }, [state.theme]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const getTodayTasks = () =>
    state.tasks
      .filter(t => t.dueDate === todayStr)
      .sort((a, b) => a.order - b.order);

  const getUpcomingTasks = () =>
    state.tasks
      .filter(t => t.dueDate && t.dueDate > todayStr && t.status !== "done")
      .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "") || a.order - b.order);

  const getCompletedTasks = () =>
    state.tasks
      .filter(t => t.status === "done")
      .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  const getTasksByProject = (projectId: string) =>
    state.tasks
      .filter(t => t.projectId === projectId)
      .sort((a, b) => a.order - b.order);

  const getProjectTaskCount = (projectId: string) =>
    state.tasks.filter(t => t.projectId === projectId && t.status !== "done").length;

  const searchTasks = (query: string) => {
    const q = query.toLowerCase();
    return state.tasks.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  };

  return (
    <StoreContext.Provider
      value={{ state, dispatch, getTodayTasks, getUpcomingTasks, getCompletedTasks, getTasksByProject, getProjectTaskCount, searchTasks }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

// Convenience action creators
export const actions = {
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "order">): Action => ({ type: "ADD_TASK", task }),
  updateTask: (id: string, updates: Partial<Task>): Action => ({ type: "UPDATE_TASK", id, updates }),
  deleteTask: (id: string): Action => ({ type: "DELETE_TASK", id }),
  toggleTask: (id: string): Action => ({ type: "TOGGLE_TASK", id }),
  addProject: (project: Omit<Project, "id" | "createdAt">): Action => ({ type: "ADD_PROJECT", project }),
  updateProject: (id: string, updates: Partial<Project>): Action => ({ type: "UPDATE_PROJECT", id, updates }),
  deleteProject: (id: string): Action => ({ type: "DELETE_PROJECT", id }),
  updateProfile: (updates: Partial<UserProfile>): Action => ({ type: "UPDATE_PROFILE", updates }),
  setTheme: (theme: Theme): Action => ({ type: "SET_THEME", theme }),
};
