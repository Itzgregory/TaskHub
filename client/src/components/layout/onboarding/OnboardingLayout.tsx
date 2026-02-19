import { ReactNode } from "react";
import { CheckSquare2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  stepIndicator: ReactNode;
}

export function OnboardingLayout({ children, currentStep, totalSteps, stepIndicator }: OnboardingLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 sm:py-12"
      style={{ backgroundColor: "var(--c-bacPri)" }}
    >
      {/* Card - increased max-width for large screens */}
      <Card
        className="w-full max-w-md lg:max-w-lg xl:max-w-xl border"
        style={{
          backgroundColor: "var(--c-bacEle)",
          boxShadow: "var(--c-shaMD)",
          borderColor: "var(--c-borPri)",
        }}
      >
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4">
            {/* Logo - centered on mobile, left on desktop */}
            <div className="flex justify-center ">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--c-bluBacAccPri)" }}
                >
                  <CheckSquare2 className="w-4 h-4" style={{ color: "#fff" }} />
                </div>
                <span
                  className="text-base"
                  style={{ fontFamily: "'Permanent Marker', cursive", color: "var(--c-texPri)" }}
                >
                  TaskHub
                </span>
              </div>
            </div>
            
            {/* Step indicator - centered on mobile, aligned under logo */}
            <div className="flex justify-center sm:justify-start overflow-x-auto pb-1 sm:pb-0">
              {stepIndicator}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {children}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs" style={{ color: "var(--c-texTer)" }}>
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}