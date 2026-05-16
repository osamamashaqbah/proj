"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ListingActions({
  id,
  approveLabel,
  rejectLabel,
  reasonPrompt,
}: {
  id: string;
  approveLabel: string;
  rejectLabel: string;
  reasonPrompt: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const act = async (action: "approve" | "reject") => {
    setPending(true);
    let reason: string | null = null;
    if (action === "reject") {
      reason = prompt(reasonPrompt) ?? null;
      if (!reason) {
        setPending(false);
        return;
      }
    }
    await fetch(`/api/listings/${id}/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setPending(false);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <button className="btn-primary" disabled={pending} onClick={() => act("approve")}>{approveLabel}</button>
      <button className="btn-danger" disabled={pending} onClick={() => act("reject")}>{rejectLabel}</button>
    </div>
  );
}
