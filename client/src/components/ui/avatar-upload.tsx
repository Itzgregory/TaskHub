import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface AvatarUploadProps {
  /**
   * Initial avatar URL or base64 string
   */
  initialImage?: string;
  /**
   * Initial name for fallback initials
   */
  name?: string;
  /**
   * Callback when image changes
   */
  onImageChange?: (file: File | null, previewUrl: string | null) => void;
  /**
   * Maximum file size in MB
   */
  maxSizeMB?: number;
  /**
   * Allowed file types
   */
  allowedTypes?: string[];
  /**
   * Size of the avatar in pixels
   */
  size?: number;
  /**
   * Whether the component is disabled
   */
  disabled?: boolean;
}

export function AvatarUpload({
  initialImage,
  name = "User",
  onImageChange,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  size = 80,
  disabled = false,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImage || null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== initialImage && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialImage]);

  // Get initials from name for fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File type not supported. Please upload: ${allowedTypes.join(", ")}`);
      return;
    }

    // Clean up old preview URL if it was from a previous upload
    if (previewUrl && previewUrl !== initialImage && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onImageChange?.(file, url);
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl !== initialImage && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onImageChange?.(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative cursor-pointer group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
        style={{ width: size, height: size }}
      >
        <Avatar
          className="w-full h-full border-2 transition-all group-hover:opacity-90"
          style={{
            borderColor: isHovering ? "var(--c-bluBacAccPri)" : "transparent",
            width: size,
            height: size,
          }}
        >
          {previewUrl ? (
            <AvatarImage src={previewUrl} alt={name} className="object-cover" />
          ) : (
            <AvatarFallback
              style={{
                backgroundColor: "var(--c-bluBacSec)",
                color: "var(--c-bluTexAccPri)",
                fontSize: size * 0.4,
                fontWeight: 600,
              }}
            >
              {getInitials(name)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Upload overlay on hover */}
        {isHovering && !disabled && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span className="text-xs font-medium text-white">Upload</span>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="text-xs h-auto p-0"
          style={{ color: "var(--c-bluTexAccPri)" }}
          onClick={handleClick}
          disabled={disabled}
        >
          {previewUrl ? "Change photo" : "Upload photo"}
        </Button>

        {previewUrl && (
          <>
            <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
              •
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-xs h-auto p-0"
              style={{ color: "var(--c-texTer)" }}
              onClick={handleRemove}
              disabled={disabled}
            >
              Remove
            </Button>
          </>
        )}
      </div>
    </div>
  );
}