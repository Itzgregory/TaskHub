import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TaskFormModal } from "../../features/TaskFormModal";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  return (
    <div className="layout taskhub-light-theme">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onNewTask={() => setTaskFormOpen(true)}
      />
      <div className="layout-content">
        <Header
          title={title}
          subtitle={subtitle}
          onSidebarToggle={() => setSidebarCollapsed(c => !c)}
        />
        <main className="flex-1 px-6 py-6 max-w-3xl w-full">
          {children}
        </main>
      </div>

      {taskFormOpen && (
        <TaskFormModal
          onClose={() => setTaskFormOpen(false)}
        />
      )}
    </div>
  );
}
