import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  Inbox, LayoutGrid, Plus, Sun, Moon,
  User, Settings, Circle, Building2, Users, FolderKanban, Activity, LogOut,
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
import { useStore, actions } from "@/lib/store";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSetActiveOrg } from "@/lib/api/hooks";
import { useQueryClient } from "@tanstack/react-query";

// Unified dashboard navigation
const NAV_ITEMS = [
  { label: "Today", icon: Sun, path: "/dashboard/today" },
  { label: "Upcoming", icon: CalendarDays, path: "/dashboard/upcoming" },
  { label: "All Tasks", icon: Inbox, path: "/dashboard/task" },
  { label: "Completed", icon: CheckCircle2, path: "/dashboard/completed" },
  { label: "Dashboard", icon: Building2, path: "/dashboard/org/home" },
  { label: "Members", icon: Users, path: "/dashboard/org/members" },
  { label: "Projects", icon: FolderKanban, path: "/dashboard/org/projects" },
  { label: "Activity", icon: Activity, path: "/dashboard/org/activity" },
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
  const { activeOrg, organisations, setActiveOrg, user, logout } = useAuth();
  const setActiveOrgMutation = useSetActiveOrg();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleTheme = () => {
    dispatch(actions.setTheme(state.theme === "light" ? "dark" : "light"));
  };

  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname === path

  // Handle org switching
  const handleSwitchOrg = async (org: typeof organisations[0]) => {
    setActiveOrg(org);
    try {
      await setActiveOrgMutation.mutateAsync({ orgId: org.orgId });
    } catch {
      // Silently fail — local state is already set
    }
    // Invalidate all data queries so new org data is fetched
    queryClient.invalidateQueries({ queryKey: ['todos'] });
    queryClient.invalidateQueries({ queryKey: ['organisations', 'members'] });
    queryClient.invalidateQueries({ queryKey: ['audit'] });
    navigate({ to: "/dashboard/org/home" });
  };



  // Org display helpers
  const orgInitials = activeOrg
    ? activeOrg.orgName.slice(0, 2).toUpperCase()
    : "TH";
  const orgDisplayName = activeOrg ? activeOrg.orgName : "TaskHub";

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
              {activeOrg && (
                <span className="text-xs ml-2" style={{ color: "var(--c-texSec)" }}>
                  • {activeOrg.orgName}
                </span>
              )}
            </span>
          )}
        </button>
      </div>

      {/* New Task Button */}
      <div className="px-2 py-3">
        <Button
          onClick={onNewTask}
          className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${collapsed ? "justify-center" : ""}`}
          style={{ backgroundColor: "var(--c-bluTexAccPri)", color: "var(--c-bacPri)" }}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Task</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {/* Unified Navigation */}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`nav-item ${active ? "active" : ""} ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? label : undefined}
                activeProps={{ className: "active" }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom section with Org switcher and user actions */}
      {!collapsed ? (
        <div
          className="px-2 py-3 space-y-2"
          style={{ borderTop: "1px solid var(--c-borPri)" }}
        >
          {/* Organisation switcher */}
          {organisations.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ backgroundColor: "var(--c-bacTer)" }}
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
                        {orgInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate" style={{ color: "var(--c-texPri)" }}>
                      {orgDisplayName}
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


                {organisations.length > 0 && (
                  <DropdownMenuSeparator style={{ backgroundColor: "var(--c-borPri)" }} />
                )}

                {/* Real organisations from API */}
                {organisations.map((org) => (
                  <DropdownMenuItem
                    key={org.orgId}
                    onClick={() => handleSwitchOrg(org)}
                    className="flex items-center gap-3 py-2 cursor-pointer"
                    style={{
                      color: activeOrg?.orgId === org.orgId ? "var(--c-texPri)" : "var(--c-texSec)",
                    }}
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarFallback
                        className="text-[10px]"
                        style={{
                          backgroundColor: activeOrg?.orgId === org.orgId ? "var(--c-bluBacAccPri)" : "var(--c-bacTer)",
                          color: activeOrg?.orgId === org.orgId ? "#fff" : "var(--c-texSec)",
                        }}
                      >
                        {org.orgName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className="text-sm truncate">{org.orgName}</span>
                      <Badge
                        variant="secondary"
                        className="ml-2 text-[10px] px-1 py-0"
                        style={{
                          backgroundColor: org.role === "OrgAdmin" ? "var(--c-bluBacSec)" : "var(--c-bacTer)",
                          color: org.role === "OrgAdmin" ? "var(--c-bluTexAccPri)" : "var(--c-texSec)",
                        }}
                      >
                        {org.role === "OrgAdmin" ? "Admin" : "Member"}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator style={{ backgroundColor: "var(--c-borPri)" }} />

                <DropdownMenuItem
                  onClick={() => navigate({ to: "/auth/org-selection" })}
                  className="flex items-center gap-3 py-2 cursor-pointer"
                  style={{ color: "var(--c-texSec)" }}
                >
                  <Building2 className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
                  <span className="text-sm">Manage organisations</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User actions row */}
          <div className="flex items-center justify-around pt-1">
            <Link
              to="/dashboard/profile"
              className={`nav-item w-8 h-8 p-0 justify-center ${isActive("/dashboard/profile") ? "active" : ""}`}
              title="Profile"
              activeProps={{ className: "active" }}
            >
              <User className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            </Link>

            <Link
              to="/dashboard/settings"
              className={`nav-item w-8 h-8 p-0 justify-center ${isActive("/dashboard/settings") ? "active" : ""}`}
              title="Settings"
              activeProps={{ className: "active" }}
            >
              <Settings className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            </Link>

            <Button
              onClick={toggleTheme}
              className="nav-item w-8 h-8 p-0 justify-center"
              title={state.theme === "light" ? "Dark mode" : "Light mode"}
            >
              {state.theme === "light"
                ? <Moon className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
                : <Sun className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
              }
            </Button>

            <Button
              onClick={logout}
              className="nav-item w-8 h-8 p-0 justify-center"
              title="Log out"
            >
              <LogOut className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            </Button>
          </div>
        </div>
      ) : (
        /* Collapsed view - just icons */
        <div
          className="px-2 py-3 space-y-2"
          style={{ borderTop: "1px solid var(--c-borPri)" }}
        >
          <Button className="nav-item w-full justify-center p-0 h-8">
            <Avatar className="w-5 h-5">
              <AvatarFallback
                className="text-[8px]"
                style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
              >
                {orgInitials}
              </AvatarFallback>
            </Avatar>
          </Button>

          <Link
            to="/dashboard/profile"
            className={`nav-item w-full justify-center p-0 h-8 ${isActive("/dashboard/profile") ? "active" : ""}`}
            title="Profile"
            activeProps={{ className: "active" }}
          >
            <User className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
          </Link>

          <Link
            to="/dashboard/settings"
            className={`nav-item w-full justify-center p-0 h-8 ${isActive("/dashboard/settings") ? "active" : ""}`}
            title="Settings"
            activeProps={{ className: "active" }}
          >
            <Settings className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
          </Link>

          <Button
            onClick={toggleTheme}
            className="nav-item w-full justify-center p-0 h-8"
            title={state.theme === "light" ? "Dark mode" : "Light mode"}
          >
            {state.theme === "light"
              ? <Moon className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
              : <Sun className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
            }
          </Button>

          <Button
            onClick={logout}
            className="nav-item w-full justify-center p-0 h-8"
            title="Log out"
          >
            <LogOut className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
          </Button>
        </div>
      )}
    </aside>
  );
}