"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteListingButton({
  id,
  label,
  confirmLabel,
}: {
  id: string;
  label: string;
  confirmLabel: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      className="btn-danger"
      disabled={pending}
      onClick={async () => {
        if (!confirm(confirmLabel)) return;
        setPending(true);
        await fetch(`/api/listings/${id}`, { method: "DELETE" });
        setPending(false);
        router.refresh();
      }}
    >
      {label}
    </button>
  );
}
