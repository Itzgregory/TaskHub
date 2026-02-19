import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  Inbox, LayoutGrid, Plus, Sun, Moon,
  User, Settings, Circle, Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useStore, actions } from "../../../lib/store";
import type { Project } from "../../../lib/types";

const NAV_ITEMS = [
  { label: "Today", icon: Sun, path: "/dashboard/today" },
  { label: "Upcoming", icon: CalendarDays, path: "/dashboard/upcoming" },
  { label: "All Tasks", icon: Inbox, path: "/dashboard/task" },
  { label: "Completed", icon: CheckCircle2, path: "/dashboard/completed" },
];

const PROJECT_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#3b82f6",
  "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6",
];

// Mock org data - replace with actual from context
const MOCK_ORGS = [
  { id: "1", name: "Acme Inc", role: "Owner", initials: "AI", taskCount: 12 },
  { id: "2", name: "Beta LLC", role: "Member", initials: "BL", taskCount: 5 },
  { id: null, name: "Personal Workspace", role: null, initials: "PW", taskCount: 3 },
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
  
  // In real app, this would come from context
  const [activeOrg, setActiveOrg] = useState(MOCK_ORGS[0]);

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

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
        <Button
          variant="ghost"
          onClick={onToggle}
          className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
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
        </Button>
      </div>

      {/* New Task Button */}
      <div className="px-2 py-3">
        <Button
          onClick={onNewTask}
          className={`flex items-center gap-2 w-full ${
            collapsed ? "justify-center px-2" : "justify-start"
          }`}
          style={{ backgroundColor: "var(--c-bluTexAccPri)" }}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Task</span>}
        </Button>
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
            <Button
              variant="ghost"
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="flex items-center gap-1 w-full justify-start px-3 py-1.5 h-auto text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--c-texTer)" }}
            >
              {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Projects</span>
            </Button>
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
                    <Button
                      variant="ghost"
                      onClick={() => setAddingProject(true)}
                      className="nav-item w-full justify-start opacity-60 hover:opacity-100"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="text-xs">Add Project</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom section with Org switcher and user actions */}
      {!collapsed && (
        <div
          className="px-2 py-3 space-y-2"
          style={{ borderTop: "1px solid var(--c-borPri)" }}
        >
          {/* Organisation switcher with avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between px-2 py-2 h-auto"
                style={{
                  backgroundColor: "var(--c-bacTer)",
                  borderRadius: "8px",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback 
                      className="text-xs"
                      style={{ 
                        backgroundColor: "var(--c-bluBacAccPri)",
                        color: "#fff"
                      }}
                    >
                      {activeOrg.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {activeOrg.name}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--c-icoSec)" }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start"
              className="w-56"
              style={{
                backgroundColor: "var(--c-bacEle)",
                borderColor: "var(--c-borPri)",
              }}
            >
              <DropdownMenuLabel style={{ color: "var(--c-texTer)" }}>
                Switch workspace
              </DropdownMenuLabel>
              
              {MOCK_ORGS.map((org) => (
                <DropdownMenuItem
                  key={org.id || "personal"}
                  onClick={() => setActiveOrg(org)}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                  style={{
                    color: activeOrg.id === org.id ? "var(--c-texPri)" : "var(--c-texSec)",
                  }}
                >
                  <Avatar className="w-5 h-5">
                    <AvatarFallback 
                      className="text-[10px]"
                      style={{ 
                        backgroundColor: org.id === activeOrg.id ? "var(--c-bluBacAccPri)" : "var(--c-bacTer)",
                        color: org.id === activeOrg.id ? "#fff" : "var(--c-texSec)",
                      }}
                    >
                      {org.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <span className="text-sm truncate">{org.name}</span>
                    {org.role && (
                      <Badge 
                        variant="secondary"
                        className="ml-2 text-[10px] px-1 py-0"
                        style={{
                          backgroundColor: org.role === "Owner" ? "var(--c-bluBacSec)" : "var(--c-bacTer)",
                          color: org.role === "Owner" ? "var(--c-bluTexAccPri)" : "var(--c-texSec)",
                        }}
                      >
                        {org.role}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator style={{ backgroundColor: "var(--c-borPri)" }} />
              
              <DropdownMenuItem
                className="flex items-center gap-3 py-2 cursor-pointer"
                style={{ color: "var(--c-texSec)" }}
              >
                <Building2 className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
                <span className="text-sm">Browse all organisations</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User actions row */}
          <div className="flex items-center justify-around pt-1">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Settings className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <User className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={toggleTheme}>
              {state.theme === "light" 
                ? <Moon className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
                : <Sun className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
              }
            </Button>
          </div>
        </div>
      )}

      {/* Collapsed view - just icons */}
      {collapsed && (
        <div
          className="px-2 py-3 space-y-2"
          style={{ borderTop: "1px solid var(--c-borPri)" }}
        >
          <Button variant="ghost" size="icon" className="w-full h-8">
            <Avatar className="w-5 h-5">
              <AvatarFallback 
                className="text-[8px]"
                style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
              >
                {activeOrg.initials}
              </AvatarFallback>
            </Avatar>
          </Button>
          <Button variant="ghost" size="icon" className="w-full h-8">
            <Settings className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
          </Button>
          <Button variant="ghost" size="icon" className="w-full h-8">
            <User className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
          </Button>
          <Button variant="ghost" size="icon" className="w-full h-8" onClick={toggleTheme}>
            {state.theme === "light" 
              ? <Moon className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
              : <Sun className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            }
          </Button>
        </div>
      )}
    </aside>
  );
}