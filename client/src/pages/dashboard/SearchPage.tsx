import { stripSearchParams } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppLayout } from "../../components/layout/dasboard/AppLayout";
import { TaskList } from "../../components/features/TaskList";
import { useStore } from "../../lib/store";

export default function SearchPage() {
  const searchParams = stripSearchParams(window.location.search);
  const query = new URLSearchParams(String(searchParams)).get("q") ?? "";
  const { searchTasks } = useStore();

  const results = query ? searchTasks(query) : [];

  return (
    <AppLayout
      title="Search"
      subtitle={query ? `Results for "${query}"` : "Search for tasks"}
    >
      {query ? (
        <>
          <p className="text-xs mb-4" style={{ color: "var(--c-texTer)" }}>
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <TaskList
            tasks={results}
            showProject
            emptyMessage={`No tasks found for "${query}"`}
            emptyIcon={<Search className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ backgroundColor: "var(--c-bacTer)" }}
          >
            <Search className="w-6 h-6" style={{ color: "var(--c-texDis)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--c-texTer)" }}>
            Use the search bar above to find tasks
          </p>
        </div>
      )}
    </AppLayout>
  );
}
