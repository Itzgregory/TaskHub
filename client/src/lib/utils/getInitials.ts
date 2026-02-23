/**
 * Returns up to 2 initials from a name, splitting on spaces, dots, underscores, or hyphens.
 * e.g. "john_doe" → "JD", "Alice" → "AL"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}