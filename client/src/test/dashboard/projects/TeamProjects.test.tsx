/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TeamProjects from "@/pages/dashboard/Org-dashboard/Project/TeamProjects";
import { useAuth } from "@/lib/auth/AuthContext";

// Mock the hooks
vi.mock("@/lib/auth/AuthContext");

// Mock the router
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params, className }: any) => (
    <a href={to} className={className} data-testid="project-link">
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

// Mock EmptyState
vi.mock("@/components/features/EmptyState", () => ({
  EmptyState: ({ icon, title }: any) => (
    <div data-testid="empty-state">
      <div data-testid="empty-icon">{icon}</div>
      <div data-testid="empty-title">{title}</div>
    </div>
  ),
}));

// Mock Input
vi.mock("@/components/ui/input", () => ({
  Input: ({ placeholder, value, onChange, className }: any) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
    />
  ),
}));

// Mock STATUS_STYLE
vi.mock("@/lib/utils/org-constants", () => ({
  STATUS_STYLE: {
    active: { bg: "#e6f7e6", color: "#2e7d32", label: "Active" },
    inactive: { bg: "#f5f5f5", color: "#9e9e9e", label: "Inactive" },
  },
}));

describe("TeamProjects Component", () => {
  const mockOrganisations = [
    {
      orgId: "org-1",
      orgName: "Acme Inc",
      joinedAt: "2024-01-15T10:30:00Z",
    },
    {
      orgId: "org-2",
      orgName: "Beta Corp",
      joinedAt: "2024-02-20T14:20:00Z",
    },
    {
      orgId: "org-3",
      orgName: "Gamma LLC",
      joinedAt: "2024-03-10T09:15:00Z",
    },
  ];

  const renderComponent = () => {
    return render(<TeamProjects />);
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      organisations: mockOrganisations,
    });
  });

  describe("Rendering", () => {
    it("should render the team projects page with correct title", () => {
      renderComponent();

      expect(screen.getByTestId("app-layout")).toBeInTheDocument();
      expect(screen.getByText("Team Projects")).toBeInTheDocument();
      expect(screen.getByText(/3 shared workspaces/)).toBeInTheDocument();
    });

    it("should render search input", () => {
      renderComponent();

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
    });

    it("should display all organisation projects as cards", () => {
      renderComponent();

      expect(screen.getByText("Acme Inc")).toBeInTheDocument();
      expect(screen.getByText("Beta Corp")).toBeInTheDocument();
      expect(screen.getByText("Gamma LLC")).toBeInTheDocument();
    });

    it("should display project initials", () => {
      renderComponent();

      expect(screen.getByText("AC")).toBeInTheDocument();
      expect(screen.getByText("BE")).toBeInTheDocument();
      expect(screen.getByText("GA")).toBeInTheDocument();
    });

    it("should display joined dates", () => {
      renderComponent();

      const date1 = new Date("2024-01-15T10:30:00Z").toLocaleDateString();
      const date2 = new Date("2024-02-20T14:20:00Z").toLocaleDateString();
      const date3 = new Date("2024-03-10T09:15:00Z").toLocaleDateString();

      expect(screen.getByText(`Joined ${date1}`)).toBeInTheDocument();
      expect(screen.getByText(`Joined ${date2}`)).toBeInTheDocument();
      expect(screen.getByText(`Joined ${date3}`)).toBeInTheDocument();
    });

    it("should display active status badge for all projects", () => {
      renderComponent();

      const activeBadges = screen.getAllByText("Active");
      expect(activeBadges.length).toBe(3);
    });
  });

  describe("Search Functionality", () => {
    it("should filter projects by search term", () => {
      renderComponent();

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "acme" } });

      expect(screen.getByText("Acme Inc")).toBeInTheDocument();
      expect(screen.queryByText("Beta Corp")).not.toBeInTheDocument();
      expect(screen.queryByText("Gamma LLC")).not.toBeInTheDocument();
    });

    it("should be case insensitive", () => {
      renderComponent();

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "BETA" } });

      expect(screen.getByText("Beta Corp")).toBeInTheDocument();
    });

    it("should show empty state when no projects match search", () => {
      renderComponent();

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No projects found")).toBeInTheDocument();
    });

    it("should clear search and show all projects", () => {
      renderComponent();

      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "acme" } });
      expect(screen.queryByText("Beta Corp")).not.toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: "" } });
      expect(screen.getByText("Acme Inc")).toBeInTheDocument();
      expect(screen.getByText("Beta Corp")).toBeInTheDocument();
      expect(screen.getByText("Gamma LLC")).toBeInTheDocument();
    });
  });

  describe("Project Links", () => {
    it("should render each project as a link", () => {
      renderComponent();

      const projectLinks = screen.getAllByTestId("project-link");
      expect(projectLinks.length).toBe(3);
    });

    it("should have correct link parameters", () => {
      renderComponent();

      const projectLinks = screen.getAllByTestId("project-link");
      
      expect(projectLinks[0]).toHaveAttribute('href', '/dashboard/org/projects/$projectId');
      // Note: The actual params are passed through the Link component's params prop
      // which is handled by the router, so we can't test the actual href easily
    });

    it("should have hover effects on project cards", () => {
      renderComponent();

      const projectCards = screen.getAllByText("Acme Inc").map(el => el.closest('a'));
      expect(projectCards[0]).toHaveClass('group');
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no organisations exist", () => {
      (useAuth as any).mockReturnValue({
        organisations: [],
      });

      renderComponent();

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("No projects found")).toBeInTheDocument();
    });

    it("should show correct icon in empty state", () => {
      (useAuth as any).mockReturnValue({
        organisations: [],
      });

      renderComponent();

      expect(screen.getByTestId("empty-icon")).toBeInTheDocument();
    });
  });

  describe("Project Card Content", () => {
    it("should display project description on each card", () => {
      renderComponent();

      const descriptions = screen.getAllByText(/View tasks and manage your team's work/i);
      expect(descriptions.length).toBe(3);
    });

    it("should display arrow icon that appears on hover", () => {
      renderComponent();

      const arrowIcons = document.querySelectorAll('.lucide-arrow-up-right');
      expect(arrowIcons.length).toBe(3);
      expect(arrowIcons[0]).toHaveClass('opacity-0');
    });
  });

  describe("Accessibility", () => {
    it("should have search input with placeholder", () => {
      renderComponent();

      const searchInput = screen.getByPlaceholderText("Search projects...");
      expect(searchInput).toBeInTheDocument();
    });

    it("should have interactive cards that are keyboard accessible", () => {
      renderComponent();

      const projectLinks = screen.getAllByTestId("project-link");
      projectLinks.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });
});