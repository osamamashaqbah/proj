"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PaymentMethodRow({ m }: { m: any }) {
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
      <td>{m.key}</td>
      <td>{m.labelEn}</td>
      <td>{m.labelAr}</td>
      <td>
        <button className={m.enabled ? "badge-success" : "badge-danger"} disabled={pending} onClick={toggle}>
          {m.enabled ? "Enabled" : "Disabled"}
        </button>
      </td>
    </tr>
  );
}
