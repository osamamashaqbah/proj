export function ComplianceBanner({ message }: { message: string }) {
  return (
    <div className="bg-yellow-500/5 border-b border-yellow-500/20 text-yellow-200 text-xs">
      <div className="mx-auto max-w-7xl px-4 py-2">{message}</div>
    </div>
  );
}
