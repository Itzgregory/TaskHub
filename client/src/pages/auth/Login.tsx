import { Link } from "@tanstack/react-router";
import { LoginBrand } from "@/components/auth/login/LoginBrand";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { GoogleButton } from "@/components/auth/login/GoogleButton";
import { Divider } from "@/components/auth/Divider";
import { MobileLogo } from "@/components/auth/MobileLogo";


export default function LoginPage() {
  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt:", { email, password });
    // Handle login logic here
  };

  const handleGoogleLogin = () => {
    console.log("Google login");
    // Handle Google login
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

          <LoginForm onSubmit={handleLogin} />
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