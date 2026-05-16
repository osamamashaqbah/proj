"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

export function UserMenu({
  name,
  dashPath,
  t,
}: {
  name: string;
  dashPath: string;
  t: { dashboard: string; profile: string; orders: string; myListings: string; support: string; logout: string };
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = (name?.[0] ?? "?").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-neon-violet/40 bg-bg-card/60 px-2 py-1.5 hover:border-neon-pink/60 transition"
      >
        <span className="grid place-items-center h-7 w-7 rounded-md bg-neon-gradient text-white font-bold text-sm shadow-glow-soft">
          {initial}
        </span>
        <span className="hidden sm:inline text-sm text-silver-bright max-w-[120px] truncate">
          {name}
        </span>
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-56 rounded-md border border-neon-violet/40 bg-bg-card/95 backdrop-blur-md shadow-glow z-50">
          <div className="py-1 text-sm">
            <Link className="block px-3 py-2 hover:bg-neon-violet/10 hover:text-neon-pink transition" href={dashPath} onClick={() => setOpen(false)}>
              {t.dashboard}
            </Link>
            <Link className="block px-3 py-2 hover:bg-neon-violet/10 hover:text-neon-pink transition" href="/profile" onClick={() => setOpen(false)}>
              {t.profile}
            </Link>
            <Link className="block px-3 py-2 hover:bg-neon-violet/10 hover:text-neon-pink transition" href="/orders" onClick={() => setOpen(false)}>
              {t.orders}
            </Link>
            <Link className="block px-3 py-2 hover:bg-neon-violet/10 hover:text-neon-pink transition" href="/my-listings" onClick={() => setOpen(false)}>
              {t.myListings}
            </Link>
            <Link className="block px-3 py-2 hover:bg-neon-violet/10 hover:text-neon-pink transition" href="/support" onClick={() => setOpen(false)}>
              {t.support}
            </Link>
            <div className="my-1 border-t border-neon-violet/20" />
            <button
              className="block w-full text-start px-3 py-2 hover:bg-red-500/10 text-red-300 transition"
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
