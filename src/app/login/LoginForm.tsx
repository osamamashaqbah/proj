"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm({
  callbackUrl,
  labels,
}: {
  callbackUrl?: string;
  labels: {
    email: string;
    password: string;
    login: string;
    google: string;
    forgot: string;
    noAccount: string;
    register: string;
    or: string;
    invalid: string;
  };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErr(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl ?? "/",
    });
    setPending(false);
    if (!res || res.error) {
      setErr(labels.invalid);
      return;
    }
    // Decide a smart redirect through a thin endpoint
    const r = await fetch("/api/auth/me");
    const data = await r.json();
    const role = data?.data?.roles?.[0] ?? "USER";
    const target =
      callbackUrl ??
      (role === "ADMIN" ? "/admin" : role === "EMPLOYEE" ? "/employee" : "/dashboard");
    window.location.href = target;
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.email}</label>
        <input
          type="email"
          required
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.password}</label>
        <input
          type="password"
          required
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? "..." : labels.login}
      </button>
      <button
        type="button"
        className="btn-secondary w-full"
        onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/" })}
      >
        {labels.google}
      </button>
      <div className="flex items-center justify-between text-sm">
        <Link className="link" href="/forgot-password">
          {labels.forgot}
        </Link>
        <span className="muted">
          {labels.noAccount}{" "}
          <Link className="link" href="/register">
            {labels.register}
          </Link>
        </span>
      </div>
    </form>
  );
}
