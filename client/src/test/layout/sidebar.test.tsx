/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/dashboard/Sidebar";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSetActiveOrg } from "@/lib/api/hooks";

// Mock the hooks
vi.mock("@/lib/store", () => ({
  useStore: vi.fn(),
  actions: {
    setTheme: vi.fn(),
  },
}));

vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/hooks", () => ({
  useSetActiveOrg: vi.fn(),
}));

// Mock the router
const mockNavigate = vi.fn();
const mockLocation = { pathname: "/dashboard/today" };
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ to, children, className, title }: any) => (
    <a 
      href={to} 
      className={className}
      title={title}
      onClick={(e) => {
        e.preventDefault();
        mockNavigate({ to });
      }}
    >
      {children}
    </a>
  ),
}));

// Mock UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, className, title, disabled }: any) => (
    <button 
      className={className} 
      onClick={onClick}
      title={title}
      disabled={disabled}
      data-testid="button"
    >
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarFallback: ({ children, className }: any) => (
    <div data-testid="avatar-fallback" className={className}>{children}</div>
  ),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div data-testid="dropdown-item" onClick={onClick}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: any) => <div data-testid="dropdown-label">{children}</div>,
  DropdownMenuSeparator: () => <div data-testid="dropdown-separator" />,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

describe("Sidebar", () => {
  const mockOnToggle = vi.fn();
  const mockOnNewTask = vi.fn();
  const mockDispatch = vi.fn();
  const mockSetActiveOrg = vi.fn();
  const mockLogout = vi.fn();
  const mockSetActiveOrgMutation = vi.fn();
  const mockInvalidateQueries = vi.fn();

  const mockUser = { userId: "123", email: "test@example.com" };
  const mockActiveOrg = { orgId: "1", orgName: "Acme Inc", role: "OrgAdmin" };
  const mockOrganisations = [
    { orgId: "1", orgName: "Acme Inc", role: "OrgAdmin" },
    { orgId: "2", orgName: "Beta Corp", role: "Member" },
  ];

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const defaultProps = {
    collapsed: false,
    onToggle: mockOnToggle,
    onNewTask: mockOnNewTask,
  };

  const renderWithProviders = (props = defaultProps) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Sidebar {...props} />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (useStore as any).mockReturnValue({
      state: { theme: "light" },
      dispatch: mockDispatch,
      getProjectTaskCount: vi.fn().mockReturnValue(0),
    });

    (useAuth as any).mockReturnValue({
      user: mockUser,
      activeOrg: mockActiveOrg,
      organisations: mockOrganisations,
      setActiveOrg: mockSetActiveOrg,
      logout: mockLogout,
    });

    (useSetActiveOrg as any).mockReturnValue({
      mutateAsync: mockSetActiveOrgMutation,
      isPending: false,
    });

    // Mock queryClient
    queryClient.invalidateQueries = mockInvalidateQueries;
  });

  describe("rendering", () => {
    it("renders the sidebar with logo", () => {
      renderWithProviders();

      expect(screen.getByText("TaskHub")).toBeInTheDocument();
      expect(screen.getByText(/• Acme Inc/i)).toBeInTheDocument();
    });

    it("shows collapsed version when collapsed prop is true", () => {
      renderWithProviders({ ...defaultProps, collapsed: true });

      expect(screen.queryByText("TaskHub")).not.toBeInTheDocument();
      expect(screen.getAllByTestId("button")[0]).toBeInTheDocument();
    });

    it("renders new task button", () => {
      renderWithProviders();

      const newTaskButton = screen.getByText("New Task");
      expect(newTaskButton).toBeInTheDocument();
    });

    it("renders all navigation items", () => {
      renderWithProviders();

      const navItems = ["Today", "Upcoming", "All Tasks", "Completed", "Dashboard", "Members", "Projects", "Activity"];
      navItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });

    it("renders organisation switcher with active org", () => {
      renderWithProviders();

      // Use getAllByText and take the first one (the trigger button)
      const orgNames = screen.getAllByText("Acme Inc");
      expect(orgNames.length).toBe(2); 
      expect(orgNames[0]).toBeInTheDocument();
    });

    it("renders user action buttons", () => {
      renderWithProviders();

      expect(screen.getByTitle("Profile")).toBeInTheDocument();
      expect(screen.getByTitle("Settings")).toBeInTheDocument();
      expect(screen.getByTitle("Dark mode")).toBeInTheDocument();
      expect(screen.getByTitle("Log out")).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("highlights active navigation item based on current path", () => {
      renderWithProviders();

      const todayLink = screen.getByText("Today").closest('a');
      expect(todayLink).toHaveClass("active");
    });

    it("navigates when clicking navigation items", () => {
      renderWithProviders();

      const upcomingLink = screen.getByText("Upcoming").closest('a');
      fireEvent.click(upcomingLink!);

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard/upcoming" });
    });
  });

  describe("interactions", () => {
    it("calls onToggle when clicking logo button", () => {
      renderWithProviders();

      const toggleButton = screen.getByLabelText("Toggle sidebar");
      fireEvent.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalled();
    });

    it("calls onNewTask when clicking New Task button", () => {
      renderWithProviders();

      const newTaskButton = screen.getByText("New Task");
      fireEvent.click(newTaskButton);

      expect(mockOnNewTask).toHaveBeenCalled();
    });

    it("toggles theme when clicking theme button", () => {
      renderWithProviders();

      const themeButton = screen.getByTitle("Dark mode");
      fireEvent.click(themeButton);

      expect(mockDispatch).toHaveBeenCalled();
    });

    it("calls logout when clicking logout button", () => {
      renderWithProviders();

      const logoutButton = screen.getByTitle("Log out");
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("organisation switching", () => {
    it("opens dropdown when clicking org switcher", () => {
      renderWithProviders();

      // Get the org switcher button (the one with the org name in the bottom section)
      const orgButtons = screen.getAllByText("Acme Inc").map(text => text.closest('button'));
      const orgSwitcher = orgButtons[1] || orgButtons[0]; // The second one is the dropdown trigger
      fireEvent.click(orgSwitcher!);

      expect(screen.getByTestId("dropdown-content")).toBeInTheDocument();
    });

    it("shows all organisations in dropdown", () => {
      renderWithProviders();

      const orgButtons = screen.getAllByText("Acme Inc").map(text => text.closest('button'));
      const orgSwitcher = orgButtons[1] || orgButtons[0];
      fireEvent.click(orgSwitcher!);

      const orgItems = screen.getAllByTestId("dropdown-item");
      expect(orgItems.length).toBe(3); // 2 orgs + 1 manage orgs item
    });

    it("switches organisation when clicking another org", async () => {
      renderWithProviders();

      const orgButtons = screen.getAllByText("Acme Inc").map(text => text.closest('button'));
      const orgSwitcher = orgButtons[1] || orgButtons[0];
      fireEvent.click(orgSwitcher!);

      const orgItems = screen.getAllByTestId("dropdown-item");
      const betaCorpItem = orgItems.find(item => 
        item.textContent?.includes("Beta Corp")
      );
      fireEvent.click(betaCorpItem!);

      expect(mockSetActiveOrg).toHaveBeenCalledWith(mockOrganisations[1]);
      expect(mockSetActiveOrgMutation).toHaveBeenCalledWith({ orgId: "2" });

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['todos'] });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['organisations', 'members'] });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['audit'] });
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard/org/home" });
    });

    it("navigates to manage organisations when clicking manage option", () => {
      renderWithProviders();

      const orgButtons = screen.getAllByText("Acme Inc").map(text => text.closest('button'));
      const orgSwitcher = orgButtons[1] || orgButtons[0];
      fireEvent.click(orgSwitcher!);

      const orgItems = screen.getAllByTestId("dropdown-item");
      const manageItem = orgItems.find(item => 
        item.textContent?.includes("Manage organisations")
      );
      fireEvent.click(manageItem!);

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/org-selection" });
    });

    it("shows correct badge for admin vs member roles", () => {
      renderWithProviders();

      const orgButtons = screen.getAllByText("Acme Inc").map(text => text.closest('button'));
      const orgSwitcher = orgButtons[1] || orgButtons[0];
      fireEvent.click(orgSwitcher!);

      const badges = screen.getAllByTestId("badge");
      expect(badges.length).toBe(2);
    });
  });

  describe("collapsed view", () => {
    it("shows only icons in collapsed view", () => {
      renderWithProviders({ ...defaultProps, collapsed: true });

      expect(screen.queryByText("Today")).not.toBeInTheDocument();
      expect(screen.queryByText("New Task")).not.toBeInTheDocument();
      expect(screen.queryByText("Acme Inc")).not.toBeInTheDocument();
      
      expect(screen.getByTitle("Profile")).toBeInTheDocument();
      expect(screen.getByTitle("Settings")).toBeInTheDocument();
      expect(screen.getByTitle("Dark mode")).toBeInTheDocument();
      expect(screen.getByTitle("Log out")).toBeInTheDocument();
    });

    it("shows org initials in collapsed view", () => {
      renderWithProviders({ ...defaultProps, collapsed: true });

      const avatarFallbacks = screen.getAllByTestId("avatar-fallback");
      expect(avatarFallbacks[0]).toHaveTextContent("AC");
    });
  });

  describe("loading state", () => {
    it("shows normal org switcher button when not pending", () => {
      (useSetActiveOrg as any).mockReturnValue({
        mutateAsync: mockSetActiveOrgMutation,
        isPending: false,
      });

      renderWithProviders();

      const orgNames = screen.getAllByText("Acme Inc");
      expect(orgNames.length).toBe(2);
      const orgButton = orgNames[1].closest('button') || orgNames[0].closest('button');
      expect(orgButton).not.toBeDisabled();
    });

    it("handles org switching with loading state internally", async () => {
      const delayedPromise = new Promise(resolve => setTimeout(resolve, 100));
      mockSetActiveOrgMutation.mockReturnValue(delayedPromise);

      renderWithProviders();

      const orgNames = screen.getAllByText("Acme Inc");
      const orgSwitcher = orgNames[1].closest('button') || orgNames[0].closest('button');
      fireEvent.click(orgSwitcher!);

      const orgItems = screen.getAllByTestId("dropdown-item");
      const betaCorpOption = orgItems.find(item => 
        item.textContent?.includes("Beta Corp")
      );
      fireEvent.click(betaCorpOption!);

      expect(mockSetActiveOrgMutation).toHaveBeenCalledWith({ orgId: "2" });
      expect(mockSetActiveOrg).toHaveBeenCalledWith(mockOrganisations[1]);
      
      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['todos'] });
      });

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/dashboard/org/home" });
    });

    it("handles org switching failure gracefully", async () => {
      mockSetActiveOrgMutation.mockRejectedValue(new Error("Failed to switch org"));

      renderWithProviders();

      const orgNames = screen.getAllByText("Acme Inc");
      const orgSwitcher = orgNames[1].closest('button') || orgNames[0].closest('button');
      fireEvent.click(orgSwitcher!);

      const orgItems = screen.getAllByTestId("dropdown-item");
      const betaCorpOption = orgItems.find(item => 
        item.textContent?.includes("Beta Corp")
      );
      fireEvent.click(betaCorpOption!);

      expect(mockSetActiveOrg).toHaveBeenCalledWith(mockOrganisations[1]);

      await waitFor(() => {
        expect(mockSetActiveOrgMutation).toHaveBeenCalledWith({ orgId: "2" });
      });
    });
  });

  describe("theme", () => {
    it("shows moon icon for light theme", () => {
      renderWithProviders();

      expect(screen.getByTitle("Dark mode")).toBeInTheDocument();
    });

    it("shows sun icon for dark theme", () => {
      (useStore as any).mockReturnValue({
        state: { theme: "dark" },
        dispatch: mockDispatch,
        getProjectTaskCount: vi.fn().mockReturnValue(0),
      });

      renderWithProviders();

      expect(screen.getByTitle("Light mode")).toBeInTheDocument();
    });
  });
});