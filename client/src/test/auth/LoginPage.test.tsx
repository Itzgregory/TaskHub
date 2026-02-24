import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "@/pages/auth/Login";
import { useLogin } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/hooks/use-toast";

// Mock the hooks
vi.mock("@/lib/api/hooks", () => ({
  useLogin: vi.fn(),
}));

vi.mock("@/lib/auth/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

// Mock the entire router
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, className, style }: any) => {
    return (
      <a 
        href={to} 
        className={className} 
        style={style}
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        {children}
      </a>
    );
  },
}));

describe("LoginPage", () => {
  const mockSetUser = vi.fn();
  const mockToast = vi.fn();
  const mockMutateAsync = vi.fn();

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
        <LoginPage />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // i am setting up d default mock implementations
    (useAuth as any).mockReturnValue({ setUser: mockSetUser });
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useLogin as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renders the login page correctly", () => {
    renderWithProviders();

    // Check for main elements
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue to TaskHub")).toBeInTheDocument();
    
    // Look for the submit button (it does have different text in different states)
    const signInButton = screen.getByRole("button", { name: /sign in|signing in/i });
    expect(signInButton).toBeInTheDocument();
    
    const googleButton = screen.getByRole("button", { name: /google/i });
    expect(googleButton).toBeInTheDocument();
    
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    
    // Check for sign up link
    const signupLink = screen.getByRole("link", { name: /sign up/i });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute("href", "/auth/signup");
  });

  it("shows LoginBrand and MobileLogo components", () => {
    renderWithProviders();
    
    // Instead of looking for testids, look for the actual content
    // The brand appears in both desktop and mobile views
    const brandElements = screen.getAllByText("TaskHub");
    expect(brandElements.length).toBeGreaterThan(0);
    
    // Check for the quote in the brand section
    expect(screen.getByText(/The secret of getting ahead/i)).toBeInTheDocument();
    expect(screen.getByText(/Mark Twain/i)).toBeInTheDocument();
    
    // Check for the feature tags
    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Deadlines")).toBeInTheDocument();
    expect(screen.getByText("Reminders")).toBeInTheDocument();
  });

  describe("form submission", () => {
    const validEmail = "test@example.com";
    const validPassword = "password123";

    it("handles successful login for user with completed onboarding", async () => {
      const mockResponse = {
        userId: "123",
        email: validEmail,
        onboardingCompleted: true,
      };

      mockMutateAsync.mockResolvedValue(mockResponse);

      renderWithProviders();

      // Fill in the form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, {
        target: { value: validEmail },
      });
      fireEvent.change(passwordInput, {
        target: { value: validPassword },
      });

      // Submit the form
      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check if mutateAsync was called with correct data
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: validEmail,
          password: validPassword,
        });

        // Check if user was set in auth context
        expect(mockSetUser).toHaveBeenCalledWith({
          userId: "123",
          email: validEmail,
          onboardingCompleted: true,
        });

        // Check navigation to dashboard
        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/dashboard/org/home",
        });

        // Check success toast
        expect(mockToast).toHaveBeenCalledWith({
          title: "Welcome back!",
          description: `Signed in as ${validEmail}`,
        });
      });
    });

    it("handles successful login for user without completed onboarding", async () => {
      const mockResponse = {
        userId: "123",
        email: validEmail,
        onboardingCompleted: false,
      };

      mockMutateAsync.mockResolvedValue(mockResponse);

      renderWithProviders();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validEmail },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validPassword },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/auth/onboarding",
        });
      });
    });

    it("handles login failure with error message", async () => {
      const errorMessage = "Invalid credentials";
      mockMutateAsync.mockRejectedValue(new Error(errorMessage));

      renderWithProviders();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validEmail },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        // Check if error message is displayed
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        
        // Check if error toast was shown
        expect(mockToast).toHaveBeenCalledWith({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });

        // Ensure user was not set and navigation didn't happen
        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles login failure with non-Error object", async () => {
      mockMutateAsync.mockRejectedValue("String error");

      renderWithProviders();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validEmail },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validPassword },
      });

      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to sign in/i)).toBeInTheDocument();
      });
    });

    it("disables form submission while loading", () => {
      (useLogin as any).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      });

      renderWithProviders();

      // When loading, the button text changes to "Signing in..."
      const submitButton = screen.getByRole("button", { name: /signing in/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("google login", () => {
    it("handles Google login button click", () => {
      renderWithProviders();

      const googleButton = screen.getByRole("button", { name: /google/i });
      fireEvent.click(googleButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: "Coming soon",
        description: "Google sign-in is not yet available.",
      });
    });
  });

  describe("error display", () => {
    it("clears previous error when new login attempt starts", async () => {
      // First trigger an error
      mockMutateAsync.mockRejectedValueOnce(new Error("First error"));

      renderWithProviders();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, {
        target: { value: "test@example.com" },
      });
      fireEvent.change(passwordInput, {
        target: { value: "wrong" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeInTheDocument();
      });

      // Now mock successful login for second attempt
      mockMutateAsync.mockResolvedValueOnce({
        userId: "123",
        email: "test@example.com",
        onboardingCompleted: true,
      });

      // Submit again
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Error should be cleared
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });
    });
  });

  describe("accessibility", () => {
    it("has proper form labels", () => {
      renderWithProviders();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it("has a link to signup page", () => {
      renderWithProviders();

      const signupLink = screen.getByRole("link", { name: /sign up/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/auth/signup");
    });
  });
});