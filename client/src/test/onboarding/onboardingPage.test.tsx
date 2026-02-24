import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OnboardingPage from "@/pages/onboarding/OnboardingPage";
import { useCompleteOnboarding } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/hooks/use-toast";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";

// Mock the hooks
vi.mock("@/lib/api/hooks", () => ({
  useCompleteOnboarding: vi.fn(),
}));

vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

// Mock the router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock child components to simplify testing
vi.mock("@/components/onboarding/ProfileStep", () => ({
  ProfileStep: ({ name, username, timezone, onNameChange, onUsernameChange, onTimezoneChange }: any) => (
    <div data-testid="profile-step">
      <input 
        data-testid="profile-name-input" 
        value={name} 
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Display name"
      />
      <input 
        data-testid="username-input" 
        value={username} 
        onChange={(e) => onUsernameChange(e.target.value)}
        placeholder="Username"
      />
      <select 
        data-testid="timezone-select" 
        value={timezone} 
        onChange={(e) => onTimezoneChange(e.target.value)}
      >
        <option value="">Select</option>
        <option value="UTC">UTC</option>
        <option value="EST">EST</option>
      </select>
    </div>
  ),
}));

vi.mock("@/components/onboarding/WorkspaceStep", () => ({
  WorkspaceStep: ({ selectedRole, onRoleChange }: any) => (
    <div data-testid="workspace-step">
      <button 
        data-testid="role-work" 
        onClick={() => onRoleChange("work")}
      >
        Work
      </button>
      <button 
        data-testid="role-personal" 
        onClick={() => onRoleChange("personal")}
      >
        Personal
      </button>
      <button 
        data-testid="role-student" 
        onClick={() => onRoleChange("student")}
      >
        Student
      </button>
      <div data-testid="selected-role">{selectedRole}</div>
    </div>
  ),
}));

vi.mock("@/components/onboarding/PreferencesStep", () => ({
  PreferencesStep: ({ theme, notifications, onThemeChange, onNotificationsChange }: any) => (
    <div data-testid="preferences-step">
      <button 
        data-testid="theme-light" 
        onClick={() => onThemeChange("light")}
      >
        Light
      </button>
      <button 
        data-testid="theme-dark" 
        onClick={() => onThemeChange("dark")}
      >
        Dark
      </button>
      <button 
        data-testid="theme-system" 
        onClick={() => onThemeChange("system")}
      >
        System
      </button>
      <button 
        data-testid="notifications-toggle" 
        onClick={() => onNotificationsChange(!notifications)}
      >
        Toggle Notifications
      </button>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="notifications-status">{notifications ? "on" : "off"}</div>
    </div>
  ),
}));

vi.mock("@/components/onboarding/StepIndicator", () => ({
  StepIndicator: ({ current }: any) => (
    <div data-testid="step-indicator">Step {current + 1} of {ONBOARDING_STEPS.length}</div>
  ),
}));

vi.mock("@/components/layout/onboarding/OnboardingLayout", () => ({
  OnboardingLayout: ({ children, stepIndicator }: any) => (
    <div data-testid="onboarding-layout">
      <div data-testid="step-indicator-container">{stepIndicator}</div>
      <div data-testid="content">{children}</div>
    </div>
  ),
}));

describe("OnboardingPage", () => {
  const mockSetUser = vi.fn();
  const mockToast = vi.fn();
  const mockMutateAsync = vi.fn();
  const mockUser = { userId: "123", email: "test@example.com", onboardingCompleted: false };

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
        <OnboardingPage />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (useAuth as any).mockReturnValue({ 
      user: mockUser, 
      setUser: mockSetUser 
    });
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useCompleteOnboarding as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  describe("rendering", () => {
    it("renders the onboarding page with layout", () => {
      renderWithProviders();

      expect(screen.getByTestId("onboarding-layout")).toBeInTheDocument();
      expect(screen.getByTestId("step-indicator")).toBeInTheDocument();
    });

    it("shows ProfileStep on first step", () => {
      renderWithProviders();

      expect(screen.getByTestId("profile-step")).toBeInTheDocument();
      expect(screen.queryByTestId("workspace-step")).not.toBeInTheDocument();
      expect(screen.queryByTestId("preferences-step")).not.toBeInTheDocument();
    });

    it("shows correct step indicator text", () => {
      renderWithProviders();

      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    });

    it("disables back button on first step", () => {
      renderWithProviders();

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeDisabled();
    });

    it("shows Continue button on first step", () => {
      renderWithProviders();

      const continueButton = screen.getByRole("button", { name: /continue/i });
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).not.toBeDisabled();
    });
  });

  describe("navigation between steps", () => {
    it("advances to next step when clicking Continue", () => {
      renderWithProviders();

      // First step - Profile
      expect(screen.getByTestId("profile-step")).toBeInTheDocument();
      
      const continueButton = screen.getByRole("button", { name: /continue/i });
      fireEvent.click(continueButton);

      // Should show Workspace step
      expect(screen.getByTestId("workspace-step")).toBeInTheDocument();
      expect(screen.queryByTestId("profile-step")).not.toBeInTheDocument();
      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    });

    it("advances to third step when clicking Continue again", () => {
      renderWithProviders();

      // Go to step 2
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      
      // Go to step 3
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      expect(screen.getByTestId("preferences-step")).toBeInTheDocument();
      expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    });

    it("goes back to previous step when clicking Back", () => {
      renderWithProviders();

      // Go to step 2
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      expect(screen.getByTestId("workspace-step")).toBeInTheDocument();

      // Go back to step 1
      fireEvent.click(screen.getByRole("button", { name: /back/i }));
      expect(screen.getByTestId("profile-step")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    });

    it("enables back button after first step", () => {
      renderWithProviders();

      // Go to step 2
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).not.toBeDisabled();
    });

    it("shows 'Go to TaskHub' button on last step", () => {
      renderWithProviders();

      // Go to step 2
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      
      // Go to step 3
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      const continueButton = screen.getByRole("button", { name: /go to taskhub/i });
      expect(continueButton).toBeInTheDocument();
    });
  });

  describe("profile step data persistence", () => {
    it("updates profile name when input changes", () => {
      renderWithProviders();

      const nameInput = screen.getByTestId("profile-name-input");
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      expect(nameInput).toHaveValue("John Doe");
    });

    it("updates username when input changes", () => {
      renderWithProviders();

      const usernameInput = screen.getByTestId("username-input");
      fireEvent.change(usernameInput, { target: { value: "johndoe" } });

      expect(usernameInput).toHaveValue("johndoe");
    });

    it("updates timezone when select changes", () => {
      renderWithProviders();

      const timezoneSelect = screen.getByTestId("timezone-select");
      fireEvent.change(timezoneSelect, { target: { value: "UTC" } });

      expect(timezoneSelect).toHaveValue("UTC");
    });
  });

  describe("workspace step data persistence", () => {
    it("updates selected role when clicking role buttons", () => {
      renderWithProviders();

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Default should be "personal"
      expect(screen.getByTestId("selected-role")).toHaveTextContent("personal");

      // Click work role
      fireEvent.click(screen.getByTestId("role-work"));
      expect(screen.getByTestId("selected-role")).toHaveTextContent("work");

      // Click student role
      fireEvent.click(screen.getByTestId("role-student"));
      expect(screen.getByTestId("selected-role")).toHaveTextContent("student");
    });
  });

  describe("preferences step data persistence", () => {
    it("updates theme when clicking theme buttons", () => {
      renderWithProviders();

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Default should be "light"
      expect(screen.getByTestId("current-theme")).toHaveTextContent("light");

      // Click dark theme
      fireEvent.click(screen.getByTestId("theme-dark"));
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");

      // Click system theme
      fireEvent.click(screen.getByTestId("theme-system"));
      expect(screen.getByTestId("current-theme")).toHaveTextContent("system");
    });

    it("toggles notifications when clicking toggle button", () => {
      renderWithProviders();

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Default should be "on"
      expect(screen.getByTestId("notifications-status")).toHaveTextContent("on");

      // Toggle off
      fireEvent.click(screen.getByTestId("notifications-toggle"));
      expect(screen.getByTestId("notifications-status")).toHaveTextContent("off");

      // Toggle on again
      fireEvent.click(screen.getByTestId("notifications-toggle"));
      expect(screen.getByTestId("notifications-status")).toHaveTextContent("on");
    });
  });

  describe("form completion", () => {
    it("shows error toast when completing without profile name", async () => {
      renderWithProviders();

      // Go to last step without filling profile info
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Try to complete
      const completeButton = screen.getByRole("button", { name: /go to taskhub/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Missing information",
          description: "Please provide your name and username.",
          variant: "destructive",
        });
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("shows error toast when completing without username", async () => {
      renderWithProviders();

      // Fill only name
      const nameInput = screen.getByTestId("profile-name-input");
      fireEvent.change(nameInput, { target: { value: "John Doe" } });

      // Go to last step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Try to complete
      const completeButton = screen.getByRole("button", { name: /go to taskhub/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Missing information",
          description: "Please provide your name and username.",
          variant: "destructive",
        });
      });

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it("successfully completes onboarding with all data", async () => {
      const mockResponse = { success: true };
      mockMutateAsync.mockResolvedValue(mockResponse);

      renderWithProviders();

      // Fill profile step
      fireEvent.change(screen.getByTestId("profile-name-input"), { 
        target: { value: "John Doe" } 
      });
      fireEvent.change(screen.getByTestId("username-input"), { 
        target: { value: "johndoe" } 
      });
      fireEvent.change(screen.getByTestId("timezone-select"), { 
        target: { value: "UTC" } 
      });

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Select work role
      fireEvent.click(screen.getByTestId("role-work"));

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Change theme to dark
      fireEvent.click(screen.getByTestId("theme-dark"));

      // Complete onboarding
      const completeButton = screen.getByRole("button", { name: /go to taskhub/i });
      fireEvent.click(completeButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          fullName: "John Doe",
          username: "johndoe",
          usageType: 0, // work maps to 0
          theme: "dark",
          notificationsEnabled: true,
        });

        expect(mockSetUser).toHaveBeenCalledWith({
          ...mockUser,
          onboardingCompleted: true,
        });

        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/auth/org-selection",
        });

        expect(mockToast).toHaveBeenCalledWith({
          title: "Onboarding complete!",
          description: "Your profile has been set up successfully.",
        });
      });
    });

    it("handles different role mappings correctly", async () => {
      const mockResponse = { success: true };
      mockMutateAsync.mockResolvedValue(mockResponse);

      renderWithProviders();

      // Fill profile step
      fireEvent.change(screen.getByTestId("profile-name-input"), { 
        target: { value: "Jane Doe" } 
      });
      fireEvent.change(screen.getByTestId("username-input"), { 
        target: { value: "janedoe" } 
      });

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Test each role mapping
      const testCases = [
        { role: "personal", expectedUsageType: 1 },
        { role: "student", expectedUsageType: 2 },
        { role: "work", expectedUsageType: 0 },
      ];

      for (const { role, expectedUsageType } of testCases) {
        vi.clearAllMocks();
        
        // Select role
        fireEvent.click(screen.getByTestId(`role-${role}`));

        // Go to preferences step
        fireEvent.click(screen.getByRole("button", { name: /continue/i }));

        // Complete onboarding
        fireEvent.click(screen.getByRole("button", { name: /go to taskhub/i }));

        await waitFor(() => {
          expect(mockMutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
              usageType: expectedUsageType,
            })
          );
        });

        // Go back to workspace step for next test
        fireEvent.click(screen.getByRole("button", { name: /back/i }));
      }
    });

    it("handles system theme by converting to light", async () => {
      const mockResponse = { success: true };
      mockMutateAsync.mockResolvedValue(mockResponse);

      renderWithProviders();

      // Fill profile step
      fireEvent.change(screen.getByTestId("profile-name-input"), { 
        target: { value: "John Doe" } 
      });
      fireEvent.change(screen.getByTestId("username-input"), { 
        target: { value: "johndoe" } 
      });

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Select role
      fireEvent.click(screen.getByTestId("role-personal"));

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Select system theme
      fireEvent.click(screen.getByTestId("theme-system"));

      // Complete onboarding
      fireEvent.click(screen.getByRole("button", { name: /go to taskhub/i }));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: "light", // system should convert to light
          })
        );
      });
    });

    it("handles completion failure with error", async () => {
      const errorMessage = "Network error";
      mockMutateAsync.mockRejectedValue(new Error(errorMessage));

      renderWithProviders();

      // Fill profile step
      fireEvent.change(screen.getByTestId("profile-name-input"), { 
        target: { value: "John Doe" } 
      });
      fireEvent.change(screen.getByTestId("username-input"), { 
        target: { value: "johndoe" } 
      });

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Select role
      fireEvent.click(screen.getByTestId("role-personal"));

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Complete onboarding
      fireEvent.click(screen.getByRole("button", { name: /go to taskhub/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Setup failed",
          description: errorMessage,
          variant: "destructive",
        });
      });

      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("handles completion failure with non-Error object", async () => {
      mockMutateAsync.mockRejectedValue("String error");

      renderWithProviders();

      // Fill profile step
      fireEvent.change(screen.getByTestId("profile-name-input"), { 
        target: { value: "John Doe" } 
      });
      fireEvent.change(screen.getByTestId("username-input"), { 
        target: { value: "johndoe" } 
      });

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Select role
      fireEvent.click(screen.getByTestId("role-personal"));

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Complete onboarding
      fireEvent.click(screen.getByRole("button", { name: /go to taskhub/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Setup failed",
          description: "Failed to complete setup. Please try again.",
          variant: "destructive",
        });
      });
    });
  });

  describe("loading state", () => {
        it("disables button and shows loading text when mutation is pending", () => {
            (useCompleteOnboarding as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: true,
            });

            renderWithProviders();

            // The button should show "Setting up..." immediately when isPending is true
            // regardless of which step we're on
            const submitButton = screen.getByRole("button", { name: /setting up/i });
            expect(submitButton).toBeDisabled();
            
            // Arrow icon should not be present
            expect(screen.queryByTestId("arrow-right")).not.toBeInTheDocument();
            
            // Back button should still be visible but might be disabled on first step
            const backButton = screen.getByRole("button", { name: /back/i });
            expect(backButton).toBeInTheDocument();
        });

    // Optional: Test that the button shows correct text when not pending
        it("shows Continue button when not pending on first step", () => {
            (useCompleteOnboarding as any).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
            });

            renderWithProviders();

            const continueButton = screen.getByRole("button", { name: /continue/i });
            expect(continueButton).toBeInTheDocument();
            expect(continueButton).not.toBeDisabled();
        });
    });

  describe("data persistence across steps", () => {
    it("preserves profile data when navigating back and forth", () => {
      renderWithProviders();

      // Fill profile data
      fireEvent.change(screen.getByTestId("profile-name-input"), { 
        target: { value: "John Doe" } 
      });
      fireEvent.change(screen.getByTestId("username-input"), { 
        target: { value: "johndoe" } 
      });

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Go back to profile step
      fireEvent.click(screen.getByRole("button", { name: /back/i }));

      // Check that data is preserved
      expect(screen.getByTestId("profile-name-input")).toHaveValue("John Doe");
      expect(screen.getByTestId("username-input")).toHaveValue("johndoe");
    });

    it("preserves workspace selection when navigating back and forth", () => {
      renderWithProviders();

      // Go to workspace step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Select work role
      fireEvent.click(screen.getByTestId("role-work"));

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Go back to workspace step
      fireEvent.click(screen.getByRole("button", { name: /back/i }));

      // Check that selection is preserved
      expect(screen.getByTestId("selected-role")).toHaveTextContent("work");
    });

    it("preserves preferences when navigating back and forth", () => {
      renderWithProviders();

      // Go to preferences step
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Change theme and notifications
      fireEvent.click(screen.getByTestId("theme-dark"));
      fireEvent.click(screen.getByTestId("notifications-toggle"));

      // Go back to workspace step
      fireEvent.click(screen.getByRole("button", { name: /back/i }));

      // Go forward to preferences step again
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));

      // Check that preferences are preserved
      expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
      expect(screen.getByTestId("notifications-status")).toHaveTextContent("off");
    });
  });
});