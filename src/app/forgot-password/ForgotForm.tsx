"use client";

import { useState } from "react";

export function ForgotForm({ labels }: { labels: { email: string; submit: string } }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setPending(false);
    setDone(true);
  };

  if (done) return <div className="card">Check your email (or server console in dev) for the reset link.</div>;

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.email}</label>
        <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : labels.submit}</button>
    </form>
  );
}
