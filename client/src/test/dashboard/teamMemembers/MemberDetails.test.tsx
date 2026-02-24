/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MemberDetail from "@/pages/dashboard/Org-dashboard/Member/MemberDetail";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useTodos } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";

vi.mock("@/lib/auth/AuthContext");
vi.mock("@/lib/api/hooks");
vi.mock("@/lib/api/mappers");
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  useParams: () => ({ memberId: "user-123" }),
}));
vi.mock("@/components/layout/dashboard/AppLayout", () => ({
  AppLayout: ({ children, title, subtitle }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </div>
  ),
}));
vi.mock("@/components/features/ProgressBar", () => ({
  ProgressBar: ({ value, color }: any) => (
    <div data-testid="progress-bar" style={{ width: `${value}%`, backgroundColor: color }}>
      {value}%
    </div>
  ),
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

const mockMember = {
  userId: "user-123",
  username: "John Doe",
  role: "Member",
  joinedAt: "2024-01-15T00:00:00Z",
};

const mockAdminMember = {
  userId: "admin-1",
  username: "Admin User",
  role: "OrgAdmin",
  joinedAt: "2023-01-01T00:00:00Z",
};

const mockTaskOpen = {
  id: "task-1",
  title: "Complete project",
  status: "Open",
  assignedToUserId: "user-123",
  priority: "high",
  dueDate: "2025-12-31",
};

const mockTaskOverdue = {
  id: "task-2",
  title: "Overdue task",
  status: "Open",
  assignedToUserId: "user-123",
  priority: "high",
  dueDate: "2024-01-01",
};

const mockTaskDone = {
  id: "task-3",
  title: "Completed task",
  status: "Done",
  assignedToUserId: "user-123",
  priority: "low",
  dueDate: "2025-06-15",
};

describe("MemberDetail Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      activeOrg: { orgId: "org-123", orgName: "Test Organization" },
      user: { userId: "current-user-id" },
    });

    (mapTodoDtoToTask as any).mockImplementation((dto) => dto);
  });

  describe("Loading State", () => {
    it("should display loading message while data is fetching", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: undefined,
        isLoading: true,
      });
      (useTodos as any).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/Loading member/i)).toBeInTheDocument();
    });
  });

  describe("Member Not Found", () => {
    it("should display member not found message when member doesn't exist", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/This member could not be found/i)).toBeInTheDocument();
    });

    it("should provide back link when member not found", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/Back to Members/i)).toBeInTheDocument();
    });
  });

  describe("Member Profile Display", () => {
    it("should display member initials in avatar", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should show (you) indicator for current user", async () => {
      (useAuth as any).mockReturnValue({
        activeOrg: { orgId: "org-123", orgName: "Test Organization" },
        user: { userId: "user-123" },
      });
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/\(you\)/)).toBeInTheDocument();
    });

    it("should not show (you) indicator for other members", async () => {
      (useAuth as any).mockReturnValue({
        activeOrg: { orgId: "org-123", orgName: "Test Organization" },
        user: { userId: "different-user" },
      });
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.queryByText(/\(you\)/)).not.toBeInTheDocument();
    });
  });

  describe("Role Display", () => {
    it("should display member role badge for regular member", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      const memberBadges = screen.getAllByText(/Member/);
      expect(memberBadges.length).toBeGreaterThan(0);
    });
  });

  describe("Task Statistics", () => {
    it("should display correct task counts in stats row", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen, mockTaskOverdue] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskDone] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      const allTwos = screen.getAllByText("2");
      expect(allTwos.length).toBeGreaterThan(0);
      const ones = screen.getAllByText("1");
      expect(ones.length).toBeGreaterThan(0);
    });

    it("should calculate overdue tasks correctly", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOverdue] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      const overdueTexts = screen.getAllByText(/Overdue/);
      expect(overdueTexts.length).toBeGreaterThan(0);
    });

    it("should display zero stats when no tasks assigned", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      const allZeros = screen.getAllByText("0");
      expect(allZeros.length).toBeGreaterThan(0);
    });
  });

  describe("Task Breakdown Section", () => {
    it("should display no tasks message when no tasks assigned", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/No tasks assigned yet/i)).toBeInTheDocument();
    });

    it("should display progress bars for task breakdown", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskDone] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      const progressBars = screen.getAllByTestId("progress-bar");
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe("Task List Display", () => {
    it("should display assigned tasks", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText("Complete project")).toBeInTheDocument();
    });

    it("should display task priority", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/high/i)).toBeInTheDocument();
    });

    it("should display task due date", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText("2025-12-31")).toBeInTheDocument();
    });

    it("should show no tasks message when task list is empty", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/No tasks assigned to this member/i)).toBeInTheDocument();
    });
  });

  describe("Back Navigation", () => {
    it("should display back link to members list", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/Back to Members/i)).toBeInTheDocument();
    });
  });

  describe("Layout and Sections", () => {
    it("should render all main sections when member has tasks", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskDone] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText(/Task Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Assigned Tasks/i)).toBeInTheDocument();
    });

    it("should display page title in header", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any).mockReturnValue({
        data: { todos: { items: [] } },
        isLoading: false,
      });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText("Member profile")).toBeInTheDocument();
    });
  });

  describe("Mixed Task States", () => {
    it("should display mix of open, overdue, and completed tasks", async () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [mockMember] },
        isLoading: false,
      });
      (useTodos as any)
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskOpen, mockTaskOverdue] } },
          isLoading: false,
        })
        .mockReturnValueOnce({
          data: { todos: { items: [mockTaskDone] } },
          isLoading: false,
        });

      await act(async () => {
        render(
          <QueryClientProvider client={queryClient}>
            <MemberDetail />
          </QueryClientProvider>
        );
      });

      expect(screen.getByText("Complete project")).toBeInTheDocument();
      expect(screen.getByText("Overdue task")).toBeInTheDocument();
      expect(screen.getByText("Completed task")).toBeInTheDocument();
    });
  });
});