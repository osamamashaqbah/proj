"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserRow({
  user,
  allRoles,
}: {
  user: { id: string; email: string; name: string | null; banned: boolean; roles: string[] };
  allRoles: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [roles, setRoles] = useState<string[]>(user.roles);

  const toggleRole = async (name: string) => {
    setPending(true);
    const next = roles.includes(name) ? roles.filter((r) => r !== name) : [...roles, name];
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roles: next }),
    });
    setRoles(next);
    setPending(false);
    router.refresh();
  };

  const ban = async () => {
    setPending(true);
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ isBanned: !user.banned }),
    });
    setPending(false);
    router.refresh();
  };

  return (
    <tr>
      <td>{user.email}</td>
      <td>{user.name ?? "—"}</td>
      <td>
        <div className="flex flex-wrap gap-1">
          {allRoles.map((r) => (
            <button
              key={r.id}
              disabled={pending}
              onClick={() => toggleRole(r.name)}
              className={
                "badge cursor-pointer " +
                (roles.includes(r.name)
                  ? "border-purple-500/40 bg-purple-500/10 text-purple-200"
                  : "border-zinc-500/30 bg-zinc-500/10 text-zinc-300")
              }
            >
              {r.name}
            </button>
          ))}
        </div>
      </td>
      <td>{user.banned ? <span className="badge-danger">Banned</span> : <span className="badge-success">Active</span>}</td>
      <td>
        <button className="btn-secondary" disabled={pending} onClick={ban}>
          {user.banned ? "Unban" : "Ban"}
        </button>
      </td>
    </tr>
  );
}
