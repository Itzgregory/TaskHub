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


const STEP_COMPONENTS = [ProfileStep, WorkspaceStep, PreferencesStep];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [profileName, setProfileName] = useState("Alex Johnson");
  const [timezone, setTimezone] = useState("");
  const [selectedRole, setSelectedRole] = useState("personal");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const navigate = useNavigate();

  const isLast = step === ONBOARDING_STEPS.length - 1;
  const StepComp = STEP_COMPONENTS[step];

  const handleContinue = () => {
    if (isLast) {
      navigate({ to: "/dashboard/today" });
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
          className="flex items-center gap-2"
          style={{ backgroundColor: "var(--c-bluBacAccPri)", color: "#fff" }}
        >
          {isLast ? "Go to TaskHub" : "Continue"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </OnboardingLayout>
  );
}