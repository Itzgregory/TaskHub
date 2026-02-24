import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamMembers from "@/pages/dashboard/Org-dashboard/Member/TeamMembers";
import { useAuth } from "@/lib/auth/AuthContext";
import { useOrgMembers, useAddMember, useRemoveMember, useChangeRole } from "@/lib/api/hooks";
import { useToast } from "@/lib/hooks/use-toast";

// Mock the hooks
vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/hooks", () => ({
  useOrgMembers: vi.fn(),
  useAddMember: vi.fn(),
  useRemoveMember: vi.fn(),
  useChangeRole: vi.fn(),
}));

vi.mock("@/lib/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

// Mock the router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, className, params }: any) => {
    const href = to.replace("$memberId", params?.memberId || "");
    return (
      <a href={href} className={className} onClick={(e) => {
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
  Button: ({ children, onClick, disabled, className, style, variant, size }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={className}
      style={style}
      data-testid="button"
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

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open }: any) => open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: any) => <div data-testid="alert-content">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-testid="alert-header">{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div data-testid="alert-footer">{children}</div>,
  AlertDialogAction: ({ children, onClick }: any) => (
    <button data-testid="alert-action" onClick={onClick}>{children}</button>
  ),
  AlertDialogCancel: ({ children }: any) => (
    <button data-testid="alert-cancel">{children}</button>
  ),
}));

vi.mock("@/components/ui/table", () => ({
  Table: ({ children }: any) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: any) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: any) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children, className }: any) => <tr className={className} data-testid="table-row">{children}</tr>,
  TableHead: ({ children }: any) => <th data-testid="table-head">{children}</th>,
  TableCell: ({ children, colSpan }: any) => <td colSpan={colSpan} data-testid="table-cell">{children}</td>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
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
  SelectTrigger: ({ children, className }: any) => (
    <div data-testid="select-trigger" className={className}>{children}</div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <option value={value} data-testid="select-item">{children}</option>
  ),
  SelectValue: ({ placeholder }: any) => <span data-testid="select-value">{placeholder}</span>,
}));

vi.mock("@/components/features/EmptyState", () => ({
  EmptyState: ({ icon, title }: any) => (
    <div data-testid="empty-state">
      <div data-testid="empty-title">{title}</div>
    </div>
  ),
}));

// Mock ROLE_META
vi.mock("@/lib/utils/org-constants", () => ({
  ROLE_META: {
    admin: { icon: () => <svg data-testid="admin-icon" />, label: "Admin", color: "#3b82f6" },
    member: { icon: () => <svg data-testid="member-icon" />, label: "Member", color: "#6b7280" },
  },
}));

describe("TeamMembers", () => {
  const mockActiveOrg = { orgId: "org1", orgName: "Acme Inc" };
  const mockUser = { userId: "user1", email: "john@example.com" };
  
  const mockMembers = [
    { 
      userId: "user1", 
      username: "john.doe", 
      role: "OrgAdmin" as const, 
      joinedAt: "2024-01-15T10:30:00Z" 
    },
    { 
      userId: "user2", 
      username: "jane.smith", 
      role: "Member" as const, 
      joinedAt: "2024-02-20T14:20:00Z" 
    },
    { 
      userId: "user3", 
      username: "bob.wilson", 
      role: "Member" as const, 
      joinedAt: "2024-03-10T09:15:00Z" 
    },
  ];

  const mockMembersData = {
    members: mockMembers,
  };

  const mockAddMember = vi.fn();
  const mockRemoveMember = vi.fn();
  const mockChangeRole = vi.fn();
  const mockToast = vi.fn();

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

  describe("rendering", () => {
    it("renders the team members page with correct title", () => {
      renderWithProviders();

      expect(screen.getByTestId("app-layout")).toBeInTheDocument();
      expect(screen.getByText("Team Members")).toBeInTheDocument();
      expect(screen.getByText(/3 members in Acme Inc/)).toBeInTheDocument();
    });

    it("renders search input and filter controls", () => {
      renderWithProviders();

      expect(screen.getByPlaceholderText("Search members...")).toBeInTheDocument();
      expect(screen.getByTestId("select")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /invite/i })).toBeInTheDocument();
    });

    it("displays all members in the table", () => {
      renderWithProviders();

      expect(screen.getByText("john.doe")).toBeInTheDocument();
      expect(screen.getByText("jane.smith")).toBeInTheDocument();
      expect(screen.getByText("bob.wilson")).toBeInTheDocument();
    });

    it("shows correct role badges", () => {
      renderWithProviders();

      const adminElements = screen.getAllByText("Admin");
      expect(adminElements.length).toBeGreaterThan(0);
      
      const memberElements = screen.getAllByText("Member");
      expect(memberElements.length).toBeGreaterThan(2);
    });

    it("displays joined dates", () => {
      renderWithProviders();

      const date1 = new Date("2024-01-15T10:30:00Z").toLocaleDateString();
      const date2 = new Date("2024-02-20T14:20:00Z").toLocaleDateString();
      const date3 = new Date("2024-03-10T09:15:00Z").toLocaleDateString();

      expect(screen.getByText(date1)).toBeInTheDocument();
      expect(screen.getByText(date2)).toBeInTheDocument();
      expect(screen.getByText(date3)).toBeInTheDocument();
    });

    it("shows active status for all members", () => {
      renderWithProviders();

      const activeIndicators = screen.getAllByText("Active");
      expect(activeIndicators.length).toBe(3);
    });

    it("shows (you) indicator for current user", () => {
      renderWithProviders();

      const memberRow = screen.getByText("john.doe").closest("tr");
      expect(memberRow).toHaveTextContent("(you)");
    });
  });

  describe("invite member", () => {
    it("opens invite dialog when clicking Invite button", () => {
      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      expect(screen.getByTestId("dialog")).toBeInTheDocument();
      expect(screen.getByText("Invite a member")).toBeInTheDocument();
    });

    it("adds a member when form is submitted", async () => {
      mockAddMember.mockResolvedValue({});

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const usernameInput = screen.getByTestId("input-invite-username");
      fireEvent.change(usernameInput, { target: { value: "newuser" } });

      const roleSelect = screen.getByTestId("select-native");
      fireEvent.change(roleSelect, { target: { value: "Member" } });

      const addButton = screen.getByRole("button", { name: /add member/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddMember).toHaveBeenCalledWith({
          orgId: "org1",
          data: { orgId: "org1", username: "newuser", role: "Member" },
        });
        expect(mockToast).toHaveBeenCalledWith({
          title: "Member added",
          description: "newuser has been added as Member.",
        });
      });
    });

    it("shows loading state while adding member", () => {
      (useAddMember as any).mockReturnValue({
        mutateAsync: mockAddMember,
        isPending: true,
      });

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const usernameInput = screen.getByTestId("input-invite-username");
      fireEvent.change(usernameInput, { target: { value: "newuser" } });

      const addButton = screen.getByRole("button", { name: /adding/i });
      expect(addButton).toBeDisabled();
    });

    it("handles invite error", async () => {
      mockAddMember.mockRejectedValue(new Error("User not found"));

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      fireEvent.click(inviteButton);

      const usernameInput = screen.getByTestId("input-invite-username");
      fireEvent.change(usernameInput, { target: { value: "unknown" } });

      const addButton = screen.getByRole("button", { name: /add member/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Invite failed",
          description: "User not found",
          variant: "destructive",
        });
      });
    });

    it("disables invite button when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
        user: mockUser,
      });

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      expect(inviteButton).toBeDisabled();
    });

    it("disables invite button for non-admin users", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: mockActiveOrg,
        user: { userId: "user2", email: "jane@example.com" },
      });

      renderWithProviders();

      const inviteButton = screen.getByRole("button", { name: /invite/i });
      expect(inviteButton).toBeDisabled();
    });
  });

  describe("member actions", () => {
    it("navigates to member detail page", () => {
      renderWithProviders();

      const memberLink = screen.getByRole("link", { name: /jane.smith/i });
      fireEvent.click(memberLink);

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/dashboard/org/members/$memberId",
        params: { memberId: "user2" },
      });
    });
  });

  describe("no active organisation", () => {
    it("disables invite button when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
        user: mockUser,
      });

      renderWithProviders();

      const searchInput = screen.getByPlaceholderText("Search members...");
      expect(searchInput).toBeEnabled();
      
      const inviteButton = screen.getByRole("button", { name: /invite/i });
      expect(inviteButton).toBeDisabled();
      
      const select = screen.getByTestId("select-native");
      expect(select).toBeEnabled();
    });

    it("shows appropriate subtitle when no active org", () => {
      (useAuth as any).mockReturnValue({
        activeOrg: null,
        user: mockUser,
      });

      renderWithProviders();

      expect(screen.getByText("Select an organisation to view members")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has search input with placeholder", () => {
      renderWithProviders();

      const searchInput = screen.getByPlaceholderText("Search members...");
      expect(searchInput).toBeInTheDocument();
    });
  });
});