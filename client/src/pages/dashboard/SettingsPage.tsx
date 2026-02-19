import { AppLayout } from "../../components/layout/dashboard/AppLayout";
import { useStore, actions } from "../../lib/store";
import { useTheme } from "../../lib/theme-provider";
import { Sun, Moon, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const { setTheme: setThemeProvider } = useTheme();

  const handleThemeChange = (newTheme: "light" | "dark") => {
    // Update both theme systems
    dispatch(actions.setTheme(newTheme));
    setThemeProvider(newTheme);
  };

  const handleClearCompleted = () => {
    if (confirm("Clear all completed tasks?")) {
      state.tasks
        .filter(t => t.status === "done")
        .forEach(t => dispatch(actions.deleteTask(t.id)));
    }
  };

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "taskhub-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const completedCount = state.tasks.filter(t => t.status === "done").length;

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Appearance Section */}
        <Card
          style={{
            backgroundColor: "var(--c-bacEle)",
            borderColor: "var(--c-borPri)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--c-texPri)" }}>
              Appearance
            </CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>
              Choose your theme preference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {(["light", "dark"] as const).map((t) => {
                const isActive = state.theme === t;
                return (
                  <Button
                    key={t}
                    variant="outline" // Always use outline, let our styles override
                    onClick={() => handleThemeChange(t)}
                    className="flex-1 flex items-center justify-center gap-2 h-auto py-4"
                    style={{
                      backgroundColor: isActive ? "var(--c-bluBacAccPri)" : "var(--c-bacSec)",
                      borderColor: isActive ? "var(--c-bluBacAccPri)" : "var(--c-borPri)",
                      color: isActive ? "#fff" : "var(--c-texSec)",
                    }}
                  >
                    {t === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Section */}
        <Card
          style={{
            backgroundColor: "var(--c-bacEle)",
            borderColor: "var(--c-borPri)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--c-texPri)" }}>
              Data Management
            </CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>
              Export your data or clear completed tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="w-full flex items-center justify-start gap-3 h-auto py-3 px-4"
              style={{
                borderColor: "var(--c-borPri)",
                backgroundColor: "var(--c-bacSec)",
                color: "var(--c-texPri)",
              }}
            >
              <Download className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
              <div className="text-left">
                <div className="text-sm font-medium">Export Data</div>
                <div className="text-xs" style={{ color: "var(--c-texTer)" }}>
                  Download all tasks as JSON
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={handleClearCompleted}
              className="w-full flex items-center justify-start gap-3 h-auto py-3 px-4"
              style={{
                borderColor: "var(--c-borPri)",
                backgroundColor: "var(--c-bacSec)",
                color: "var(--c-texPri)",
              }}
              disabled={completedCount === 0}
              onMouseEnter={(e) => {
                if (!completedCount) return;
                e.currentTarget.style.backgroundColor = "var(--c-redBacSec)";
                e.currentTarget.style.borderColor = "var(--c-redBorPri)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--c-bacSec)";
                e.currentTarget.style.borderColor = "var(--c-borPri)";
              }}
            >
              <Trash2 className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
              <div className="text-left">
                <div className="text-sm font-medium">Clear Completed Tasks</div>
                <div className="text-xs" style={{ color: "var(--c-texTer)" }}>
                  {completedCount === 0 
                    ? "No completed tasks" 
                    : `Remove ${completedCount} completed task(s)`}
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card
          style={{
            backgroundColor: "var(--c-bacEle)",
            borderColor: "var(--c-borPri)",
          }}
        >
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--c-texPri)" }}>
              About
            </CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>
              TaskHub version and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="rounded-xl p-4 space-y-2"
              style={{
                backgroundColor: "var(--c-bacSec)",
                border: "1px solid var(--c-borPri)",
              }}
            >
              {[
                { label: "Version", value: "1.0.0" },
                { label: "Tasks", value: String(state.tasks.length) },
                { label: "Projects", value: String(state.projects.length) },
              ].map(({ label, value }, index) => (
                <div key={label}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--c-texTer)" }}>{label}</span>
                    <span className="font-mono" style={{ color: "var(--c-texSec)" }}>
                      {value}
                    </span>
                  </div>
                  {index < 2 && (
                    <Separator
                      className="my-2"
                      style={{ backgroundColor: "var(--c-borSec)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}