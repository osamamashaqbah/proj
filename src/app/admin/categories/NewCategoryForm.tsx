"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewCategoryForm({
  labels,
}: {
  labels: {
    slug: string;
    nameEn: string;
    nameAr: string;
    kind: string;
    risk: string;
    add: string;
  };
}) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [kind, setKind] = useState("OTHER");
  const [riskWarning, setRisk] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, nameEn, nameAr, kind, riskWarning }),
    });
    setPending(false);
    setSlug(""); setNameEn(""); setNameAr(""); setRisk(false);
    router.refresh();
  };

  return (
    <form className="card grid grid-cols-2 md:grid-cols-6 gap-2" onSubmit={submit}>
      <input className="input" placeholder={labels.slug} value={slug} onChange={(e) => setSlug(e.target.value)} required />
      <input className="input" placeholder={labels.nameEn} value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
      <input className="input" placeholder={labels.nameAr} value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
      <select className="input" value={kind} onChange={(e) => setKind(e.target.value)} title={labels.kind}>
        {["USED_GAMES", "ACCOUNTS", "SUBSCRIPTIONS", "DIGITAL_ITEMS", "SERVICES", "OTHER"].map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={riskWarning} onChange={(e) => setRisk(e.target.checked)} /> {labels.risk}
      </label>
      <button disabled={pending} className="btn-primary">{labels.add}</button>
    </form>
  );
}
