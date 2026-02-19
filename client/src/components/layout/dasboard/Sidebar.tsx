import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  Inbox, LayoutGrid, Plus, Sun, Moon,
  User, Settings, Circle,
} from "lucide-react";
import { useStore, actions } from "../../../lib/store";
import type { Project } from "../../../lib/types";

const NAV_ITEMS = [
  { label: "Today", icon: Sun, path: "/today" },
  { label: "Upcoming", icon: CalendarDays, path: "/upcoming" },
  { label: "All Tasks", icon: Inbox, path: "/tasks" },
  { label: "Completed", icon: CheckCircle2, path: "/completed" },
];

const PROJECT_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewTask: () => void;
}

export function Sidebar({ collapsed, onToggle, onNewTask }: SidebarProps) {
  const { state, dispatch, getProjectTaskCount } = useStore();
  const location = useLocation();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    dispatch(actions.addProject({
      name: newProjectName.trim(),
      color: PROJECT_COLORS[state.projects.length % PROJECT_COLORS.length],
    }));
    setNewProjectName("");
    setAddingProject(false);
  };

  const toggleTheme = () => {
    dispatch(actions.setTheme(state.theme === "light" ? "dark" : "light"));
  };

  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname === path;

  const PROJECT_ROUTE = "/dashboard/projects/$projectId";

  return (
    <aside
      className="layout-sidebar flex flex-col h-full"
      style={{ width: collapsed ? "56px" : "240px" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-3 py-4"
        style={{ borderBottom: "1px solid var(--c-borPri)" }}
      >
        <button
          onClick={onToggle}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          aria-label="Toggle sidebar"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--c-bluTexAccPri)" }}
          >
            <LayoutGrid className="w-4 h-4" style={{ color: "var(--c-bacPri)" }} />
          </div>
          {!collapsed && (
            <span
              className="font-display text-lg leading-none"
              style={{ color: "var(--c-texPri)" }}
            >
              TaskHub
            </span>
          )}
        </button>
      </div>

      {/* New Task Button */}
      <div className="px-2 py-3">
        <button
          onClick={onNewTask}
          className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${
            collapsed ? "justify-center" : ""
          }`}
          style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Task</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${active ? "active" : ""} ${
                collapsed ? "justify-center" : ""
              }`}
              title={collapsed ? label : undefined}
              activeProps={{ className: "active" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}

        {/* Projects Section */}
        <div className="pt-3">
          {!collapsed && (
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="flex items-center gap-1 w-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
              style={{ color: "var(--c-texTer)" }}
            >
              {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Projects</span>
            </button>
          )}

          {(projectsOpen || collapsed) && (
            <div className="space-y-0.5 mt-0.5">
              {state.projects.map((project: Project) => {  
                const count = getProjectTaskCount(project.id);
                const active = isActive(`/projects/${project.id}`);
                return (
                  <Link
                    key={project.id}
                    to={PROJECT_ROUTE}
                    params={{ projectId: project.id }}
                    className={`nav-item ${active ? "active" : ""} ${
                      collapsed ? "justify-center" : ""
                    }`}
                    title={collapsed ? project.name : undefined}
                    activeProps={{ className: "active" }}
                  >
                    <Circle
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: project.color, fill: project.color }}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{project.name}</span>
                        {count > 0 && (
                          <span
                            className="text-xs font-mono"
                            style={{ color: "var(--c-texTer)" }}
                          >
                            {count}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}

              {/* Add project */}
              {!collapsed && (
                <div>
                  {addingProject ? (
                    <div className="px-3 py-2">
                      <input
                        autoFocus
                        type="text"
                        placeholder="Project name..."
                        value={newProjectName}
                        onChange={e => setNewProjectName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") handleAddProject();
                          if (e.key === "Escape") setAddingProject(false);
                        }}
                        onBlur={() => { 
                          if (!newProjectName.trim()) setAddingProject(false); 
                        }}
                        className="th-input text-sm py-1 w-full"
                        style={{
                          backgroundColor: "var(--c-bacTer)",
                          border: "1px solid var(--c-borPri)",
                          borderRadius: "6px",
                          padding: "4px 8px",
                          color: "var(--c-texPri)",
                        }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingProject(true)}
                      className="nav-item w-full opacity-60 hover:opacity-100"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-xs">Add Project</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Nav */}
      <div
        className="px-2 py-2 space-y-0.5"
        style={{ borderTop: "1px solid var(--c-borPri)" }}
      >
        <Link
          to="/dashboard/profile"
          className={`nav-item ${isActive("/profile") ? "active" : ""} ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Profile" : undefined}
          activeProps={{ className: "active" }}
        >
          <User className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <Link
          to="/dashboard/settings"
          className={`nav-item ${isActive("/settings") ? "active" : ""} ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Settings" : undefined}
          activeProps={{ className: "active" }}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={toggleTheme}
          className={`nav-item w-full ${collapsed ? "justify-center" : ""}`}
          title={state.theme === "light" ? "Dark mode" : "Light mode"}
        >
          {state.theme === "light"
            ? <Moon className="w-4 h-4 flex-shrink-0" />
            : <Sun className="w-4 h-4 flex-shrink-0" />
          }
          {!collapsed && <span>{state.theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
        </button>
      </div>
    </aside>
  );
}