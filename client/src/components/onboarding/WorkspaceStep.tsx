import { Check } from "lucide-react";
import { ROLES } from "@/lib/constants/onboarding";

interface WorkspaceStepProps {
  selectedRole: string;
  onRoleChange: (roleId: string) => void;
}

export function WorkspaceStep({ selectedRole, onRoleChange }: WorkspaceStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--c-texPri)" }}>
          How will you use TaskHub?
        </h2>
        <p className="text-sm" style={{ color: "var(--c-texSec)" }}>
          We'll set up your workspace accordingly
        </p>
      </div>

      <div className="space-y-3">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const active = selectedRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRoleChange(r.id)}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-all"
              style={{
                backgroundColor: active ? "var(--c-bluBacPri)" : "var(--c-bacSec)",
                border: `1px solid ${active ? "var(--c-bluBorStr)" : "var(--c-borPri)"}`,
              }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: active ? "var(--c-bluBacSec)" : "var(--c-bacTer)",
                }}
              >
                <Icon
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  style={{ color: active ? "var(--c-bluTexAccPri)" : "var(--c-icoSec)" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
                  {r.label}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--c-texSec)" }}>
                  {r.desc}
                </p>
              </div>
              {active && (
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--c-bluBacAccPri)" }}
                >
                  <Check className="w-2 h-2 sm:w-3 sm:h-3" style={{ color: "#fff" }} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}