import { ListingStatus } from "@prisma/client";

export function StatusBadge({
  status,
  labels,
}: {
  status: ListingStatus | string;
  labels: Record<string, string>;
}) {
  const map: Record<string, string> = {
    PENDING: "badge-warning",
    APPROVED: "badge-success",
    REJECTED: "badge-danger",
    SOLD: "badge-neutral",
    REMOVED: "badge-neutral",
  };
  const klass = map[status] ?? "badge-neutral";
  return <span className={klass}>{labels[status] ?? status}</span>;
}

export function OfficialBadge({ label }: { label: string }) {
  return <span className="badge-purple">★ {label}</span>;
}

export function GuaranteedBadge({ label }: { label: string }) {
  return <span className="badge-purple">✓ {label}</span>;
}

export function ComplianceRiskBadge({ label }: { label: string }) {
  return <span className="badge-warning">⚠ {label}</span>;
}
