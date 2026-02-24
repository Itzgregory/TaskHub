/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrganisationSelectionPage from "@/pages/org-selection/OrganisationSelectionPage";
import { useCreateOrganisation, useSetActiveOrg } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";

// Mock the hooks
vi.mock("@/lib/api/hooks", () => ({
  useCreateOrganisation: vi.fn(),
  useSetActiveOrg: vi.fn(),
}));

vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock the router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock EmptyState component
vi.mock("@/components/features/EmptyState", () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

describe("OrganisationSelectionPage", () => {
  const mockOrganisations = [
    { orgId: "1", orgName: "Acme Inc", role: "OrgAdmin", joinedAt: "2024-01-01" },
    { orgId: "2", orgName: "Beta Corp", role: "Member", joinedAt: "2024-01-02" },
  ];
  
  const mockSetActiveOrg = vi.fn();
  const mockCreateOrgMutateAsync = vi.fn();
  const mockSetActiveOrgMutateAsync = vi.fn();

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
        <OrganisationSelectionPage />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (useAuth as any).mockReturnValue({ 
      organisations: mockOrganisations,
      setActiveOrg: mockSetActiveOrg,
    });
    
    (useCreateOrganisation as any).mockReturnValue({
      mutateAsync: mockCreateOrgMutateAsync,
      isPending: false,
    });
    
    (useSetActiveOrg as any).mockReturnValue({
      mutateAsync: mockSetActiveOrgMutateAsync,
    });
  });

  // ... other tests ...

  describe("loading state", () => {
    it("disables create button and shows loading text when mutation is pending", () => {
      (useCreateOrganisation as any).mockReturnValue({
        mutateAsync: mockCreateOrgMutateAsync,
        isPending: true,
      });

      renderWithProviders();

      // Open the create modal
      const createButton = screen.getByRole("button", { name: /create new organisation/i });
      fireEvent.click(createButton);

      // Modal should be open
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Enter some text to enable the create button
      const input = screen.getByPlaceholderText(/organisation name/i);
      fireEvent.change(input, { target: { value: "New Org" } });

      // The create button in modal should show "Creating..." and be disabled
      const modalCreateButton = screen.getByRole("button", { name: /creating/i });
      expect(modalCreateButton).toBeDisabled();
      
      // Cancel button should still be enabled
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });

    it("shows normal create button text when not pending", () => {
      (useCreateOrganisation as any).mockReturnValue({
        mutateAsync: mockCreateOrgMutateAsync,
        isPending: false,
      });

      renderWithProviders();

      // Open the create modal
      const createButton = screen.getByRole("button", { name: /create new organisation/i });
      fireEvent.click(createButton);

      // Enter some text to enable the create button
      const input = screen.getByPlaceholderText(/organisation name/i);
      fireEvent.change(input, { target: { value: "New Org" } });

      // The create button in modal should show "Create" and be enabled
      const modalCreateButton = screen.getByRole("button", { name: /create$/i }); 
      expect(modalCreateButton).not.toBeDisabled();
    });

    it("disables create button when input is empty regardless of loading state", () => {
      (useCreateOrganisation as any).mockReturnValue({
        mutateAsync: mockCreateOrgMutateAsync,
        isPending: false,
      });

      renderWithProviders();

      // Open the create modal
      const createButton = screen.getByRole("button", { name: /create new organisation/i });
      fireEvent.click(createButton);

      // Create button should be disabled when input is empty
      const modalCreateButton = screen.getByRole("button", { name: /create/i });
      expect(modalCreateButton).toBeDisabled();
    });
  });
});