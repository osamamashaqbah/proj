"use client";

import { useState } from "react";

export function ProfileForm({
  initial,
  labels,
}: {
  initial: { name: string; locale: string };
  labels: any;
}) {
  const [name, setName] = useState(initial.name);
  const [locale, setLocale] = useState(initial.locale);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setDone(false);
    await fetch("/api/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, locale }),
    });
    await fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    setPending(false);
    setDone(true);
    location.reload();
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.name}</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.language}</label>
        <select className="input" value={locale} onChange={(e) => setLocale(e.target.value)}>
          <option value="en">{labels.en}</option>
          <option value="ar">{labels.ar}</option>
        </select>
      </div>
      {done && <div className="text-emerald-300 text-sm">{labels.saved}</div>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : labels.save}</button>
    </form>
  );
}
