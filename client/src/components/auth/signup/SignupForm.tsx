import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "./PasswordStrength";

interface SignupFormProps {
  onSubmit?: (name: string, email: string, password: string) => void;
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(name, email, password);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Full name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" style={{ color: "var(--c-texPri)" }}>
          Full name
        </Label>
        <div className="relative">
          <User
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--c-icoTer)" }}
          />
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Johnson"
            className="pl-9"
            style={{
              backgroundColor: "var(--c-bacSec)",
              borderColor: "var(--c-borPri)",
              color: "var(--c-texPri)",
            }}
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" style={{ color: "var(--c-texPri)" }}>
          Email
        </Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--c-icoTer)" }}
          />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="pl-9"
            style={{
              backgroundColor: "var(--c-bacSec)",
              borderColor: "var(--c-borPri)",
              color: "var(--c-texPri)",
            }}
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" style={{ color: "var(--c-texPri)" }}>
          Password
        </Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--c-icoTer)" }}
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pl-9 pr-10"
            style={{
              backgroundColor: "var(--c-bacSec)",
              borderColor: "var(--c-borPri)",
              color: "var(--c-texPri)",
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            style={{ color: "var(--c-icoTer)" }}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <PasswordStrength password={password} />
      </div>

      <Button
        type="submit"
        className="w-full mt-2"
        style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
      >
        Create account
      </Button>
    </form>
  );
}