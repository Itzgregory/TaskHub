/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamMembers from "@/pages/dashboard/Org-dashboard/Member/TeamMembers";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useAddMember, useRemoveMember, useChangeRole } from "@/lib/api/hooks";
import { useToast } from "@/lib/hooks/use-toast";

// Mock the hooks
vi.mock("@/lib/auth/AuthContext");
vi.mock("@/lib/api/hooks");
vi.mock("@/lib/hooks/use-toast");

// Mock the router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, className, params }: any) => {
    const href = to.replace("$memberId", params?.memberId || "");
    return (
      <a href={href} className={className} data-testid="link" onClick={(e) => {
        e.preventDefault();
        mockNavigate({ to, params });
      }}>
        {children}
      </a>
    );
  },
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

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, className, style }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      style={style}
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, className, type, id }: any) => (
    <input
      type={type || "text"}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      id={id}
      data-testid={`input-${id || placeholder}`}
    />
  ),
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, style }: any) => (
    <label htmlFor={htmlFor} style={style} data-testid="label">
      {children}
    </label>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, style }: any) => <div data-testid="dialog-content" style={style}>{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children, style }: any) => <div data-testid="dialog-title" style={style}>{children}</div>,
  DialogDescription: ({ children, style }: any) => <div data-testid="dialog-description" style={style}>{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) => open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children, style }: any) => <div data-testid="alert-content" style={style}>{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-testid="alert-header">{children}</div>,
  AlertDialogTitle: ({ children, style }: any) => <div data-testid="alert-title" style={style}>{children}</div>,
  AlertDialogDescription: ({ children, style }: any) => <div data-testid="alert-description" style={style}>{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div data-testid="alert-footer">{children}</div>,
  AlertDialogAction: ({ children, onClick, style }: any) => (
    <button data-testid="alert-action" onClick={onClick} style={style}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: any) => (
    <button data-testid="alert-cancel">{children}</button>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children, className, style }: any) => <tr className={className} style={style} data-testid="table-row">{children}</tr>,
  TableHead: ({ children, className, style }: any) => <th className={className} style={style} data-testid="table-head">{children}</th>,
  TableCell: ({ children, colSpan, className }: any) => <td colSpan={colSpan} className={className} data-testid="table-cell">{children}</td>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children, asChild }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children, align, style }: any) => <div data-testid="dropdown-content" data-align={align} style={style}>{children}</div>,
  DropdownMenuItem: ({ children, onClick, className }: any) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className}>{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      <select 
        data-testid="select-native" 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children, className, style }: any) => (
    <div data-testid="select-trigger" className={className} style={style}>{children}</div>
  ),
  SelectContent: ({ children, style }: any) => <div data-testid="select-content" style={style}>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value} data-testid="select-item">{children}</option>
  ),
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock("@/components/features/EmptyState", () => ({
  EmptyState: ({ icon, title }: any) => (
    <div data-testid="empty-state">
      <div data-testid="empty-icon">{icon}</div>
      <div data-testid="empty-title">{title}</div>
    </div>
  ),
}));

vi.mock("@/components/features/TablePagination", () => ({
  TablePagination: ({ 
    currentPage, 
    totalPages, 
    totalItems, 
    startIndex, 
    endIndex, 
    itemsPerPage, 
    onPageChange, 
    onItemsPerPageChange 
  }: any) => (
    <div data-testid="pagination">
      <span data-testid="pagination-info">
        Showing {startIndex}-{endIndex} of {totalItems}
      </span>
      <button 
        data-testid="prev-page" 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span data-testid="current-page">{currentPage}</span>
      <span data-testid="total-pages">{totalPages}</span>
      <button 
        data-testid="next-page" 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      <select 
        data-testid="items-per-page" 
        value={itemsPerPage} 
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
      </select>
    </div>
  ),
}));

// Mock usePagination hook
vi.mock("@/lib/hooks/usePagination", () => ({
  usePagination: ({ items, pageSize }: any) => {
    const totalPages = Math.ceil(items.length / pageSize);
    return {
      currentPage: 1,
      totalPages,
      itemsPerPage: pageSize,
      setItemsPerPage: vi.fn(),
      paginatedItems: items.slice(0, pageSize),
      goToPage: vi.fn(),
      startIndex: 1,
      endIndex: Math.min(pageSize, items.length),
    };
  },
}));

// Mock ROLE_META
vi.mock("@/lib/utils/org-constants", () => ({
  ROLE_META: {
    admin: { 
      icon: () => <svg data-testid="admin-icon" />, 
      label: "Admin", 
      color: "#3b82f6" 
    },
    member: { 
      icon: () => <svg data-testid="member-icon" />, 
      label: "Member", 
      color: "#6b7280" 
    },
  },
}));

describe("TeamMembers Component", () => {
  const mockActiveOrg = { orgId: "org-123", orgName: "Test Organization" };
  const mockUser = { userId: "user-1", email: "john@example.com" };
  
  const mockMembers = [
    { 
      userId: "user-1", 
      username: "john.doe", 
      role: "OrgAdmin" as const, 
      joinedAt: "2024-01-15T10:30:00Z" 
    },
    { 
      userId: "user-2", 
      username: "jane.smith", 
      role: "Member" as const, 
      joinedAt: "2024-02-20T14:20:00Z" 
    },
    { 
      userId: "user-3", 
      username: "bob.wilson", 
      role: "Member" as const, 
      joinedAt: "2024-03-10T09:15:00Z" 
    },
    { 
      userId: "user-4", 
      username: "alice.brown", 
      role: "Member" as const, 
      joinedAt: "2024-04-05T11:45:00Z" 
    },
    { 
      userId: "user-5", 
      username: "charlie.davis", 
      role: "Member" as const, 
      joinedAt: "2024-05-12T13:30:00Z" 
    },
    { 
      userId: "user-6", 
      username: "eve.wilson", 
      role: "Member" as const, 
      joinedAt: "2024-06-18T09:00:00Z" 
    },
  ];

  const mockMembersData = {
    members: mockMembers,
  };

  const mockAddMember = vi.fn().mockResolvedValue({});
  const mockRemoveMember = vi.fn().mockResolvedValue({});
  const mockChangeRole = vi.fn().mockResolvedValue({});
  const mockToast = vi.fn();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TeamMembers />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      activeOrg: mockActiveOrg,
      user: mockUser,
    });

    (useOrgMembers as any).mockReturnValue({
      data: mockMembersData,
      isLoading: false,
    });

    (useAddMember as any).mockReturnValue({
      mutateAsync: mockAddMember,
      isPending: false,
    });

    (useRemoveMember as any).mockReturnValue({
      mutateAsync: mockRemoveMember,
      isPending: false,
    });

    (useChangeRole as any).mockReturnValue({
      mutateAsync: mockChangeRole,
      isPending: false,
    });

    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
  });

  describe("Rendering", () => {
    it("should render the team members page with correct title", () => {
      renderWithProviders();

      expect(screen.getByTestId("app-layout")).toBeInTheDocument();
      expect(screen.getByTestId("layout-title")).toHaveTextContent("Team Members");
      expect(screen.getByTestId("layout-subtitle")).toHaveTextContent("6 members in Test Organization");
    });

    it("should render search input and filter controls", () => {
      renderWithProviders();

      expect(screen.getByPlaceholderText("Search members...")).toBeInTheDocument();
      expect(screen.getByTestId("select")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /invite/i })).toBeInTheDocument();
    });

    it("should display joined dates", () => {
      renderWithProviders();

      const date1 = new Date("2024-01-15T10:30:00Z").toLocaleDateString();
      const date2 = new Date("2024-02-20T14:20:00Z").toLocaleDateString();

      expect(screen.getByText(date1)).toBeInTheDocument();
      expect(screen.getByText(date2)).toBeInTheDocument();
    });

    it("should show (you) indicator for current user", () => {
      renderWithProviders();

      const userElement = screen.getByText("john.doe");
      const parentElement = userElement.closest('tr');
      expect(parentElement).toHaveTextContent("(you)");
    });
  });

  describe("Filtering and Search", () => {
    it("should filter members by search term", () => {
      renderWithProviders();

      const searchInput = screen.getByPlaceholderText("Search members...");
      fireEvent.change(searchInput, { target: { value: "jane" } });

      expect(screen.getByText("jane.smith")).toBeInTheDocument();
      expect(screen.queryByText("john.doe")).not.toBeInTheDocument();
      expect(screen.queryByText("bob.wilson")).not.toBeInTheDocument();
    });

    it("should show empty state when no members match filters", () => {
      renderWithProviders();

      const searchInput = screen.getByPlaceholderText("Search members...");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No members found")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("should show pagination controls when there are more items than page size", () => {
      renderWithProviders();

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
      expect(screen.getByTestId("pagination-info")).toHaveTextContent("Showing 1-5 of 6");
    });

    it("should display correct number of items per page", () => {
      renderWithProviders();

      // Default page size is 5, so only 5 members should be visible
      const memberRows = screen.getAllByText(/john\.doe|jane\.smith|bob\.wilson|alice\.brown|charlie\.davis/);
      expect(memberRows.length).toBe(5);
      expect(screen.queryByText("eve.wilson")).not.toBeInTheDocument();
    });
  });

  describe("Invite Member", () => {
    it("should open invite dialog when clicking Invite button", () => {
      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Invite a member")).toBeInTheDocument();
    });

    it("should add a member when form is submitted", async () => {
      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const usernameInput = screen.getByTestId("input-invite-username");
      fireEvent.change(usernameInput, { target: { value: "newuser" } });

      const roleSelect = screen.getByTestId("select-native");
      fireEvent.change(roleSelect, { target: { value: "Member" } });

      const addButton = screen.getByText("Add Member");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddMember).toHaveBeenCalledWith({
          orgId: "org-123",
          data: { orgId: "org-123", username: "newuser", role: "Member" },
        });
        expect(mockToast).toHaveBeenCalledWith({
          title: "Member added",
          description: "newuser has been added as Member.",
        });
      });
    });

    it("should show loading state while adding member", () => {
      (useAddMember as any).mockReturnValue({
        mutateAsync: mockAddMember,
        isPending: true,
      });

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const usernameInput = screen.getByTestId("input-invite-username");
      fireEvent.change(usernameInput, { target: { value: "newuser" } });

      const addButton = screen.getByText("Adding...");
      expect(addButton).toBeDisabled();
    });

    it("should handle invite error", async () => {
      mockAddMember.mockRejectedValue(new Error("User not found"));

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const usernameInput = screen.getByTestId("input-invite-username");
      fireEvent.change(usernameInput, { target: { value: "unknown" } });

      const addButton = screen.getByText("Add Member");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Invite failed",
          description: "User not found",
          variant: "destructive",
        });
      });
    });

    it("should close dialog on cancel", () => {
      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);
      expect(screen.getByTestId("dialog")).toBeInTheDocument();

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Remove Member", () => {
    it("should open remove confirmation dialog for non-admin members", () => {
      renderWithProviders();

      // Find and click the dropdown trigger for a non-admin member
      const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
      fireEvent.click(dropdownTriggers[0]); // First non-admin member

      const removeOption = screen.getAllByText("Remove from org")[0];
      fireEvent.click(removeOption);

      expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Remove member\?/i)).toBeInTheDocument();
    });

    it("should not show remove option for current user", () => {
      renderWithProviders();

      // The current user (john.doe) is an admin, so they should have dropdown
      // But the remove option should not be available for self
      const userRow = screen.getByText("john.doe").closest('tr');
      const actionsCell = userRow?.querySelector('td:last-child');
      expect(actionsCell).toHaveTextContent("—");
    });

    it("should remove member when confirmed", async () => {
      renderWithProviders();

      // Open remove dialog
      const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
      fireEvent.click(dropdownTriggers[0]);
      
      const removeOptions = screen.getAllByText("Remove from org");
      fireEvent.click(removeOptions[0]);

      // Confirm removal
      const confirmButton = screen.getByTestId("alert-action");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockRemoveMember).toHaveBeenCalledWith({
          orgId: "org-123",
          userId: "user-2", // jane.smith
        });
        expect(mockToast).toHaveBeenCalledWith({
          title: "Member removed",
          description: "jane.smith has been removed from the organisation.",
        });
      });
    });

    it("should handle remove error", async () => {
      mockRemoveMember.mockRejectedValue(new Error("Network error"));

      renderWithProviders();

      // Open remove dialog
      const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
      fireEvent.click(dropdownTriggers[0]);
      
      const removeOptions = screen.getAllByText("Remove from org");
      fireEvent.click(removeOptions[0]);

      // Confirm removal
      const confirmButton = screen.getByTestId("alert-action");
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Remove failed",
          description: "Network error",
          variant: "destructive",
        });
      });
    });
  });

  describe("Member Actions", () => {
    it("should navigate to member detail page when clicking member name", () => {
      renderWithProviders();

      const memberLink = screen.getByText("jane.smith").closest('a');
      expect(memberLink).toHaveAttribute('href', '/dashboard/org/members/user-2');
      
      fireEvent.click(memberLink!);
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/dashboard/org/members/$memberId",
        params: { memberId: "user-2" },
      });
    });
  });

  describe("Admin Permissions", () => {
    it("should disable invite button for non-admin users", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
        user: { userId: "user-2", email: "jane@example.com" },
      });

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      expect(inviteButton).toBeDisabled();
    });

    it("should not show action dropdown for non-admin users", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
        user: { userId: "user-2", email: "jane@example.com" },
      });

      renderWithProviders();

      const dropdownTriggers = screen.queryAllByTestId("dropdown-trigger");
      expect(dropdownTriggers.length).toBe(0);
    });
  });

  describe("No Active Organisation", () => {
    it("should disable invite button when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
        user: mockUser,
      });

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      expect(inviteButton).toBeDisabled();
    });

    it("should show appropriate subtitle when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
        user: mockUser,
      });

      renderWithProviders();

      expect(screen.getByTestId("layout-subtitle")).toHaveTextContent(
        "Select an organisation to view members"
      );
    });
  });

  describe("Loading State", () => {
    it("should show loading state in empty state when loading", () => {
      (useOrgMembers as any).mockReturnValue({
        data: null,
        isLoading: true,
      });

      renderWithProviders();

      expect(screen.getByText("Loading members...")).toBeInTheDocument();
    });
  });

  describe("Role Display", () => {
    it("should display 'Org Admin' in subtitle for admin users", () => {
      renderWithProviders();

      const adminRow = screen.getByText("john.doe").closest('tr');
      expect(adminRow).toHaveTextContent("Org Admin");
    });
  });

  describe("Invite Dialog Form", () => {
    it("should have username input field", () => {
      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByTestId("input-invite-username")).toBeInTheDocument();
    });

    it("should disable add button when username is empty", () => {
      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const addButton = screen.getByText("Add Member");
      expect(addButton).toBeDisabled();
    });
  });

  describe("Remove Dialog", () => {
    it("should show loading state during removal", () => {
      (useRemoveMember as any).mockReturnValue({
        mutateAsync: mockRemoveMember,
        isPending: true,
      });

      renderWithProviders();

      const dropdownTriggers = screen.getAllByTestId("dropdown-trigger");
      fireEvent.click(dropdownTriggers[0]);
      
      const removeOptions = screen.getAllByText("Remove from org");
      fireEvent.click(removeOptions[0]);

      const confirmButton = screen.getByText("Removing...");
      expect(confirmButton).toBeInTheDocument();
    });
  });
});