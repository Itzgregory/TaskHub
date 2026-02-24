import type { AuditEntryDto } from "@/lib/api/types";

interface EventDetailsCardProps {
  entry: AuditEntryDto;
  username: string;
}

export function EventDetailsCard({ entry, username }: EventDetailsCardProps) {
  const details = [
    { label: "Action", value: entry.action },
    { label: "Entity Type", value: entry.entityType },
    { label: "Entity ID", value: entry.entityId || "—" },
    { label: "Actor", value: username },
    { label: "Actor ID", value: entry.actorUserId },
  ];

  return (
    <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Event Details</h3>
      <div className="space-y-2">
        {details.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span style={{ color: "var(--c-texTer)" }}>{label}</span>
            <span className="font-mono text-xs" style={{ color: "var(--c-texSec)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}