/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrgDashboard from "@/pages/dashboard/Org-dashboard/Boards/OrgDashboard";
import { useAuth } from "@/lib/auth/AuthContext";
import { useTodos, useOrgMembers, useAuditLog } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";

// Mock the hooks
vi.mock("@/lib/auth/AuthContext");
vi.mock("@/lib/api/hooks");
vi.mock("@/lib/api/mappers");

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className} data-testid="link">
      {children}
    </a>
  ),
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

// Mock StatCard
vi.mock("@/components/features/StatCard", () => ({
  StatCard: ({ label, value, icon: Icon, accent, bg }: any) => (
    <div data-testid="stat-card" data-label={label} data-value={value}>
      <div data-testid="stat-icon" style={{ color: accent, backgroundColor: bg }} />
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

// Mock ProgressBar
vi.mock("@/components/features/ProgressBar", () => ({
  ProgressBar: ({ value, color }: any) => (
    <div data-testid="progress-bar" data-value={value} data-color={color}>
      <div style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  ),
}));

// Mock EmptyState
vi.mock("@/components/features/EmptyState", () => ({
  EmptyState: ({ icon, title }: any) => (
    <div data-testid="empty-state">
      <div data-testid="empty-icon">{icon}</div>
      <div data-testid="empty-title">{title}</div>
    </div>
  ),
}));

// Mock ManagementBoard
vi.mock("@/pages/dashboard/Org-dashboard/Boards/ManagementBoard", () => ({
  ManagementBoard: ({ orgId }: any) => (
    <div data-testid="management-board" data-org-id={orgId}>
      Management Board
    </div>
  ),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Users: () => <div data-testid="users-icon" />,
  FolderKanban: () => <div data-testid="folder-kanban-icon" />,
  CheckCircle2: () => <div data-testid="check-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Building2: () => <div data-testid="building-icon" />,
}));

// Mock org-constants
vi.mock("@/lib/utils/org-constants", () => ({
  AUDIT_ACTION_META: {
    CREATE_TODO: { label: "created a task", entityLabel: "Task", icon: () => <div data-testid="create-icon" />, color: "#3b82f6" },
    UPDATE_TODO: { label: "updated a task", entityLabel: "Task", icon: () => <div data-testid="update-icon" />, color: "#f59e0b" },
    DELETE_TODO: { label: "deleted a task", entityLabel: "Task", icon: () => <div data-testid="delete-icon" />, color: "#ef4444" },
  },
  DEFAULT_AUDIT_META: { label: "performed an action", entityLabel: "Item", icon: () => <div data-testid="default-icon" />, color: "#6b7280" },
}));

describe("OrgDashboard Component", () => {
  const mockActiveOrg = {
    orgId: "org-123",
    orgName: "Test Organization",
  };

  const mockMembers = [
    { userId: "user-1", username: "John Doe" },
    { userId: "user-2", username: "Jane Smith" },
    { userId: "user-3", username: "Bob Wilson" },
    { userId: "user-4", username: "Alice Brown" },
  ];

  const mockOpenTodos = {
    todos: {
      items: [
        {
          id: "todo-1",
          title: "Open Task 1",
          dueDate: "2024-07-15T00:00:00Z",
          status: "Open",
        },
        {
          id: "todo-2",
          title: "Open Task 2",
          dueDate: "2024-07-20T00:00:00Z",
          status: "Open",
        },
      ],
      totalCount: 5,
    },
  };

  const mockDoneTodos = {
    todos: {
      items: [],
      totalCount: 3,
    },
  };

  const mockOverdueTodos = {
    todos: {
      items: [],
      totalCount: 2,
    },
  };

  const mockAuditLog = {
    entries: {
      items: [
        {
          id: "audit-1",
          action: "CREATE_TODO",
          actorUserId: "user-1",
          timestamp: "2024-06-01T10:30:00Z",
          additionalInfo: {},
        },
        {
          id: "audit-2",
          action: "UPDATE_TODO",
          actorUserId: "user-2",
          timestamp: "2024-06-01T09:15:00Z",
          additionalInfo: {},
        },
        {
          id: "audit-3",
          action: "UNKNOWN_ACTION",
          actorUserId: "user-3",
          timestamp: "2024-06-01T08:00:00Z",
          additionalInfo: {},
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
        <OrgDashboard />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2024-06-01'));

    (mapTodoDtoToTask as any).mockImplementation((dto, orgId) => ({
      ...dto,
      orgId,
    }));
  });

  describe("No Active Organisation", () => {
    it("should show empty state when no active organisation", () => {
      (useAuth as any).mockReturnValue({ activeOrg: null });
      
      // Mock hooks to return valid data structures even when orgId is empty
      (useTodos as any)
        .mockReturnValue({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: [] }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: { entries: { items: [] } }, isLoading: false });

      renderWithProviders();

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No organisation selected.")).toBeInTheDocument();
    });
  });

  describe("Layout and Header", () => {
    it("should render AppLayout with organisation name", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByTestId("layout-title")).toHaveTextContent("Test Organization");
      expect(screen.getByTestId("layout-subtitle")).toHaveTextContent("Dashboard overview");
    });

    it("should render view toggle buttons with correct text", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Overview")).toBeInTheDocument();
      expect(screen.getByText("Management Board")).toBeInTheDocument();
    });
  });

  describe("View Toggle", () => {
    it("should show overview view by default", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      expect(screen.queryByTestId("management-board")).not.toBeInTheDocument();
    });

    it("should show board view when Management Board toggle is clicked", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      // Mock all three useTodos calls
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });

      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const boardButton = screen.getByText("Management Board");
      fireEvent.click(boardButton);

      expect(screen.getByTestId("management-board")).toBeInTheDocument();
      expect(screen.getByTestId("management-board")).toHaveAttribute("data-org-id", "org-123");
    });

    it("should show overview view when Overview toggle is clicked from board view", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      // Mock all three useTodos calls
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });

      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const boardButton = screen.getByText("Management Board");
      fireEvent.click(boardButton);
      expect(screen.getByTestId("management-board")).toBeInTheDocument();

      const overviewButton = screen.getByText("Overview");
      fireEvent.click(overviewButton);

      expect(screen.queryByTestId("management-board")).not.toBeInTheDocument();
      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    });
  });

  describe("Stat Cards", () => {
    it("should display correct stat values", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const statCards = screen.getAllByTestId("stat-card");
      
      expect(statCards[0]).toHaveAttribute("data-label", "Open Todos");
      expect(statCards[0]).toHaveAttribute("data-value", "5");
      
      expect(statCards[1]).toHaveAttribute("data-label", "Completed Todos");
      expect(statCards[1]).toHaveAttribute("data-value", "3");
      
      expect(statCards[2]).toHaveAttribute("data-label", "Overdue Todos");
      expect(statCards[2]).toHaveAttribute("data-value", "2");
      
      expect(statCards[3]).toHaveAttribute("data-label", "Team Members");
      expect(statCards[3]).toHaveAttribute("data-value", "4");
    });
  });

  describe("Recent Activity", () => {
    it("should display recent activity items", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });

    it("should display activity labels", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("created a task")).toBeInTheDocument();
      expect(screen.getByText("updated a task")).toBeInTheDocument();
      expect(screen.getByText("performed an action")).toBeInTheDocument();
    });

    it("should display entity labels", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const entityLabels = screen.getAllByText(/Task|Item/);
      expect(entityLabels.length).toBeGreaterThan(0);
    });

    it("should show empty message when no activity", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: { entries: { items: [] } }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("No recent activity.")).toBeInTheDocument();
    });

    it("should have link to view all activity", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const viewAllLink = screen.getByText("View all");
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/dashboard/org/activity');
    });
  });

  describe("Upcoming Deadlines", () => {
    it("should display upcoming deadlines", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Open Task 1")).toBeInTheDocument();
      expect(screen.getByText("Open Task 2")).toBeInTheDocument();
      expect(screen.getByText("2024-07-15")).toBeInTheDocument();
      expect(screen.getByText("2024-07-20")).toBeInTheDocument();
    });

    it("should show project name for each deadline", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const projectNames = screen.getAllByText("Test Organization");
      expect(projectNames.length).toBeGreaterThan(0);
    });

    it("should show empty message when no upcoming deadlines", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("No upcoming deadlines.")).toBeInTheDocument();
    });
  });

  describe("Workload Overview", () => {
    it("should display workload progress", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const progressBar = screen.getByTestId("progress-bar");
      expect(progressBar).toHaveAttribute("data-value", "38"); // 3/8 * 100 = 37.5 -> 38
    });

    it("should display open task count", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("5 tasks")).toBeInTheDocument();
    });

    it("should display member avatars with count", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const avatarContainer = document.querySelector('.flex.-space-x-1\\.5');
      expect(avatarContainer).toBeInTheDocument();
      
      const avatarElements = avatarContainer?.children;
      expect(avatarElements?.length).toBe(4); // 3 individual + 1 counter
      expect(screen.getByText("+1")).toBeInTheDocument();
    });

    it("should have link to all workspaces", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockOverdueTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const allWorkspacesLink = screen.getByText("All workspaces");
      expect(allWorkspacesLink).toBeInTheDocument();
      expect(allWorkspacesLink.closest('a')).toHaveAttribute('href', '/dashboard/org/projects');
    });

    it("should handle zero tasks for workload calculation", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
      });
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });
      (useAuditLog as any).mockReturnValue({ data: mockAuditLog, isLoading: false });

      renderWithProviders();

      const progressBar = screen.getByTestId("progress-bar");
      expect(progressBar).toHaveAttribute("data-value", "0");
      expect(screen.getByText("0 tasks")).toBeInTheDocument();
    });
  });
});