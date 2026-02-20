import { useState, useEffect } from "react";
import { useStore } from "../../../lib/store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TaskFormModal } from "../../features/TaskFormModal";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { state } = useStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when window resizes to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      // On mobile, toggle the overlay menu
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      // On desktop, toggle collapsed state
      setSidebarCollapsed(c => !c);
    }
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`layout ${state.theme === 'dark' ? 'dark taskhub-dark-theme' : 'taskhub-light-theme'}`}>
      {/* Sidebar - conditionally rendered for mobile */}
      <div
        className={`
          fixed md:static top-0 left-0 z-50 h-full
          transition-transform duration-300 ease-in-out
          ${isMobile ? (
            mobileMenuOpen 
              ? 'translate-x-0' 
              : '-translate-x-full'
          ) : ''}
        `}
      >
        <Sidebar
          collapsed={!isMobile && sidebarCollapsed}
          onToggle={handleSidebarToggle}
          onNewTask={() => {
            setTaskFormOpen(true);
            if (isMobile) setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Mobile overlay backdrop */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      <div className="layout-content">
        <Header
          title={title}
          subtitle={subtitle}
          onSidebarToggle={handleSidebarToggle}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-3xl w-full">
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