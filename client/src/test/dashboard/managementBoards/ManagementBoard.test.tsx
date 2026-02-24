/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ManagementBoard } from "@/pages/dashboard/Org-dashboard/Boards/ManagementBoard";
import { useTodos, useToggleTodoStatus, useOrgMembers } from "@/lib/api/hooks";
import { mapTodoDtoToTask } from "@/lib/api/mappers";
import { useToast } from "@/lib/hooks/use-toast";

// Mock the hooks
vi.mock("@/lib/api/hooks");
vi.mock("@/lib/api/mappers");
vi.mock("@/lib/hooks/use-toast");

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
  Button: ({ children, onClick, disabled, variant, size, className, title }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      title={title}
    >
      {children}
    </button>
  ),
}));

// Mock getInitials utility
vi.mock("@/lib/utils/getInitials", () => ({
  getInitials: (name: string) => {
    if (!name) return "??";
    // Handle the truncation case - if it's a long ID, return first letter
    if (name.length > 10) {
      return name.charAt(0).toUpperCase();
    }
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  },
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

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Plus: () => <div data-testid="plus-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
}));

describe("ManagementBoard Component", () => {
  const mockOrgId = "org-123";
  const mockToast = vi.fn();
  const mockToggleMutation = vi.fn().mockResolvedValue({});

  const mockMembers = [
    { userId: "user-1", username: "John Doe" },
    { userId: "user-2", username: "Jane Smith" },
  ];

  const mockOpenTodos = {
    todos: {
      items: [
        {
          id: "todo-1",
          title: "Open Task 1",
          description: "This is an open task",
          status: "Open",
          assignedToUserId: "user-1",
          priority: "high",
          dueDate: "2024-12-31",
          tags: ["urgent", "feature"],
          version: 1,
        },
        {
          id: "todo-2",
          title: "Overdue Task",
          description: "This task is overdue",
          status: "Open",
          assignedToUserId: "user-2",
          priority: "medium",
          dueDate: "2024-01-01",
          tags: ["bug"],
          version: 1,
        },
      ],
      totalCount: 2,
    },
  };

  const mockDoneTodos = {
    todos: {
      items: [
        {
          id: "todo-3",
          title: "Done Task",
          description: "This task is completed",
          status: "Done",
          assignedToUserId: "user-1",
          priority: "low",
          dueDate: "2024-06-15",
          tags: ["documentation"],
          version: 2,
        },
      ],
      totalCount: 1,
    },
  };

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ManagementBoard orgId={mockOrgId} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date('2024-06-01'));

    (useToast as any).mockReturnValue({ toast: mockToast });
    (mapTodoDtoToTask as any).mockImplementation((dto, orgId) => ({
      ...dto,
      orgId,
    }));

    (useToggleTodoStatus as any).mockReturnValue({
      mutateAsync: mockToggleMutation,
      isPending: false,
    });
  });

  describe("Loading State", () => {
    it("should display loading message while data is fetching", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: null, isLoading: true })
        .mockReturnValueOnce({ data: null, isLoading: true });
      (useOrgMembers as any).mockReturnValue({ data: null, isLoading: true });

      renderWithProviders();

      expect(screen.getByText(/Loading board/i)).toBeInTheDocument();
    });
  });

  describe("Column Headers", () => {
    it("should render Open and Done columns", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Open")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("should display correct task counts in column headers", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("2")).toBeInTheDocument(); // Open count
      expect(screen.getByText("1")).toBeInTheDocument(); // Done count
    });

    it("should show add button in Open column only", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const addButtons = screen.getAllByTitle("Add task");
      expect(addButtons.length).toBe(1);
    });
  });

  describe("Task Cards", () => {
    it("should display open tasks in Open column", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Open Task 1")).toBeInTheDocument();
      expect(screen.getByText("Overdue Task")).toBeInTheDocument();
    });

    it("should display done tasks in Done column", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Done Task")).toBeInTheDocument();
    });

    it("should display task descriptions", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("This is an open task")).toBeInTheDocument();
      expect(screen.getByText("This task is overdue")).toBeInTheDocument();
      expect(screen.getByText("This task is completed")).toBeInTheDocument();
    });

    it("should display priority indicators", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const priorityDots = document.querySelectorAll('span[title="high"], span[title="medium"], span[title="low"]');
      expect(priorityDots.length).toBe(3);
    });

    it("should display due dates", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("2024-12-31")).toBeInTheDocument();
      expect(screen.getByText("2024-01-01")).toBeInTheDocument();
      expect(screen.getByText("2024-06-15")).toBeInTheDocument();
    });

    it("should display tags", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("#urgent")).toBeInTheDocument();
      expect(screen.getByText("#feature")).toBeInTheDocument();
      expect(screen.getByText("#bug")).toBeInTheDocument();
      expect(screen.getByText("#documentation")).toBeInTheDocument();
    });

    it("should display assignee initials", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const assigneeIndicators = screen.getAllByText("JD");
      expect(assigneeIndicators.length).toBeGreaterThan(0);
      expect(screen.getByText("JS")).toBeInTheDocument();
    });

    it("should mark overdue tasks with alert icon", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const alertIcons = screen.getAllByTestId("alert-circle-icon");
      expect(alertIcons.length).toBeGreaterThan(0);
    });
  });

  describe("Empty States", () => {
    it("should show empty message when no open tasks", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText(/No open tasks. Click \+ to create one/i)).toBeInTheDocument();
    });

    it("should show empty message when no done tasks", () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText(/No completed tasks yet/i)).toBeInTheDocument();
    });
  });

  describe("Task Movement", () => {
    it("should call toggle mutation when moving task to done", async () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const moveButtons = screen.getAllByText("Mark Done");
      fireEvent.click(moveButtons[0]);

      await waitFor(() => {
        expect(mockToggleMutation).toHaveBeenCalledWith({
          id: "todo-1",
          data: { id: "todo-1", orgId: mockOrgId, expectedVersion: 1 },
        });
      });
    });

    it("should call toggle mutation when moving task to open", async () => {
      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const moveButtons = screen.getAllByText("Reopen");
      fireEvent.click(moveButtons[0]);

      await waitFor(() => {
        expect(mockToggleMutation).toHaveBeenCalledWith({
          id: "todo-3",
          data: { id: "todo-3", orgId: mockOrgId, expectedVersion: 2 },
        });
      });
    });

    it("should show error toast when move fails", async () => {
      const errorMock = vi.fn().mockRejectedValue(new Error("Network error"));
      (useToggleTodoStatus as any).mockReturnValue({
        mutateAsync: errorMock,
        isPending: false,
      });

      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const moveButtons = screen.getAllByText("Mark Done");
      fireEvent.click(moveButtons[0]);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Failed to move task",
          description: "Network error",
          variant: "destructive",
        });
      });
    });

    it("should disable move buttons during mutation", () => {
      (useToggleTodoStatus as any).mockReturnValue({
        mutateAsync: mockToggleMutation,
        isPending: true,
      });

      (useTodos as any)
        .mockReturnValueOnce({ data: mockOpenTodos, isLoading: false })
        .mockReturnValueOnce({ data: mockDoneTodos, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      const moveButtons = screen.getAllByTestId("button");
      const moveButtonsWithDisabled = moveButtons.filter(btn => btn.hasAttribute('disabled'));
      expect(moveButtonsWithDisabled.length).toBeGreaterThan(0);
    });
  });

  describe("Assignee Handling", () => {
    it("should handle missing assignee gracefully", () => {
      const openTodosWithoutAssignee = {
        todos: {
          items: [
            {
              id: "todo-4",
              title: "Unassigned Task",
              status: "Open",
              assignedToUserId: null,
              priority: "none",
              tags: [],
              version: 1,
            },
          ],
          totalCount: 1,
        },
      };

      (useTodos as any)
        .mockReturnValueOnce({ data: openTodosWithoutAssignee, isLoading: false })
        .mockReturnValueOnce({ data: { todos: { items: [], totalCount: 0 } }, isLoading: false });
      (useOrgMembers as any).mockReturnValue({ data: { members: mockMembers }, isLoading: false });

      renderWithProviders();

      expect(screen.getByText("Unassigned Task")).toBeInTheDocument();
    });
  });
});