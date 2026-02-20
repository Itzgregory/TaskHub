import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS } from "@/lib/constants/onboarding";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { ProfileStep } from "@/components/onboarding/ProfileStep";
import { WorkspaceStep } from "@/components/onboarding/WorkspaceStep";
import { PreferencesStep } from "@/components/onboarding/PreferencesStep";
import { OnboardingLayout } from "@/components/layout/onboarding/OnboardingLayout";
import { useCompleteOnboarding } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

const STEP_COMPONENTS = [ProfileStep, WorkspaceStep, PreferencesStep];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [username, setUsername] = useState("");
  const [timezone, setTimezone] = useState("");
  const [selectedRole, setSelectedRole] = useState("personal");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const completeOnboardingMutation = useCompleteOnboarding();

  const isLast = step === ONBOARDING_STEPS.length - 1;
  const StepComp = STEP_COMPONENTS[step];

  const handleContinue = async () => {
    if (isLast) {
      // Complete onboarding
      if (!profileName || !username) {
        toast({
          title: "Missing information",
          description: "Please provide your name and username.",
          variant: "destructive",
        });
        return;
      }

      // Map selectedRole to backend UsageType: work=0, personal=1, student=2
      const usageTypeMap: Record<string, 0 | 1 | 2> = {
        work: 0,
        personal: 1,
        student: 2,
      };
      const resolvedTheme = theme === 'system' ? 'light' : (theme as 'light' | 'dark');

      try {
        await completeOnboardingMutation.mutateAsync({
          fullName: profileName,
          username,
          usageType: usageTypeMap[selectedRole] ?? 1,
          theme: resolvedTheme,
          notificationsEnabled: notifications,
        });

        // Update user to mark onboarding as completed
        if (user) {
          setUser({
            ...user,
            onboardingCompleted: true,
          });
        }

        navigate({ to: "/dashboard/today" });
        toast({
          title: "Welcome to TaskHub!",
          description: "Your profile has been set up successfully.",
        });
      } catch (err) {
        toast({
          title: "Setup failed",
          description: err instanceof Error ? err.message : "Failed to complete setup. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <OnboardingLayout
      currentStep={step}
      totalSteps={ONBOARDING_STEPS.length}
      stepIndicator={<StepIndicator current={step} />}
    >
      {/* Step content */}
      {step === 0 && (
        <ProfileStep
          name={profileName}
          onNameChange={setProfileName}
          username={username}
          onUsernameChange={setUsername}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
      )}
      {step === 1 && (
        <WorkspaceStep
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}
      {step === 2 && (
        <PreferencesStep
          theme={theme}
          onThemeChange={setTheme}
          notifications={notifications}
          onNotificationsChange={setNotifications}
        />
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => step > 0 && setStep((s) => s - 1)}
          disabled={step === 0}
          className="text-sm"
          style={{
            color: step === 0 ? "var(--c-texDis)" : "var(--c-texSec)",
          }}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={completeOnboardingMutation.isPending}
          className="flex items-center gap-2"
          style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
        >
          {completeOnboardingMutation.isPending
            ? "Setting up..."
            : isLast
              ? "Go to TaskHub"
              : "Continue"}
          {!completeOnboardingMutation.isPending && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </OnboardingLayout>
  );
}