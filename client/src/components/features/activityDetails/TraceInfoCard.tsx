import type { AuditEntryDto } from "@/lib/api/types";

interface TraceInfoCardProps {
  entry: AuditEntryDto;
  timestamp: Date;
}

export function TraceInfoCard({ entry, timestamp }: TraceInfoCardProps) {
  return (
    <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Trace Info</h3>
      <div className="space-y-2">
        <DetailItem label="Correlation ID" value={entry.correlationId} />
        <DetailItem label="Timestamp (UTC)" value={timestamp.toISOString()} />
        <DetailItem label="Entry ID" value={entry.id} />
        {entry.additionalInfo && (
          <div>
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>Additional Info</span>
            <p className="text-sm mt-0.5" style={{ color: "var(--c-texSec)" }}>{entry.additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs" style={{ color: "var(--c-texTer)" }}>{label}</span>
      <p className="font-mono text-xs mt-0.5 break-all" style={{ color: "var(--c-texSec)" }}>{value}</p>
    </div>
  );
}