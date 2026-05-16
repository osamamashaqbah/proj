"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

type Pkg = {
  id: string;
  tier: string;
  nameEn: string;
  nameAr: string;
  feePercent: number;
  minFeeCents: number;
};

type Method = { key: string; labelEn: string; labelAr: string };

export function BuyForm(props: {
  listingId: string;
  priceCents: number;
  currency: string;
  packages: Pkg[];
  paymentMethods: Method[];
  locale: string;
  t: {
    buyDirect: string;
    buyWithGuarantee: string;
    selectGuarantee: string;
    feeLabel: string;
    subtotal: string;
    guaranteeFee: string;
    total: string;
    submit: string;
    none: string;
  };
}) {
  const router = useRouter();
  const [pkgId, setPkgId] = useState<string>("");
  const [method, setMethod] = useState<string>(props.paymentMethods[0]?.key ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pkg = props.packages.find((p) => p.id === pkgId);
  const fee = useMemo(() => {
    if (!pkg) return 0;
    return Math.max(pkg.minFeeCents, Math.round((props.priceCents * pkg.feePercent) / 100));
  }, [pkg, props.priceCents]);
  const total = props.priceCents + fee;

  const submit = async () => {
    setSubmitting(true);
    setErr(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        listingId: props.listingId,
        guaranteePackageId: pkgId || null,
        paymentMethod: method,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok || !data.ok) {
      setErr(data.error ?? "Error");
      return;
    }
    router.push(`/orders`);
  };

  return (
    <div className="card space-y-3">
      <div>
        <label className="text-sm muted block mb-1">{props.t.selectGuarantee}</label>
        <select
          className="input"
          value={pkgId}
          onChange={(e) => setPkgId(e.target.value)}
        >
          <option value="">{props.t.buyDirect}</option>
          {props.packages.map((p) => (
            <option key={p.id} value={p.id}>
              {props.locale === "ar" ? p.nameAr : p.nameEn} ({p.feePercent}%)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm muted block mb-1">Payment</label>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {props.paymentMethods.map((m) => (
            <option key={m.key} value={m.key}>
              {props.locale === "ar" ? m.labelAr : m.labelEn}
            </option>
          ))}
        </select>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="muted">{props.t.subtotal}</span>
          <span>{formatPrice(props.priceCents, props.currency, props.locale)}</span>
        </div>
        <div className="flex justify-between">
          <span className="muted">{props.t.guaranteeFee}</span>
          <span>{formatPrice(fee, props.currency, props.locale)}</span>
        </div>
        <div className="flex justify-between font-semibold text-silver-bright pt-1 border-t border-purple-800/30">
          <span>{props.t.total}</span>
          <span>{formatPrice(total, props.currency, props.locale)}</span>
        </div>
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button onClick={submit} disabled={submitting} className="btn-primary w-full">
        {submitting ? "..." : props.t.submit}
      </button>
    </div>
  );
}
