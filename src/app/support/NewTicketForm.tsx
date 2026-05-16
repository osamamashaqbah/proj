"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewTicketForm({
  labels,
}: {
  labels: { subject: string; message: string; submit: string; submitted: string; generic: string };
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setErr(null);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subject, body: message }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok || !data.ok) {
      setErr(data.error ?? labels.generic);
      return;
    }
    setDone(true);
    setSubject("");
    setMessage("");
    router.refresh();
    // optionally navigate to the new ticket
    if (data.data?.id) router.push(`/support/${data.data.id}`);
  };

  return (
    <form className="card space-y-3" onSubmit={onSubmit}>
      <div>
        <label className="text-sm muted block mb-1">{labels.subject}</label>
        <input className="input" required value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div>
        <label className="text-sm muted block mb-1">{labels.message}</label>
        <textarea rows={6} className="input" required value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {done && <div className="text-emerald-300 text-sm">{labels.submitted}</div>}
      {err && <div className="text-red-300 text-sm">{err}</div>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "..." : labels.submit}</button>
    </form>
  );
}
