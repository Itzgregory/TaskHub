import { Clock } from "lucide-react";

interface ActivityHeaderProps {
  username: string;
  initials: string;
  meta: {
    label: string;
    icon: React.ElementType;
    color: string;
    entityLabel: string;
  };
  timestamp: Date;
}

export function ActivityHeader({ username, initials, meta, timestamp }: ActivityHeaderProps) {
  const TypeIcon = meta.icon;

  return (
    <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: meta.color + "20", color: meta.color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-base font-semibold" style={{ color: "var(--c-texPri)" }}>{username}</h2>
            <span className="text-sm" style={{ color: "var(--c-texTer)" }}>{meta.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--c-texTer)" }}>
            <span className="flex items-center gap-1">
              <TypeIcon className="w-3 h-3" style={{ color: meta.color }} />
              {meta.entityLabel}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timestamp.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}