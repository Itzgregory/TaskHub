import { CheckSquare2 } from "lucide-react";
import { SIGNUP_FEATURES } from "@/lib/constants/auth";

export function SignupBrand() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
      style={{ backgroundColor: "var(--c-bacSec)", borderRight: "1px solid var(--c-borPri)" }}
    >
      <div
        className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-25 blur-3xl"
        style={{ backgroundColor: "var(--c-bluBacTer)" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-40px] w-[260px] h-[260px] rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "var(--c-greTexAccPri)" }}
      />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "var(--c-bluBacAccPri)" }}
        >
          <CheckSquare2 className="w-5 h-5" style={{ color: "#fff" }} />
        </div>
        <span
          className="text-xl"
          style={{ fontFamily: "'Permanent Marker', cursive", color: "var(--c-texPri)" }}
        >
          TaskHub
        </span>
      </div>

      {/* Feature list */}
      <div className="relative z-10 space-y-5">
        <p className="text-lg font-semibold" style={{ color: "var(--c-texPri)" }}>
          Everything you need to stay on top
        </p>
        {SIGNUP_FEATURES.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            <span className="text-xl">{f.emoji}</span>
            <span className="text-sm" style={{ color: "var(--c-texSec)" }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      <p className="relative z-10 text-xs" style={{ color: "var(--c-texTer)" }}>
        Free forever. No credit card required.
      </p>
    </div>
  );
}