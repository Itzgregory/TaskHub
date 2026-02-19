import { CheckSquare2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FEATURE_CHIPS, QUOTE } from "@/lib/constants/auth";
import { Badge } from "@/components/ui/badge";

export function LoginBrand() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
      style={{ backgroundColor: "var(--c-bacSec)", borderRight: "1px solid var(--c-borPri)" }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: "var(--c-bluBacTer)" }}
      />
      <div
        className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "var(--c-bluBacAccSec)" }}
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

      {/* Quote */}
      <div className="relative z-10 space-y-6">
        <blockquote
          className="text-3xl font-semibold leading-snug"
          style={{ fontFamily: "'Lyon-Text', serif", color: "var(--c-texPri)" }}
        >
          "{QUOTE.text}"
        </blockquote>
        <p className="text-sm" style={{ color: "var(--c-texSec)" }}>
          — {QUOTE.author}
        </p>
      </div>

      {/* Feature chips - using Badge component */}
      <div className="relative z-10 flex flex-wrap gap-2">
        {FEATURE_CHIPS.map((f) => (
          <Badge
            key={f}
            variant="outline"
            className="text-xs px-3 py-1.5 rounded-full font-normal"
            style={{
              backgroundColor: "var(--c-bacTer)",
              borderColor: "var(--c-borPri)",
              color: "var(--c-texSec)",
            }}
          >
            {f}
          </Badge>
        ))}
      </div>
    </div>
  );
}