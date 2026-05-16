"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const BADGES: Record<string, string> = {
  STRIPE: "badge-pink",
  PAYPAL: "badge-cyan",
  MYFATOORAH: "badge-purple",
  MANUAL: "badge-silver",
};

export function PaymentMethodRow({
  m,
  labels,
}: {
  m: any;
  labels: { enabled: string; disabled: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const toggle = async () => {
    setPending(true);
    await fetch(`/api/admin/payment-methods/${m.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: !m.enabled }),
    });
    setPending(false);
    router.refresh();
  };
  return (
    <tr>
      <td className="font-mono text-xs text-silver-muted">{m.key}</td>
      <td>{m.labelEn}</td>
      <td>{m.labelAr}</td>
      <td><span className={BADGES[m.provider] ?? "badge-silver"}>{m.provider}</span></td>
      <td>
        <button className={m.enabled ? "badge-success" : "badge-danger"} disabled={pending} onClick={toggle}>
          {m.enabled ? labels.enabled : labels.disabled}
        </button>
      </td>
    </tr>
  );
}
