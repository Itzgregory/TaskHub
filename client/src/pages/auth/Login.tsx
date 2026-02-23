import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LoginBrand } from "@/components/auth/login/LoginBrand";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { GoogleButton } from "@/components/auth/login/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { MobileLogo } from "@/components/auth/MobileLogo";
import { useLogin } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/hooks/use-toast";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
      });

      // Set user in auth context
      setUser({
        userId: response.userId,
        email: response.email,
        onboardingCompleted: response.onboardingCompleted,
      });

      // Navigate based on onboarding status
      if (response.onboardingCompleted) {
        navigate({ to: "/dashboard/org/home" });
      } else {
        navigate({ to: "/auth/onboarding" });
      }

      toast({
        title: "Welcome back!",
        description: `Signed in as ${response.email}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      setError(errorMessage);
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Coming soon",
      description: "Google sign-in is not yet available.",
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--c-bacPri)" }}
    >
      <LoginBrand />

      {/* Right panel (form) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <MobileLogo />

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold" style={{ color: "var(--c-texPri)" }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: "var(--c-texSec)" }}>
              Sign in to continue to TaskHub
            </p>
          </div>

          {error && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--c-redBacSec)",
                color: "var(--c-redTexAccPri)",
              }}
            >
              {error}
            </div>
          )}
          <LoginForm
            onSubmit={handleLogin}
            isLoading={loginMutation.isPending}
          />
          <Divider />
          <GoogleButton onClick={handleGoogleLogin} />

          {/* Sign up link */}
          <p className="text-center text-sm" style={{ color: "var(--c-texSec)" }}>
            Don't have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-medium"
              style={{ color: "var(--c-bluTexAccPri)" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}