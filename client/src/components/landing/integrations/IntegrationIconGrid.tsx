import { Card } from "@/components/ui/card";
import { INTEGRATIONS } from "@/lib/constants/landing";

export function IntegrationIconGrid() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {INTEGRATIONS.map(({ Icon, name }) => (
        <Card
          key={name}
          style={{
            backgroundColor: "var(--c-bacPri)",
            border: "1px solid var(--c-borPri)",
            boxShadow: "var(--c-shaXS)",
          }}
          className="aspect-square flex flex-col items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform cursor-default group p-2"
        >
          <Icon size={22} style={{ color: "var(--c-texSec)" }} />
          <span style={{ color: "var(--c-texTer)" }} className="text-[10px] font-medium text-center px-1">
            {name}
          </span>
        </Card>
      ))}
    </div>
  );
}