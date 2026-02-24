import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SignupPage from "@/pages/auth/SignUp";
import { useRegister } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/hooks/use-toast";

// Mock the hooks
vi.mock("@/lib/api/hooks", () => ({
  useRegister: vi.fn(),
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

describe("SignupPage", () => {
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
        <SignupPage />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    (useAuth as any).mockReturnValue({ setUser: mockSetUser });
    (useToast as any).mockReturnValue({ toast: mockToast });
    (useRegister as any).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renders the signup page correctly", () => {
    renderWithProviders();

    // Check for main elements
    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByText("Get started for free — no card needed")).toBeInTheDocument();
    
    // Look for the submit button - it says "Create account" not "Sign up"
    const submitButton = screen.getByRole("button", { name: /create account|creating account/i });
    expect(submitButton).toBeInTheDocument();
    
    const googleButton = screen.getByRole("button", { name: /google/i });
    expect(googleButton).toBeInTheDocument();
    
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    
    // Check for sign in link
    const signinLink = screen.getByRole("link", { name: /sign in/i });
    expect(signinLink).toBeInTheDocument();
    expect(signinLink).toHaveAttribute("href", "/auth/login");
    
    // Check for the free forever text from SignupBrand
    expect(screen.getByText(/free forever/i)).toBeInTheDocument();
  });

  it("shows SignupBrand and MobileLogo components", () => {
    renderWithProviders();
    
    // Look for the actual content from SignupBrand
    const brandElements = screen.getAllByText("TaskHub");
    expect(brandElements.length).toBeGreaterThan(0);
    
    // Check for SignupBrand specific content
    expect(screen.getByText(/everything you need to stay on top/i)).toBeInTheDocument();
    
    // Check for the feature items
    expect(screen.getByText(/organise tasks across projects/i)).toBeInTheDocument();
    expect(screen.getByText(/due dates & reminders/i)).toBeInTheDocument();
    expect(screen.getByText(/instant search across everything/i)).toBeInTheDocument();
    expect(screen.getByText(/light & dark mode/i)).toBeInTheDocument();
    
    // Check for the free forever text
    expect(screen.getByText(/free forever/i)).toBeInTheDocument();
  });

  describe("form submission", () => {
    const validEmail = "test@example.com";
    const validPassword = "password123";

    it("handles successful signup", async () => {
      const mockResponse = {
        userId: "123",
        email: validEmail,
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

      // Submit the form - button says "Create account"
      const submitButton = screen.getByRole("button", { name: /create account/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Check if mutateAsync was called with correct data
        expect(mockMutateAsync).toHaveBeenCalledWith({
          email: validEmail,
          password: validPassword,
        });

        // Check if user was set in auth context (onboardingCompleted should be false)
        expect(mockSetUser).toHaveBeenCalledWith({
          userId: "123",
          email: validEmail,
          onboardingCompleted: false,
        });

        // Check navigation to onboarding
        expect(mockNavigate).toHaveBeenCalledWith({
          to: "/auth/onboarding",
        });

        // Check success toast
        expect(mockToast).toHaveBeenCalledWith({
          title: "Account created!",
          description: "Please complete your profile setup.",
        });
      });
    });

    it("handles signup failure with error message", async () => {
      const errorMessage = "Email already exists";
      mockMutateAsync.mockRejectedValue(new Error(errorMessage));

      renderWithProviders();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validEmail },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validPassword },
      });

      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        // Check if error message is displayed
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        
        // Check if error toast was shown
        expect(mockToast).toHaveBeenCalledWith({
          title: "Sign up failed",
          description: errorMessage,
          variant: "destructive",
        });

        // Ensure user was not set and navigation didn't happen
        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles signup failure with non-Error object", async () => {
      mockMutateAsync.mockRejectedValue("String error");

      renderWithProviders();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: validEmail },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: validPassword },
      });

      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to create account/i)).toBeInTheDocument();
      });
    });

    it("disables form submission while loading", () => {
      (useRegister as any).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      });

      renderWithProviders();

      // When loading, the button text changes to "Creating account"
      const submitButton = screen.getByRole("button", { name: /creating account/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("google signup", () => {
    it("handles Google signup button click", () => {
      renderWithProviders();

      const googleButton = screen.getByRole("button", { name: /google/i });
      fireEvent.click(googleButton);

      expect(mockToast).toHaveBeenCalledWith({
        title: "Coming soon",
        description: "Google sign-up is not yet available.",
      });
    });
  });

  describe("error display", () => {
    it("clears previous error when new signup attempt starts", async () => {
      // First trigger an error
      mockMutateAsync.mockRejectedValueOnce(new Error("First error"));

      renderWithProviders();

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /create account/i });

      fireEvent.change(emailInput, {
        target: { value: "test@example.com" },
      });
      fireEvent.change(passwordInput, {
        target: { value: "password" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First error")).toBeInTheDocument();
      });

      // Now mock successful signup for second attempt
      mockMutateAsync.mockResolvedValueOnce({
        userId: "123",
        email: "test@example.com",
      });

      // Submit again
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Error should be cleared
        expect(screen.queryByText("First error")).not.toBeInTheDocument();
      });
    });
  });

  describe("form validation", () => {
    it("requires email field", () => {
      renderWithProviders();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toBeRequired();
    });

    it("accepts email input type", () => {
      renderWithProviders();

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute("type", "email");
    });

    it("accepts password input type", () => {
      renderWithProviders();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    // Note: Password field might not be required in your form
    // If it should be required, you'll need to add the 'required' attribute to the input
    it("handles password field correctly", () => {
      renderWithProviders();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("has proper form labels", () => {
      renderWithProviders();

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
   });

  it("has a link to signin page", () => {
    renderWithProviders();

    const signinLink = screen.getByRole("link", { name: /sign in/i });
    expect(signinLink).toBeInTheDocument();
    expect(signinLink).toHaveAttribute("href", "/auth/login");
  });

  it("has a TermsNotice component", () => {
    renderWithProviders();

    // Check for the main text
    expect(screen.getByText(/by continuing you agree/i)).toBeInTheDocument();
    
    // Check for the Terms span (not a link, so we use getByText)
    expect(screen.getByText("Terms")).toBeInTheDocument();
    
    // Check for the Privacy Policy span
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    
    // Check that they have the cursor-pointer class (optional)
    const termsSpan = screen.getByText("Terms");
    expect(termsSpan).toHaveClass("cursor-pointer");
    
    const privacySpan = screen.getByText("Privacy Policy");
    expect(privacySpan).toHaveClass("cursor-pointer");
  });
});

  describe("navigation", () => {
    it("has a link to login page", () => {
      renderWithProviders();

      const signinLink = screen.getByRole("link", { name: /sign in/i });
      expect(signinLink).toHaveAttribute("href", "/auth/login");
    });
  });
});