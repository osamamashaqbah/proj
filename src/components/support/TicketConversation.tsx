"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  body: string;
  isStaff: boolean;
  createdAt: string;
  authorId: string;
  authorName: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  authorId: string;
  authorEmail: string;
  authorName: string | null;
  assigneeEmail: string | null;
  createdAt: string;
  messages: Message[];
};

const STATUS_BADGE: Record<string, string> = {
  OPEN: "badge-warning",
  IN_PROGRESS: "badge-cyan",
  RESOLVED: "badge-success",
  CLOSED: "badge-neutral",
};

export function TicketConversation({
  ticket,
  currentUserId,
  isStaff,
  backHref,
  labels,
}: {
  ticket: Ticket;
  currentUserId: string;
  isStaff: boolean;
  backHref: string;
  labels: {
    statusLabels: Record<string, string>;
    you: string;
    staffReply: string;
    writeReply: string;
    send: string;
    noMessages: string;
    closeTicket: string;
    reopenTicket: string;
    markInProgress: string;
    markResolved: string;
    backToList: string;
    openedOn: string;
    closedNotice: string;
  };
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to last message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [ticket.messages.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    setErr(null);
    const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok || !data.ok) {
      setErr(data.error ?? "Error");
      return;
    }
    setBody("");
    router.refresh();
  };

  const setStatus = async (status: string) => {
    setStatusPending(true);
    await fetch(`/api/tickets/${ticket.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setStatusPending(false);
    router.refresh();
  };

  const isClosed = ticket.status === "CLOSED";
  const canReply = isStaff || (!isClosed && ticket.authorId === currentUserId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link href={backHref} className="link text-sm">← {labels.backToList}</Link>
        <span className={STATUS_BADGE[ticket.status] ?? "badge-neutral"}>
          {labels.statusLabels[ticket.status]}
        </span>
      </div>

      <div className="card">
        <h1 className="text-xl md:text-2xl font-bold text-silver-bright break-words">
          {ticket.subject}
        </h1>
        <div className="muted text-xs mt-2">
          {ticket.authorName ?? ticket.authorEmail} · {labels.openedOn}:{" "}
          {new Date(ticket.createdAt).toLocaleString()}
          {ticket.assigneeEmail && <> · 👤 {ticket.assigneeEmail}</>}
        </div>
      </div>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="card max-h-[60vh] overflow-y-auto space-y-3"
      >
        {ticket.messages.length === 0 && (
          <div className="muted text-center py-8">{labels.noMessages}</div>
        )}
        {ticket.messages.map((m) => {
          const mine = m.authorId === currentUserId;
          const align = mine ? "items-end" : "items-start";
          const bubble = m.isStaff
            ? "bg-neon-cyan/10 border-neon-cyan/40 text-silver-bright"
            : mine
              ? "bg-neon-violet/15 border-neon-violet/40 text-silver-bright"
              : "bg-bg-elevated/60 border-zinc-500/30 text-silver";
          const tag = m.isStaff ? labels.staffReply : (mine ? labels.you : (m.authorName ?? "User"));
          return (
            <div key={m.id} className={`flex flex-col ${align}`}>
              <div className={`text-[10px] uppercase tracking-wider mb-1 ${m.isStaff ? "text-neon-cyan" : "text-silver-muted"}`}>
                {tag} · {new Date(m.createdAt).toLocaleString()}
              </div>
              <div className={`max-w-[80%] rounded-lg border px-3 py-2 whitespace-pre-wrap text-sm ${bubble}`}>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      {canReply ? (
        <form onSubmit={submit} className="card space-y-3">
          <textarea
            className="input"
            rows={3}
            placeholder={labels.writeReply}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          {err && <div className="text-red-300 text-sm">{err}</div>}
          <div className="flex justify-between flex-wrap gap-2">
            <div className="flex gap-2 flex-wrap">
              {isStaff && (
                <>
                  {ticket.status !== "IN_PROGRESS" && (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={statusPending}
                      onClick={() => setStatus("IN_PROGRESS")}
                    >
                      {labels.markInProgress}
                    </button>
                  )}
                  {ticket.status !== "RESOLVED" && (
                    <button
                      type="button"
                      className="btn-cyan"
                      disabled={statusPending}
                      onClick={() => setStatus("RESOLVED")}
                    >
                      {labels.markResolved}
                    </button>
                  )}
                </>
              )}
              {!isStaff && ticket.status !== "CLOSED" && (
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={statusPending}
                  onClick={() => setStatus("CLOSED")}
                >
                  {labels.closeTicket}
                </button>
              )}
              {!isStaff && ticket.status === "CLOSED" && (
                <button
                  type="button"
                  className="btn-ghost"
                  disabled={statusPending}
                  onClick={() => setStatus("OPEN")}
                >
                  {labels.reopenTicket}
                </button>
              )}
            </div>
            <button disabled={pending} className="btn-primary">
              {pending ? "..." : labels.send}
            </button>
          </div>
        </form>
      ) : (
        <div className="card muted text-sm">{labels.closedNotice}</div>
      )}
    </div>
  );
}
