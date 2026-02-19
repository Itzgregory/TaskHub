import { Badge } from "@/components/ui/badge";
import { FEATURE_PILLS } from "@/lib/constants/landing";

export function FeaturePills() {
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-2">
      {FEATURE_PILLS.map(({ Icon, label }) => (
        <Badge
          key={label}
          variant="outline"
          style={{
            borderColor: "var(--c-borPri)",
            color: "var(--c-texSec)",
            backgroundColor: "var(--c-bacPri)",
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full"
        >
          <Icon size={12} />
          {label}
        </Badge>
      ))}
    </div>
  );
}