"use client";

import { useState } from "react";

export function CreateStaffForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"EMPLOYEE" | "ADMIN">("EMPLOYEE");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErr(null);
    setDone(false);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name, password, role }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok || !data.ok) {
      setErr(data.error ?? "Error");
      return;
    }
    setDone(true);
    setEmail(""); setName(""); setPassword("");
  };

  return (
    <form className="card space-y-3" onSubmit={submit}>
      <input className="input" placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="input" placeholder="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
        <option value="EMPLOYEE">EMPLOYEE</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      {done && <div className="text-emerald-300 text-sm">Created.</div>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : "Create"}</button>
    </form>
  );
}
