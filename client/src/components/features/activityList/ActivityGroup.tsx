import type { AuditEntryDto } from "@/lib/api/types";
import { ActivityEntry } from "./ActivityEntry";

interface ActivityGroupProps {
  label: string;
  entries: AuditEntryDto[];
  memberMap: Map<string, string>;
  onEntryClick: (id: string) => void;
}

export function ActivityGroup({ label, entries, memberMap, onEntryClick }: ActivityGroupProps) {
  if (entries.length === 0) return null;

  return (
    <div className="mb-8">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
        style={{ color: "var(--c-texTer)" }}
      >
        {label}
      </h3>
      <div className="space-y-1">
        {entries.map(entry => {
          const username = memberMap.get(entry.actorUserId) || entry.actorUserId.slice(0, 8);
          return (
            <ActivityEntry
              key={entry.id}
              entry={entry}
              username={username}
              onClick={onEntryClick}
            />
          );
        })}
      </div>
    </div>
  );
}