"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["PENDING_PAYMENT", "PAID", "IN_ESCROW", "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED", "DISPUTED"];

export function OrderRow({
  o,
  statusLabels,
}: {
  o: any;
  statusLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string>(o.status);

  const save = async (next: string) => {
    setPending(true);
    await fetch(`/api/admin/orders/${o.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setStatus(next);
    setPending(false);
    router.refresh();
  };

  return (
    <tr>
      <td className="font-mono text-xs">#{o.id.slice(-8)}</td>
      <td>{o.buyer}</td>
      <td><span className="badge-purple">{o.sourceLabel}</span></td>
      <td>{o.total}</td>
      <td>
        <span className="badge-silver">{statusLabels[status] ?? status}</span>
        {o.hasGuarantee && <span className="badge-cyan ms-1">G</span>}
      </td>
      <td>
        <select className="input" disabled={pending} value={status} onChange={(e) => save(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s] ?? s}</option>)}
        </select>
      </td>
    </tr>
  );
}
