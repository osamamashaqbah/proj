"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar({
  items,
  title,
}: {
  items: { href: string; label: string }[];
  title: string;
}) {
  const path = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? path === "/admin" : path?.startsWith(href);

  return (
    <aside className="card h-fit sticky top-20">
      <div className="text-neon-pink font-display font-bold mb-3 uppercase tracking-wider text-sm">
        {title}
      </div>
      <nav className="flex flex-col gap-0.5 text-sm">
        {items.map((i) => {
          const active = isActive(i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              className={
                "rounded px-3 py-2 transition relative " +
                (active
                  ? "bg-neon-violet/20 text-white border-s-2 border-neon-pink shadow-glow-soft"
                  : "text-silver hover:text-white hover:bg-neon-violet/10 border-s-2 border-transparent")
              }
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
