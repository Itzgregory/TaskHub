import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeSelectorProps {
  currentTheme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div className="flex gap-3">
      {(["light", "dark"] as const).map((theme) => {
        const isActive = currentTheme === theme;
        return (
          <Button
            key={theme}
            variant="outline"
            onClick={() => onThemeChange(theme)}
            className="flex-1 flex items-center justify-center gap-2 h-auto py-4"
            style={{
              backgroundColor: isActive ? "var(--c-bluBacAccPri)" : "var(--c-bacSec)",
              borderColor: isActive ? "var(--c-bluBacAccPri)" : "var(--c-borPri)",
              color: isActive ? "#fff" : "var(--c-texSec)",
            }}
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </Button>
        );
      })}
    </div>
  );
}