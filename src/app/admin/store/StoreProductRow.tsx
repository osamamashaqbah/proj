"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StoreProductRow({ p }: { p: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const patch = async (data: any) => {
    setPending(true);
    await fetch(`/api/admin/store-products/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    setPending(false);
    router.refresh();
  };
  const del = async () => {
    if (!confirm("Delete?")) return;
    setPending(true);
    await fetch(`/api/admin/store-products/${p.id}`, { method: "DELETE" });
    setPending(false);
    router.refresh();
  };
  return (
    <tr>
      <td>{p.title}</td>
      <td>{p.categoryName}</td>
      <td>{p.priceLabel}</td>
      <td>{p.stock}</td>
      <td>
        <button disabled={pending} className={p.isActive ? "badge-success" : "badge-danger"} onClick={() => patch({ isActive: !p.isActive })}>
          {p.isActive ? "Active" : "Inactive"}
        </button>
      </td>
      <td><button className="btn-danger" disabled={pending} onClick={del}>Delete</button></td>
    </tr>
  );
}
