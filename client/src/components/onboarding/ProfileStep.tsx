import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { TIMEZONES } from "@/lib/constants/onboarding";

interface ProfileStepProps {
  name?: string;
  onNameChange?: (name: string) => void;
  username?: string;
  onUsernameChange?: (username: string) => void;
  timezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  onAvatarChange?: (file: File | null, previewUrl: string | null) => void;
  avatarUrl?: string;
}

export function ProfileStep({ 
  name = "", 
  onNameChange,
  username = "",
  onUsernameChange,
  timezone,
  onTimezoneChange,
  onAvatarChange,
  avatarUrl,
}: ProfileStepProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold" style={{ color: "var(--c-texPri)" }}>
          Tell us about yourself
        </h2>
        <p className="text-sm" style={{ color: "var(--c-texSec)" }}>
          Personalise your TaskHub experience
        </p>
      </div>

      {/* Avatar upload - standalone component */}
      <AvatarUpload
        initialImage={avatarUrl}
        name={name}
        onImageChange={onAvatarChange}
        size={80}
        maxSizeMB={5}
        allowedTypes={["image/jpeg", "image/png", "image/gif", "image/webp"]}
      />

      {/* Form fields */}
      <div className="space-y-4">
        {/* Display name */}
        <div className="space-y-1.5">
          <Label htmlFor="display-name" style={{ color: "var(--c-texPri)" }}>
            Display name *
          </Label>
          <Input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => onNameChange?.(e.target.value)}
            className="w-full"
            required
            style={{
              backgroundColor: "var(--c-bacSec)",
              borderColor: "var(--c-borPri)",
              color: "var(--c-texPri)",
            }}
          />
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username" style={{ color: "var(--c-texPri)" }}>
            Username *
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange?.(e.target.value)}
            placeholder="username"
            className="w-full"
            required
            minLength={3}
            maxLength={50}
            style={{
              backgroundColor: "var(--c-bacSec)",
              borderColor: "var(--c-borPri)",
              color: "var(--c-texPri)",
            }}
          />
        </div>

        {/* Timezone select */}
        <div className="space-y-1.5">
          <Label htmlFor="timezone" style={{ color: "var(--c-texPri)" }}>
            Timezone
          </Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger
              id="timezone"
              style={{
                backgroundColor: "var(--c-bacSec)",
                borderColor: "var(--c-borPri)",
                color: "var(--c-texPri)",
              }}
            >
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent
              style={{
                backgroundColor: "var(--c-bacPri)",
                borderColor: "var(--c-borPri)",
              }}
            >
              {TIMEZONES.map((tz) => (
                <SelectItem 
                  key={tz} 
                  value={tz}
                  style={{
                    color: "var(--c-texPri)",
                    backgroundColor: "var(--c-bacPri)",
                  }}
                  className="cursor-pointer hover:bg-[var(--c-bacTer)] focus:bg-[var(--c-bacTer)] data-[highlighted]:bg-[var(--c-bacTer)]"
                >
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}