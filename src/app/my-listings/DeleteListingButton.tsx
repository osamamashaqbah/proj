"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteListingButton({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <button
      className="btn-danger"
      disabled={pending}
      onClick={async () => {
        if (!confirm("Delete?")) return;
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
