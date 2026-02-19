import { Check } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "@/lib/constants/auth";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (password.length === 0) return null;

  return (
    <div className="space-y-1 pt-1">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const isValid = req.test(password);
        return (
          <div key={req.label} className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: isValid
                  ? "var(--c-greTexAccPri)"
                  : "var(--c-bacTer)",
              }}
            >
              {isValid && <Check className="w-2 h-2" style={{ color: "#fff" }} />}
            </div>
            <span
              className="text-xs"
              style={{
                color: isValid ? "var(--c-greTexPri)" : "var(--c-texTer)",
              }}
            >
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}