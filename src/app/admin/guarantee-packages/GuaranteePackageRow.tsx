"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GuaranteePackageRow({ p }: { p: any }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [feePercent, setFeePercent] = useState(p.feePercent);
  const [minFeeCents, setMinFee] = useState(p.minFeeCents);
  const [features, setFeatures] = useState<string>((p.features ?? []).join("\n"));
  const [active, setActive] = useState<boolean>(p.isActive);

  const save = async () => {
    setPending(true);
    await fetch(`/api/admin/guarantee-packages/${p.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        feePercent: parseInt(String(feePercent), 10),
        minFeeCents: parseInt(String(minFeeCents), 10),
        features: features.split("\n").map((s) => s.trim()).filter(Boolean),
        isActive: active,
      }),
    });
    setPending(false);
    router.refresh();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-silver-bright font-semibold">{p.tier}</div>
          <div className="muted text-xs">{p.nameEn} / {p.nameAr}</div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
        </label>
      </div>
      <div className="mt-3 grid sm:grid-cols-3 gap-2">
        <label className="text-sm">
          Fee % <input className="input" type="number" value={feePercent} onChange={(e) => setFeePercent(parseInt(e.target.value, 10))} />
        </label>
        <label className="text-sm">
          Min fee (cents) <input className="input" type="number" value={minFeeCents} onChange={(e) => setMinFee(parseInt(e.target.value, 10))} />
        </label>
        <div />
      </div>
      <div className="mt-3">
        <label className="text-sm">Features (one per line)</label>
        <textarea className="input" rows={3} value={features} onChange={(e) => setFeatures(e.target.value)} />
      </div>
      <div className="mt-3 text-end">
        <button className="btn-primary" disabled={pending} onClick={save}>Save</button>
      </div>
    </div>
  );
}
