"use client";

import { useState } from "react";

export function ResetForm({ token, labels }: { token: string; labels: { password: string; submit: string } }) {
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErr(null);
    const res = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok || !data.ok) {
      setErr(data.error ?? "Error");
      return;
    }
    setDone(true);
  };

  if (done) return <div className="card">Password reset. You can log in now.</div>;

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.password}</label>
        <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : labels.submit}</button>
    </form>
  );
}
