export function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-borPri)" }} />
      <span className="text-xs" style={{ color: "var(--c-texTer)" }}>
        or
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--c-borPri)" }} />
    </div>
  );
}