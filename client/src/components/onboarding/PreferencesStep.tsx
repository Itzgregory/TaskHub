import { Palette, Bell } from "lucide-react";
import { THEMES } from "@/lib/constants/onboarding";
import { useStore, actions } from "@/lib/store";
import { useTheme } from "@/lib/theme-provider";

interface PreferencesStepProps {
  theme: string;
  onThemeChange: (theme: string) => void;
  notifications: boolean;
  onNotificationsChange: (enabled: boolean) => void;
}

export function PreferencesStep({
  theme,
  onThemeChange,
  notifications,
  onNotificationsChange,
}: PreferencesStepProps) {
  const { dispatch } = useStore();
  const { setTheme: setThemeProvider } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    // Update both theme systems
    onThemeChange(newTheme);
    dispatch(actions.setTheme(newTheme as "light" | "dark"));
    setThemeProvider(newTheme as "light" | "dark" | "system");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--c-texPri)" }}>
          Customise your experience
        </h2>
        <p className="text-sm" style={{ color: "var(--c-texSec)" }}>
          You can always change these later in Settings
        </p>
      </div>

      {/* Theme */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: "var(--c-icoSec)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--c-texPri)" }}>
            Theme
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleThemeChange(t.id)}
              className="flex-1 h-9 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
              style={{
                backgroundColor: theme === t.id ? "var(--c-bluBacAccPri)" : "var(--c-bacSec)",
                color: theme === t.id ? "#fff" : "var(--c-texSec)",
                border: `1px solid ${theme === t.id ? "var(--c-bluBacAccPri)" : "var(--c-borPri)"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications toggle */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
        style={{ backgroundColor: "var(--c-bacSec)", border: "1px solid var(--c-borPri)" }}
      >
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 shrink-0" style={{ color: "var(--c-icoSec)" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--c-texPri)" }}>
              Daily reminders
            </p>
            <p className="text-xs" style={{ color: "var(--c-texSec)" }}>
              Get a nudge for pending tasks
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNotificationsChange(!notifications)}
          className="w-10 h-6 rounded-full transition-colors shrink-0 relative self-end sm:self-auto"
          style={{ backgroundColor: notifications ? "var(--c-bluBacAccPri)" : "var(--c-bacTer)" }}
        >
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
            style={{
              backgroundColor: "#fff",
              left: notifications ? "calc(100% - 22px)" : "2px",
              boxShadow: "var(--c-shaXS)",
            }}
          />
        </button>
      </div>

      {/* Summary */}
      <div
        className="p-4 rounded-xl space-y-2"
        style={{ backgroundColor: "var(--c-greBacSec)", border: "1px solid var(--c-greBorPri)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--c-greTexPri)" }}>
          🎉 You're all set!
        </p>
        <p className="text-xs" style={{ color: "var(--c-greTexSec)" }}>
          TaskHub will create a starter workspace with sample projects to help you get going.
        </p>
      </div>
    </div>
  );
}