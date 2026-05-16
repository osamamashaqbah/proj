"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RolePerms({
  role,
  allPerms,
}: {
  role: { id: string; name: string; isSystem: boolean; perms: string[] };
  allPerms: string[];
}) {
  const router = useRouter();
  const [perms, setPerms] = useState<string[]>(role.perms);
  const [pending, setPending] = useState(false);

  const toggle = (key: string) => {
    setPerms((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));
  };

  const save = async () => {
    setPending(true);
    await fetch(`/api/admin/roles/${role.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ permissions: perms }),
    });
    setPending(false);
    router.refresh();
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-silver-bright font-semibold">{role.name}</div>
          {role.isSystem && <div className="text-xs muted">system role</div>}
        </div>
        <button className="btn-primary" onClick={save} disabled={pending}>Save</button>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 text-sm">
        {allPerms.map((p) => (
          <label key={p} className="flex items-center gap-2">
            <input type="checkbox" checked={perms.includes(p)} onChange={() => toggle(p)} />
            <span className="text-silver">{p}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
