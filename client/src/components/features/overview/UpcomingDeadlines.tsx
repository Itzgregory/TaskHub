import { Calendar, Target } from "lucide-react";

export interface DeadlineItem {
  task: string;
  project: string;
  date: string;
}

interface UpcomingDeadlinesProps {
  deadlines: DeadlineItem[];
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  return (
    <div
      className="lg:col-span-2 rounded-xl p-5"
      style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--c-texPri)" }}>Upcoming Deadlines</h3>
        <Calendar className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
      </div>
      <div className="space-y-3">
        {deadlines.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--c-texTer)" }}>No upcoming deadlines.</p>
        ) : (
          deadlines.map((d, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ backgroundColor: "var(--c-bacTer)" }}
            >
              <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--c-texTer)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>{d.task}</p>
                <p className="text-xs" style={{ color: "var(--c-texTer)" }}>{d.project}</p>
              </div>
              <span
                className="text-xs font-medium flex-shrink-0 px-2 py-0.5 rounded-full"
                style={{ color: "var(--c-texSec)" }}
              >
                {d.date}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}