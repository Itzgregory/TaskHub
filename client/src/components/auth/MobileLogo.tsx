import { CheckSquare2 } from "lucide-react";

export function MobileLogo() {
  return (
    <div className="lg:hidden flex items-center gap-2 mb-10">
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
  );
}