import { AppLayout } from "../../../components/layout/dashboard/AppLayout";
import { useStore, actions } from "../../../lib/store";
import { useTheme } from "../../../lib/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSelector } from "@/components/features/settings/ThemeSelector";
import { ExportButton } from "@/components/features/settings/ExportButton";
import { ImportButton } from "@/components/features/settings/ImportButton";
import { ImportReport } from "@/components/features/settings/ImportReport";
import { ClearCompletedButton } from "@/components/features/settings/ClearCompletedButton";
import { AboutStats } from "@/components/features/settings/AboutStats";
import { useExportTodos, useImportTodos } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/lib/hooks/use-toast";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const completedCount = state.tasks.filter(t => t.status === "done").length;

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        {/* Hidden file input for import */}
        <Input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Appearance Section */}
        <Card style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--c-texPri)" }}>Appearance</CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>Choose your theme preference</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector currentTheme={state.theme} onThemeChange={handleThemeChange} />
          </CardContent>
        </Card>

        {/* Data Section */}
        <Card style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--c-texPri)" }}>Data Management</CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>
              Export your data or clear completed tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ExportButton onExport={handleExport} disabled={!activeOrg} />
            <ImportButton onImport={handleImportClick} disabled={!activeOrg} />
            <ImportReport report={importResult} />
            <ClearCompletedButton onClear={handleClearCompleted} completedCount={completedCount} />
          </CardContent>
        </Card>

        {/* About Section */}
        <Card style={{ backgroundColor: "var(--c-bacEle)", borderColor: "var(--c-borPri)" }}>
          <CardHeader>
            <CardTitle className="text-base" style={{ color: "var(--c-texPri)" }}>About</CardTitle>
            <CardDescription style={{ color: "var(--c-texSec)" }}>
              TaskHub version and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AboutStats 
              taskCount={state.tasks.length} 
              projectCount={state.projects.length} 
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}