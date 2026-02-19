import { useState } from "react";
import { useStore } from "../../../lib/store"; // Add this import
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TaskFormModal } from "../../features/TaskFormModal";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { state } = useStore(); // Get theme from store
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);

  return (
    <div className={`layout ${state.theme === 'dark' ? 'dark taskhub-dark-theme' : 'taskhub-light-theme'}`}>
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