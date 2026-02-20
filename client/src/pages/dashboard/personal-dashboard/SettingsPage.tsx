import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { useStore, actions } from "../../../lib/store";
import { useTheme } from "../../../lib/theme-provider";
import { Sun, Moon, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useExportTodos, useImportTodos } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useRef, useState } from "react";

export default function SettingsPage() {
  const { state, dispatch } = useStore();
  const { setTheme: setThemeProvider } = useTheme();
  const { activeOrg } = useAuth();
  const { toast } = useToast();
  const exportMutation = useExportTodos();
  const importMutation = useImportTodos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{ acceptedCount: number; rejectedCount: number; rejectedRows?: Array<{ rowIndex: number; errors: string[] }> } | null>(null);

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

  const handleExport = async () => {
    if (!activeOrg?.orgId) return;
    try {
      const blob = await exportMutation.mutateAsync({ orgId: activeOrg.orgId, format: "json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taskhub-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: "Your todos have been downloaded." });
    } catch {
      toast({ title: "Export failed", description: "Could not export todos.", variant: "destructive" });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeOrg?.orgId) return;

    try {
      const text = await file.text();
      const result = await importMutation.mutateAsync({ orgId: activeOrg.orgId, format: "json", content: text });
      setImportResult(result.report);
      toast({
        title: "Import complete",
        description: `${result.report.acceptedCount} imported, ${result.report.rejectedCount} rejected.`,
      });
    } catch {
      toast({ title: "Import failed", description: "Could not parse or import the file.", variant: "destructive" });
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
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

            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelected}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={handleImportClick}
              disabled={!activeOrg}
              className="w-full flex items-center justify-start gap-3 h-auto py-3 px-4"
              style={{
                borderColor: "var(--c-borPri)",
                backgroundColor: "var(--c-bacSec)",
                color: "var(--c-texPri)",
                opacity: activeOrg ? 1 : 0.5,
              }}
            >
              <Upload className="w-4 h-4" style={{ color: "var(--c-texTer)" }} />
              <div className="text-left">
                <div className="text-sm font-medium">Import Data</div>
                <div className="text-xs" style={{ color: "var(--c-texTer)" }}>
                  Upload a JSON or CSV file to import tasks
                </div>
              </div>
            </Button>

            {/* Import rejection report */}
            {importResult && importResult.rejectedCount > 0 && (
              <div
                className="rounded-xl p-4 space-y-2"
                style={{
                  backgroundColor: "var(--c-yelBacSec)",
                  border: "1px solid var(--c-yelBorPri)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--c-yelTexAccPri)" }}>
                  {importResult.rejectedCount} row(s) rejected
                </p>
                {importResult.rejectedRows?.map((row) => (
                  <div key={row.rowIndex} className="text-xs" style={{ color: "var(--c-texSec)" }}>
                    <span className="font-mono font-semibold">Row {row.rowIndex + 1}:</span>{" "}
                    {row.errors.join(", ")}
                  </div>
                ))}
              </div>
            )}

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