interface ImportReportProps {
  report: {
    acceptedCount: number;
    rejectedCount: number;
    rejectedRows?: Array<{ rowIndex: number; errors: string[] }>;
  } | null;
}

export function ImportReport({ report }: ImportReportProps) {
  if (!report || report.rejectedCount === 0) return null;

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{
        backgroundColor: "var(--c-yelBacSec)",
        border: "1px solid var(--c-yelBorPri)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--c-yelTexAccPri)" }}>
        {report.rejectedCount} row(s) rejected
      </p>
      {report.rejectedRows?.map((row) => (
        <div key={row.rowIndex} className="text-xs" style={{ color: "var(--c-texSec)" }}>
          <span className="font-mono font-semibold">Row {row.rowIndex + 1}:</span>{" "}
          {row.errors.join(", ")}
        </div>
      ))}
    </div>
  );
}