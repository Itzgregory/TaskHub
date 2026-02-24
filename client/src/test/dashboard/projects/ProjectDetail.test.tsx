import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectDetail from "@/pages/dashboard/Org-dashboard/Project/ProjectDetail";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos, useOrgMembers } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";

// Mock the hooks
vi.mock("@/lib/auth/AuthContext");
vi.mock("@/lib/api/hooks");
vi.mock("@/lib/api/mappers");

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className, params }: any) => (
    <a href={to} className={className} data-testid="link">
      {children}
    </a>
  ),
  useParams: () => ({ projectId: "org-123" }),
}));

// Mock AppLayout
vi.mock("@/components/layout/dashboard/AppLayout", () => ({
  AppLayout: ({ children, title, subtitle }: any) => (
    <div data-testid="app-layout">
      <div data-testid="layout-title">{title}</div>
      <div data-testid="layout-subtitle">{subtitle}</div>
      <div data-testid="layout-content">{children}</div>
    </div>
  ),
}));

// Mock TaskFormModal
vi.mock("@/components/features/TaskFormModal", () => ({
  TaskFormModal: ({ onClose }: any) => (
    <div data-testid="task-form-modal">
      <button data-testid="close-modal" onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, size }: any) => (
    <button onClick={onClick} data-testid="button" data-size={size}>
      {children}
    </button>
  ),
}));

// Mock getInitials utility
vi.mock("@/lib/utils/getInitials", () => ({
  getInitials: (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
}));

// Mock priority colours
vi.mock("@/lib/utils/priorityColours", () => ({
  PRIORITY_COLOR: {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
    none: "#6b7280",
  },
}));

describe("ProjectDetail Component", () => {
  const mockOrg = {
    orgId: "org-123",
    orgName: "Test Organization",
  };

  const mockMembers = [
    { userId: "user-1", username: "John Doe", role: "OrgAdmin" },
    { userId: "user-2", username: "Jane Smith", role: "Member" },
  ];

  const mockOpenTodos = {
    todos: {
      items: [
        {
          id: "todo-1",
          title: "Open Task 1",
          status: "Open",
          assignedToUserId: "user-1",
          priority: "high",
          dueDate: "2024-12-31",
        },
        {
          id: "todo-2",
          title: "Overdue Task",
          status: "Open",
          assignedToUserId: "user-2",
          priority: "medium",
          dueDate: "2024-01-01",
        },
      ],
    },
  };

  const mockDoneTodos = {
    todos: {
      items: [
        {
          id: "todo-3",
          title: "Done Task",
          status: "Done",
          assignedToUserId: "user-1",
          priority: "low",
          dueDate: "2024-06-15",
        },
      ],
    },
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ProjectDetail />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2024-06-01'));

    (useAuth as any).mockReturnValue({
      organisations: [mockOrg],
    });

    (mapTodoDtoToTask as any).mockImplementation((dto, orgId) => ({
      ...dto,
      orgId,
    }));
  });

  describe("Loading State", () => {
    it("should display loading message while data is fetching", () => {
      (useTodos as any).mockReturnValue({ data: null, isLoading: true });
      (useTodos as any).mockReturnValue({ data: null, isLoading: true });
      (useOrgMembers as any).mockReturnValue({ data: null, isLoading: true });

      renderWithProviders();

      expect(screen.getByText(/Loading project/i)).toBeInTheDocument();
    });
  });

  describe("Project Header", () => {
    it("should display back link to projects list", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: [] }, isLoading: false });

      renderWithProviders();

      const backLink = screen.getByText(/Back to Projects/i);
      expect(backLink).toBeInTheDocument();
    });

    it("should show correct member and task counts", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText(/2 members/i)).toBeInTheDocument();
      expect(screen.getByText(/3 tasks total/i)).toBeInTheDocument();
    });
  });

  describe("Statistics Row", () => {
    it("should calculate overdue tasks correctly", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const overdueElement = screen.getByText("Overdue");
      const countElement = overdueElement.parentElement?.querySelector('p');
      expect(countElement).toHaveTextContent("1");
    });
  });

  describe("Tasks Section", () => {
    it("should display all tasks", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Open Task 1")).toBeInTheDocument();
      expect(screen.getByText("Overdue Task")).toBeInTheDocument();
      expect(screen.getByText("Done Task")).toBeInTheDocument();
    });

    it("should show empty state when no tasks exist", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
    });

    it("should display task priority", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("high")).toBeInTheDocument();
      expect(screen.getByText("medium")).toBeInTheDocument();
      expect(screen.getByText("low")).toBeInTheDocument();
    });

    it("should display task due dates", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("2024-12-31")).toBeInTheDocument();
      expect(screen.getByText("2024-01-01")).toBeInTheDocument();
    });

    it("should display assignee initials for tasks", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const assigneeIndicators = screen.getAllByText("JD");
      expect(assigneeIndicators.length).toBeGreaterThan(0);
    });

    it("should open task form modal when Add Task button is clicked", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const addButton = screen.getByText(/Add Task/i);
      fireEvent.click(addButton);

      expect(screen.getByTestId("task-form-modal")).toBeInTheDocument();
    });

    it("should close task form modal when close button is clicked", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const addButton = screen.getByText(/Add Task/i);
      fireEvent.click(addButton);
      expect(screen.getByTestId("task-form-modal")).toBeInTheDocument();

      const closeButton = screen.getByTestId("close-modal");
      fireEvent.click(closeButton);

      expect(screen.queryByTestId("task-form-modal")).not.toBeInTheDocument();
    });
  });

  describe("Members Section", () => {
    it("should display all members", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("should display member roles", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Member")).toBeInTheDocument();
    });

    it("should display open task count for members", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const openCounts = screen.getAllByText(/open/i);
      expect(openCounts.length).toBeGreaterThan(0);
    });

    it("should show empty state when no members", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: [] }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText(/No members found/i)).toBeInTheDocument();
    });

    it("should have link to manage team members", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const manageLink = screen.getByText(/Manage team members/i);
      expect(manageLink).toBeInTheDocument();
      expect(manageLink.closest('a')).toHaveAttribute('href', '/dashboard/org/members');
    });
  });

  describe("Organisation Not Found", () => {
    it("should display organisation ID when organisation not found", () => {
      (useAuth as any).mockReturnValue({
        organisations: [],
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [] } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: [] }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("org-123")).toBeInTheDocument();
    });
  });
});