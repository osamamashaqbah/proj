export function ComplianceBanner({ message }: { message: string }) {
  return (
    <div className="bg-yellow-500/[0.06] border-b border-yellow-500/20 text-yellow-200 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-2">
        <span className="text-yellow-400">⚠</span>
        <span className="leading-relaxed">{message}</span>
      </div>
    </div>
  );
}
