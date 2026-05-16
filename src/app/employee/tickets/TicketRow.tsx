"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TicketRow({ ticket }: { ticket: { id: string; subject: string; body: string; status: string; authorEmail: string } }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const update = async (status: string) => {
    setPending(true);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPending(false);
    router.refresh();
  };
  return (
    <>
      <tr>
        <td>
          <button className="link" onClick={() => setOpen((o) => !o)}>{ticket.subject}</button>
        </td>
        <td>{ticket.authorEmail}</td>
        <td><span className="badge-silver">{ticket.status}</span></td>
        <td className="flex gap-2">
          <button className="btn-secondary" disabled={pending} onClick={() => update("IN_PROGRESS")}>In progress</button>
          <button className="btn-primary" disabled={pending} onClick={() => update("RESOLVED")}>Resolve</button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={4} className="muted whitespace-pre-wrap">{ticket.body}</td>
        </tr>
      )}
    </>
  );
}
