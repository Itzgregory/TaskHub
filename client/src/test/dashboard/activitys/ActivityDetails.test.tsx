import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ActivityDetail from "@/pages/dashboard/Org-dashboard/Activity/ActivityDetail";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuditLog, useOrgMembers } from "@/lib/api/hooks";

// Mock the hooks
vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/hooks", () => ({
  useAuditLog: vi.fn(),
  useOrgMembers: vi.fn(),
}));

// Mock the router
const mockNavigate = vi.fn();
const mockParams = { activityId: "123" };
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  Link: ({ to, children, className, style }: any) => (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  ),
}));

// Mock AppLayout
vi.mock("@/components/layout/dashboard/AppLayout", () => ({
  AppLayout: ({ children, title, subtitle }: any) => (
    <div data-testid="app-layout">
      <div data-testid="layout-title">{title}</div>
      {subtitle && <div data-testid="layout-subtitle">{subtitle}</div>}
      <div data-testid="layout-content">{children}</div>
    </div>
  ),
}));

// Mock EmptyState
vi.mock("@/components/features/EmptyState", () => ({
  EmptyState: ({ icon, title, description }: any) => (
    <div data-testid="empty-state">
      <div data-testid="empty-title">{title}</div>
      <div data-testid="empty-description">{description}</div>
    </div>
  ),
}));

// Mock AUDIT_ACTION_META
vi.mock("@/lib/utils/org-constants", () => ({
  AUDIT_ACTION_META: {
    TaskCreated: { 
      icon: () => <svg data-testid="task-icon" />, 
      label: "Task Created", 
      entityLabel: "Task",
      color: "#10b981" 
    },
    MemberAdded: { 
      icon: () => <svg data-testid="member-icon" />, 
      label: "Member Added", 
      entityLabel: "Member",
      color: "#3b82f6" 
    },
    ProjectDeleted: { 
      icon: () => <svg data-testid="project-icon" />, 
      label: "Project Deleted", 
      entityLabel: "Project",
      color: "#ef4444" 
    },
  },
  DEFAULT_AUDIT_META: { 
    icon: () => <svg data-testid="default-icon" />, 
    label: "performed an action", 
    entityLabel: "System",
    color: "#6b7280" 
  },
}));

describe("ActivityDetail", () => {
  const mockActiveOrg = { orgId: "org1", orgName: "Acme Inc" };
  const mockMembers = {
    members: [
      { userId: "user1", username: "john.doe" },
      { userId: "user2", username: "jane.smith" },
    ],
  };

  const mockAuditEntry = {
    id: "123",
    action: "TaskCreated",
    entityType: "Task",
    entityId: "task1",
    actorUserId: "user1",
    timestamp: "2024-01-15T10:30:00Z",
    correlationId: "corr123",
    additionalInfo: "Created task 'Test'",
  };

  const mockAuditData = {
    entries: {
      items: [mockAuditEntry],
      totalCount: 1,
      totalPages: 1,
    },
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ActivityDetail />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      activeOrg: mockActiveOrg,
    });

    (useAuditLog as any).mockReturnValue({
      data: mockAuditData,
      isLoading: false,
    });

    (useOrgMembers as any).mockReturnValue({
      data: mockMembers,
    });
  });

  describe("rendering", () => {
    it("renders the activity detail page with correct title", () => {
      renderWithProviders();

      expect(screen.getByTestId("app-layout")).toBeInTheDocument();
      expect(screen.getByText("Activity Detail")).toBeInTheDocument();
    });

    it("shows back link to activity list", () => {
      renderWithProviders();

      const backLink = screen.getByText("Back to Activity");
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest("a")).toHaveAttribute("href", "/dashboard/org/activity");
    });

    it("displays event header with user info", () => {
      renderWithProviders();

      // Username is in the header h2
      expect(screen.getByRole("heading", { name: "john.doe" })).toBeInTheDocument();
      // Action label appears multiple times, check that at least one exists
      expect(screen.getAllByText("Task Created").length).toBeGreaterThan(0);
    });

    it("displays event details in grid", () => {
      renderWithProviders();

      expect(screen.getByText("Event Details")).toBeInTheDocument();
      expect(screen.getByText("Trace Info")).toBeInTheDocument();
      
      // Check for specific details
      expect(screen.getByText("TaskCreated")).toBeInTheDocument();
      // Task appears multiple times, check that at least one exists
      expect(screen.getAllByText("Task").length).toBeGreaterThan(0);
      expect(screen.getByText("task1")).toBeInTheDocument();
      expect(screen.getByText("corr123")).toBeInTheDocument();
      expect(screen.getByText("Created task 'Test'")).toBeInTheDocument();
    });

    it("formats timestamp correctly", () => {
      renderWithProviders();

      // Should show localized timestamp
      const timestamp = new Date("2024-01-15T10:30:00Z").toLocaleString();
      expect(screen.getByText(timestamp)).toBeInTheDocument();
    });

    it("shows user initials in avatar", () => {
      renderWithProviders();

      // john.doe -> JO
      const avatar = screen.getByText("JO");
      expect(avatar).toBeInTheDocument();
    });
  });

  describe("member mapping", () => {
    it("maps actor userId to username when available", () => {
      renderWithProviders();

      // Username appears in the header h2
      expect(screen.getByRole("heading", { name: "john.doe" })).toBeInTheDocument();
      // Also appears in the Actor field
      expect(screen.getAllByText("john.doe")[0]).toBeInTheDocument();
    });

    it("falls back to truncated userId when username not found", () => {
      const entryWithUnknownUser = {
        ...mockAuditEntry,
        actorUserId: "unknown123456",
      };
      
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: [entryWithUnknownUser],
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      (useOrgMembers as any).mockReturnValue({
        data: mockMembers, // Members don't include this userId
      });

      renderWithProviders();

      // Should show truncated userId (first 8 chars?)
      expect(screen.getByRole("heading", { name: "unknown1" })).toBeInTheDocument();
      expect(screen.getAllByText("unknown1")[0]).toBeInTheDocument();
      // Full ID appears in Actor ID field
      expect(screen.getByText("unknown123456")).toBeInTheDocument();
    });

    it("handles empty members data", () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [] },
      });

      renderWithProviders();

      // Should show userId from the audit entry when no members data
      expect(screen.getByRole("heading", { name: "user1" })).toBeInTheDocument();
      expect(screen.getAllByText("user1")[0]).toBeInTheDocument();
    });
  });

  describe("entry not found", () => {
    it("shows empty state when entry is not found", () => {
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: [],
            totalCount: 0,
            totalPages: 0,
          },
        },
      });

      renderWithProviders();

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("Event not found")).toBeInTheDocument();
      expect(screen.getByText(/This audit event may have been paginated out/)).toBeInTheDocument();
    });

    it("still shows back link when entry not found", () => {
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: [],
            totalCount: 0,
            totalPages: 0,
          },
        },
      });

      renderWithProviders();

      expect(screen.getByText("Back to Activity")).toBeInTheDocument();
    });
  });

  describe("action metadata", () => {
    it("uses default meta for unknown actions", () => {
      const entryWithUnknownAction = {
        ...mockAuditEntry,
        action: "UnknownAction",
      };
      
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: [entryWithUnknownAction],
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      // Should show default label (multiple instances)
      const defaultLabels = screen.getAllByText("performed an action");
      expect(defaultLabels.length).toBeGreaterThan(0);
      
      // Action value should still show the original action
      expect(screen.getByText("UnknownAction")).toBeInTheDocument();
    });

    it("displays different action types correctly", () => {
      const actions = ["TaskCreated", "MemberAdded", "ProjectDeleted"];
      
      actions.forEach(action => {
        const entry = { ...mockAuditEntry, action };
        
        (useAuditLog as any).mockReturnValue({
          data: {
            entries: {
              items: [entry],
              totalCount: 1,
              totalPages: 1,
            },
          },
        });

        const { unmount } = renderWithProviders();
        
        // Action label should be from the mock
        const expectedLabels = {
          TaskCreated: "Task Created",
          MemberAdded: "Member Added",
          ProjectDeleted: "Project Deleted",
        };
        
        const labels = screen.getAllByText(expectedLabels[action as keyof typeof expectedLabels]);
        expect(labels.length).toBeGreaterThan(0);
        
        unmount();
      });
    });
  });

  describe("additional info", () => {
    it("displays additional info when present", () => {
      renderWithProviders();

      expect(screen.getByText("Created task 'Test'")).toBeInTheDocument();
    });

    it("does not show additional info section when not present", () => {
      const entryWithoutInfo = {
        ...mockAuditEntry,
        additionalInfo: undefined,
      };
      
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: [entryWithoutInfo],
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      expect(screen.queryByText("Additional Info")).not.toBeInTheDocument();
    });
  });

  describe("entity ID display", () => {
    it("shows em dash when entityId is not present", () => {
      const entryWithoutEntityId = {
        ...mockAuditEntry,
        entityId: null,
      };
      
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: [entryWithoutEntityId],
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  describe("active org handling", () => {
    it("does not fetch audit log when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
      });

      renderWithProviders();

      expect(useAuditLog).toHaveBeenCalledWith({ orgId: "", page: 1, pageSize: 1 });
    });
  });
});