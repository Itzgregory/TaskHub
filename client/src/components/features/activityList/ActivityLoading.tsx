export function ActivityLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: "var(--c-bluTexAccPri)", borderTopColor: "transparent" }} />
    </div>
  );
}