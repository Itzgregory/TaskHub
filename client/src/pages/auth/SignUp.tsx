import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupBrand } from "@/components/auth/signup/SignupBrand";
import { MobileLogo } from "@/components/auth/MobileLogo";
import { SignupForm } from "@/components/auth/signup/SignupForm";
import { Divider } from "@/components/auth/Divider";
import { GoogleButton } from "@/components/auth/login/GoogleButton";
import { TermsNotice } from "@/components/auth/signup/TermsNotice";


export default function SignupPage() {
  const handleSignup = (name: string, email: string, password: string) => {
    console.log("Signup attempt:", { name, email, password });
    // Handle signup logic here
  };

  const handleGoogleSignup = () => {
    console.log("Google signup");
    // Handle Google signup
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
            <SignupForm onSubmit={handleSignup} />
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