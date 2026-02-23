export type FilterStatus = "all" | "open" | "done";
export type SortBy = "order" | "dueDate" | "priority";

export const FILTER_BTNS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

// Sort options for the select
export const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "order", label: "Default" },
  { value: "dueDate", label: "Due Date" },
  { value: "priority", label: "Priority" },
];
