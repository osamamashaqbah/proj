"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";

export function UserMenu({
  name,
  dashPath,
  t,
}: {
  name: string;
  dashPath: string;
  t: { dashboard: string; profile: string; orders: string; myListings: string; logout: string };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary"
      >
        {name}
      </button>
      {open && (
        <div
          className="absolute end-0 mt-2 w-56 rounded-md border border-purple-800/40 bg-bg-card shadow-glow-soft"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="py-1 text-sm">
            <Link className="block px-3 py-2 hover:bg-bg-elevated" href={dashPath}>
              {t.dashboard}
            </Link>
            <Link className="block px-3 py-2 hover:bg-bg-elevated" href="/profile">
              {t.profile}
            </Link>
            <Link className="block px-3 py-2 hover:bg-bg-elevated" href="/orders">
              {t.orders}
            </Link>
            <Link className="block px-3 py-2 hover:bg-bg-elevated" href="/my-listings">
              {t.myListings}
            </Link>
            <button
              className="block w-full text-start px-3 py-2 hover:bg-bg-elevated text-red-300"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              {t.logout}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
