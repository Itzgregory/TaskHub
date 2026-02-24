import type { AuditEntryDto } from "@/lib/api/types";
import { AUDIT_ACTION_META, DEFAULT_AUDIT_META } from "@/lib/utils/org-constants";
import { formatTimestamp } from "@/lib/utils/activity";

interface ActivityEntryProps {
  entry: AuditEntryDto;
  username: string;
  onClick: (id: string) => void;
}

export function ActivityEntry({ entry, username, onClick }: ActivityEntryProps) {
  const meta = AUDIT_ACTION_META[entry.action] ?? DEFAULT_AUDIT_META;
  const Icon = meta.icon;
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-start gap-3 px-3 py-3 rounded-lg transition-colors cursor-pointer"
      onClick={() => onClick(entry.id)}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = "var(--c-bacTer)")}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = "transparent")}
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
        style={{ backgroundColor: meta.color + "20", color: meta.color }}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "var(--c-texPri)" }}>
          <span className="font-medium">{username}</span>{" "}
          <span style={{ color: "var(--c-texTer)" }}>{meta.label}</span>
          {entry.additionalInfo && (
            <span className="font-medium ml-1" style={{ color: "var(--c-texSec)" }}>
              — {entry.additionalInfo}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "var(--c-bacTer)", color: "var(--c-texTer)" }}
          >
            {meta.entityLabel}
          </span>
          <span className="text-[10px]" style={{ color: "var(--c-texDis)" }}>
            {formatTimestamp(entry.timestamp)}
          </span>
        </div>
      </div>

      <Icon className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: meta.color }} />
    </div>
  );
}