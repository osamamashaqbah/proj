"use client";

import { useState } from "react";

export function CreateStaffForm({
  labels,
}: {
  labels: {
    email: string;
    name: string;
    password: string;
    role: string;
    submit: string;
    created: string;
    generic: string;
  };
}) {
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
      setErr(data.error ?? labels.generic);
      return;
    }
    setDone(true);
    setEmail(""); setName(""); setPassword("");
  };

  return (
    <form className="card space-y-3" onSubmit={submit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.email}</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.name}</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.password}</label>
        <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.role}</label>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      {done && <div className="text-emerald-300 text-sm">{labels.created}</div>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : labels.submit}</button>
    </form>
  );
}
