import { TableHead, TableRow } from "@/components/ui/table";

export function TasksTableHeader() {
  return (
    <TableRow style={{ backgroundColor: "var(--c-bacTer)" }}>
      <TableHead className="w-10 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>S/N</TableHead>
      <TableHead className="w-8" />
      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Task</TableHead>
      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Priority</TableHead>
      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Due Date</TableHead>
      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Assignee</TableHead>
      <TableHead className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--c-texTer)" }}>Tags</TableHead>
      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right" style={{ color: "var(--c-texTer)" }}>Actions</TableHead>
    </TableRow>
  );
}