import { Separator } from "@/components/ui/separator";

interface AboutStatsProps {
  taskCount: number;
  projectCount: number;
  version?: string;
}

export function AboutStats({ taskCount, projectCount, version = "1.0.0" }: AboutStatsProps) {
  const stats = [
    { label: "Version", value: version },
    { label: "Tasks", value: String(taskCount) },
    { label: "Projects", value: String(projectCount) },
  ];

  return (
    <div
      className="rounded-xl p-4 space-y-2"
      style={{
        backgroundColor: "var(--c-bacSec)",
        border: "1px solid var(--c-borPri)",
      }}
    >
      {stats.map(({ label, value }, index) => (
        <div key={label}>
          <div className="flex justify-between text-sm">
            <span style={{ color: "var(--c-texTer)" }}>{label}</span>
            <span className="font-mono" style={{ color: "var(--c-texSec)" }}>
              {value}
            </span>
          </div>
          {index < stats.length - 1 && (
            <Separator
              className="my-2"
              style={{ backgroundColor: "var(--c-borSec)" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}