"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OfficialBuyForm({
  productId,
  paymentMethods,
  locale,
  label,
  paymentLabel,
  redirecting,
}: {
  productId: string;
  paymentMethods: { key: string; labelEn: string; labelAr: string }[];
  locale: string;
  label: string;
  paymentLabel: string;
  redirecting: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState(paymentMethods[0]?.key ?? "");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setErr(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ officialStoreProductId: productId, paymentMethod: method }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setPending(false);
      setErr(data.error ?? "Error");
      return;
    }
    if (data.data?.checkoutUrl) {
      window.location.href = data.data.checkoutUrl as string;
      return;
    }
    setPending(false);
    router.push("/orders");
  };

  return (
    <div className="card space-y-3">
      <div>
        <label className="text-sm muted block mb-1">{paymentLabel}</label>
        <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
          {paymentMethods.map((m) => (
            <option key={m.key} value={m.key}>
              {locale === "ar" ? m.labelAr : m.labelEn}
            </option>
          ))}
        </select>
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button onClick={submit} disabled={pending} className="btn-primary w-full">
        {pending ? redirecting : label}
      </button>
    </div>
  );
}
