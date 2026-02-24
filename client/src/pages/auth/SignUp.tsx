import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupBrand } from "@/components/auth/signup/SignupBrand";
import { MobileLogo } from "@/components/auth/MobileLogo";
import { SignupForm } from "@/components/auth/signup/SignupForm";
import { Divider } from "@/components/auth/Divider";
import { GoogleButton } from "@/components/auth/login/GoogleButton";
import { TermsNotice } from "@/components/auth/signup/TermsNotice";
import { useRegister } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/hooks/use-toast";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate()
  const { setUser } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const handleSignup = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await registerMutation.mutateAsync({
        email,
        password,
      });

      // Set user in auth context (onboarding not completed yet)
      setUser({
        userId: response.userId,
        email: response.email,
        onboardingCompleted: false,
      });

      // Navigate to onboarding
      navigate({ to: "/auth/onboarding" });

      toast({
        title: "Account created!",
        description: "Please complete your profile setup.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(errorMessage);
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignup = () => {
    toast({
      title: "Coming soon",
      description: "Google sign-up is not yet available.",
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--c-bacPri)" }}
    >
      <SignupBrand />

      {/* Right panel (form) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <MobileLogo />

        <Card className="w-full max-w-sm border-none shadow-none" style={{ backgroundColor: "transparent" }}>
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl" style={{ color: "var(--c-texPri)" }}>
              Create your account
            </CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>
              Get started for free — no card needed
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
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
            <SignupForm
              onSubmit={handleSignup}
              isLoading={registerMutation.isPending}
            />
            <Divider />
            <GoogleButton onClick={handleGoogleSignup} />
          </CardContent>
        </Card>

        {/* Sign in link */}
        <p className="text-center text-sm mt-6" style={{ color: "var(--c-texSec)" }}>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-medium hover:underline"
            style={{ color: "var(--c-bluTexAccPri)" }}
          >
            Sign in
          </Link>
        </p>

        <TermsNotice />
      </div>
    </div>
  );
}