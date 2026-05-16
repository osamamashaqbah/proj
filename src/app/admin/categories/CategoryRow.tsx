"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CategoryRow({
  c,
  labels,
}: {
  c: any;
  labels: { yes: string; no: string; enabled: string; disabled: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const patch = async (data: any) => {
    setPending(true);
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    setPending(false);
    router.refresh();
  };
  return (
    <tr>
      <td className="font-mono text-xs text-silver-muted">{c.slug}</td>
      <td>{c.nameEn}</td>
      <td>{c.nameAr}</td>
      <td><span className="badge-purple">{c.kind}</span></td>
      <td>
        <button className={c.riskWarning ? "badge-warning" : "badge-neutral"} onClick={() => patch({ riskWarning: !c.riskWarning })}>
          {c.riskWarning ? labels.yes : labels.no}
        </button>
      </td>
      <td>
        <button
          disabled={pending}
          className={c.enabled ? "badge-success" : "badge-danger"}
          onClick={() => patch({ enabled: !c.enabled })}
        >
          {c.enabled ? labels.enabled : labels.disabled}
        </button>
      </td>
      <td>—</td>
    </tr>
  );
}
