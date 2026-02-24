/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamActivity from "@/pages/dashboard/Org-dashboard/Activity/TeamsActivity";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAuditLog, useOrgMembers } from "@/lib/api/hooks";
import React from "react";

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
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
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
      {description && <div data-testid="empty-description">{description}</div>}
    </div>
  ),
}));

// Mock Button
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

// Mock AUDIT_ACTION_META
vi.mock("@/lib/utils/org-constants", () => ({
  AUDIT_ACTION_META: {
    TaskCreated: { 
      icon: () => <svg data-testid="task-icon" />, 
      label: "performed an action", 
      entityLabel: "System",
      color: "#6b7280" 
    },
    MemberAdded: { 
      icon: () => <svg data-testid="member-icon" />, 
      label: "added a member", 
      entityLabel: "Member",
      color: "#3b82f6" 
    },
    ProjectDeleted: { 
      icon: () => <svg data-testid="project-icon" />, 
      label: "performed an action", 
      entityLabel: "System",
      color: "#6b7280" 
    },
  },
  DEFAULT_AUDIT_META: { 
    icon: () => <svg data-testid="default-icon" />, 
    label: "performed an action", 
    entityLabel: "System",
    color: "#6b7280" 
  },
}));

describe("TeamActivity", () => {
  const mockActiveOrg = { orgId: "org1", orgName: "Acme Inc" };
  const mockMembers = {
    members: [
      { userId: "user1", username: "john.doe" },
      { userId: "user2", username: "jane.smith" },
    ],
  };

  const mockAuditEntries = [
    {
      id: "1",
      action: "TaskCreated",
      entityType: "Task",
      entityId: "task1",
      actorUserId: "user1",
      timestamp: new Date().toISOString(), // Today
      correlationId: "corr1",
      additionalInfo: "Created task 'Test'",
    },
    {
      id: "2",
      action: "MemberAdded",
      entityType: "Member",
      entityId: "user3",
      actorUserId: "user2",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      correlationId: "corr2",
    },
    {
      id: "3",
      action: "ProjectDeleted",
      entityType: "Project",
      entityId: "proj1",
      actorUserId: "user1",
      timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      correlationId: "corr3",
    },
  ];

  const mockAuditData = {
    entries: {
      items: mockAuditEntries,
      totalCount: 3,
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
        <TeamActivity />
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
    it("renders the team activity page with correct title", () => {
      renderWithProviders();

      expect(screen.getByTestId("app-layout")).toBeInTheDocument();
      expect(screen.getByText("Team Activity")).toBeInTheDocument();
      expect(screen.getByText(/3 events in Acme Inc/)).toBeInTheDocument();
    });

    it("groups entries by time period", () => {
        renderWithProviders();

        // Use getAllByText since "Yesterday" appears multiple times (as heading and in timestamps)
        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.getAllByText("Yesterday").length).toBeGreaterThan(0);
        expect(screen.getByText("Older")).toBeInTheDocument();
    });

    it("renders each audit entry", () => {
      renderWithProviders();

      // Check for usernames (appears multiple times)
      expect(screen.getAllByText("john.doe").length).toBeGreaterThan(0);
      expect(screen.getByText("jane.smith")).toBeInTheDocument();
      
      // Check for action labels
      expect(screen.getAllByText("performed an action").length).toBeGreaterThan(0);
      expect(screen.getByText("added a member")).toBeInTheDocument();
    });

    it("shows user initials in avatars", () => {
      renderWithProviders();

      const initials = screen.getAllByText("JO");
      expect(initials.length).toBeGreaterThan(0);
      expect(screen.getByText("JA")).toBeInTheDocument();
    });
  });

  describe("filtering", () => {
    it("filters out auth actions", () => {
      const entriesWithAuth = [
        ...mockAuditEntries,
        {
          id: "4",
          action: "LoginSuccess",
          entityType: "Auth",
          actorUserId: "user1",
          timestamp: new Date().toISOString(),
        },
        {
          id: "5",
          action: "Logout",
          entityType: "Auth",
          actorUserId: "user1",
          timestamp: new Date().toISOString(),
        },
      ];

      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: entriesWithAuth,
            totalCount: 5,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      // Auth actions should not be rendered
      expect(screen.queryByText("LoginSuccess")).not.toBeInTheDocument();
      expect(screen.queryByText("Logout")).not.toBeInTheDocument();
      // Regular actions should still be there
      expect(screen.getAllByText("john.doe").length).toBeGreaterThan(0);
    });
  });

  describe("empty states", () => {
    it("shows empty state when no entries", () => {
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
      expect(screen.getByText("No activity yet")).toBeInTheDocument();
    });

    it("shows empty state when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
      });

      renderWithProviders();

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No organisation selected")).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    it("shows loading spinner when isLoading is true", () => {
      (useAuditLog as any).mockReturnValue({
        data: null,
        isLoading: true,
      });

      renderWithProviders();

      expect(document.querySelector(".animate-spin")).toBeInTheDocument();
      expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("shows pagination controls when multiple pages exist", () => {
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: mockAuditEntries,
            totalCount: 50,
            totalPages: 2,
          },
        },
        isLoading: false,
      });

      renderWithProviders();

      expect(screen.getByText("Page 1 of 2 (50 total events)")).toBeInTheDocument();
      expect(screen.getByText("Previous")).toBeInTheDocument();
      expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("disables previous button on first page", () => {
      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: mockAuditEntries,
            totalCount: 50,
            totalPages: 2,
          },
        },
        isLoading: false,
      });

      renderWithProviders();

      const prevButton = screen.getByText("Previous").closest('button');
      expect(prevButton).toBeDisabled();
      const nextButton = screen.getByText("Next").closest('button');
      expect(nextButton).not.toBeDisabled();
    });

    it("hides pagination when only one page", () => {
      renderWithProviders();

      expect(screen.queryByText(/Page 1 of 1/)).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
        it("navigates to detail view when clicking an entry", () => {
            renderWithProviders();

           // Find the first entry by its username and click the parent container
            const entry = screen.getAllByText("john.doe")[0]
                .closest('div[class*="flex items-start gap-3"]');
            
            fireEvent.click(entry!);

            expect(mockNavigate).toHaveBeenCalledWith({
                to: '/dashboard/org/activity/$activityId',
                params: { activityId: '1' },
            });
        });
    });

  describe("timestamp formatting", () => {
    it("formats recent timestamps as 'Just now'", () => {
      const justNowEntry = [{
        ...mockAuditEntries[0],
        timestamp: new Date().toISOString(),
      }];

      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: justNowEntry,
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      expect(screen.getByText("Just now")).toBeInTheDocument();
    });

    it("formats yesterday correctly", () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const entry = [{
        ...mockAuditEntries[0],
        timestamp: yesterday,
      }];

      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: entry,
            totalCount: 1,
            totalPages: 1,
            },
            },
        });

        renderWithProviders();

        // Use getAllByText since "Yesterday" appears multiple times
        expect(screen.getAllByText("Yesterday").length).toBeGreaterThan(0);
    });

    it("formats days ago correctly", () => {
      const fiveDaysAgo = new Date(Date.now() - 86400000 * 5).toISOString();
      const entry = [{
        ...mockAuditEntries[0],
        timestamp: fiveDaysAgo,
      }];

      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: entry,
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      expect(screen.getByText("5 days ago")).toBeInTheDocument();
    });
  });

  describe("member mapping", () => {
    it("maps userId to username when available", () => {
      renderWithProviders();

      expect(screen.getAllByText("john.doe").length).toBeGreaterThan(0);
      expect(screen.getByText("jane.smith")).toBeInTheDocument();
    });

    it("falls back to truncated userId when username not found", () => {
      const entriesWithUnknownUser = [
        {
          ...mockAuditEntries[0],
          actorUserId: "unknown123456",
        },
      ];

      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: entriesWithUnknownUser,
            totalCount: 1,
            totalPages: 1,
          },
        },
      });

      (useOrgMembers as any).mockReturnValue({
        data: mockMembers, // Members don't include this userId
      });

      renderWithProviders();

      // Should show truncated userId (first 7 chars + maybe more?)
      expect(screen.getByText("unknown1")).toBeInTheDocument();
    });

    it("handles empty members data", () => {
      (useOrgMembers as any).mockReturnValue({
        data: { members: [] },
      });

      renderWithProviders();

      // Should show userIds from audit entries
      expect(screen.getAllByText("user1").length).toBeGreaterThan(0);
      expect(screen.getByText("user2")).toBeInTheDocument();
    });
  });

  describe("additional info", () => {
    it("displays additional info when present", () => {
      renderWithProviders();

      expect(screen.getByText("— Created task 'Test'")).toBeInTheDocument();
    });

    it("does not show additional info when not present", () => {
      const entriesWithoutInfo = mockAuditEntries.map(e => ({
        ...e,
        additionalInfo: undefined,
      }));

      (useAuditLog as any).mockReturnValue({
        data: {
          entries: {
            items: entriesWithoutInfo,
            totalCount: 3,
            totalPages: 1,
          },
        },
      });

      renderWithProviders();

      expect(screen.queryByText(/—/)).not.toBeInTheDocument();
    });
  });

  describe("entity labels", () => {
    it("displays entity type labels", () => {
      renderWithProviders();

      // Based on the actual output, the labels shown are "System" and "Member"
      expect(screen.getAllByText("System").length).toBeGreaterThan(0);
      expect(screen.getByText("Member")).toBeInTheDocument();
    });
  });
});
