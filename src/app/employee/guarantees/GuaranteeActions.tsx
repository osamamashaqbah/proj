"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GuaranteeActions({
  id,
  labels,
}: {
  id: string;
  labels: { holdEscrow: string; release: string; refund: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const act = async (status: string) => {
    setPending(true);
    await fetch(`/api/guarantee-requests/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending(false);
    router.refresh();
  };
  return (
    <div className="flex gap-2 flex-wrap">
      <button className="btn-secondary" disabled={pending} onClick={() => act("HELD_IN_ESCROW")}>{labels.holdEscrow}</button>
      <button className="btn-primary" disabled={pending} onClick={() => act("RELEASED")}>{labels.release}</button>
      <button className="btn-danger" disabled={pending} onClick={() => act("REFUNDED")}>{labels.refund}</button>
    </div>
  );
}
