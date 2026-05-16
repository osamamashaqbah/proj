"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function RegisterForm({ labels }: { labels: any }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password !== confirm) return setErr(labels.mismatch);
    if (password.length < 8 || !/\d/.test(password)) return setErr(labels.weak);
    setPending(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setPending(false);
      setErr(res.status === 409 ? labels.exists : data.error ?? labels.generic);
      return;
    }
    await signIn("credentials", { email, password, redirect: false });
    window.location.href = "/dashboard";
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.name}</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.email}</label>
        <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.password}</label>
        <input type="password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.confirm}</label>
        <input type="password" required className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "..." : labels.submit}
      </button>
      <p className="text-sm muted">
        {labels.haveAccount}{" "}
        <Link href="/login" className="link">
          {labels.login}
        </Link>
      </p>
    </form>
  );
}
