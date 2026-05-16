"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const router = useRouter();
  const [pending, start] = useTransition();

  const set = async (locale: "en" | "ar") => {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    start(() => router.refresh());
  };

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-neon-violet/40 bg-bg-soft/80 p-0.5 text-xs font-bold">
      <button
        onClick={() => set("en")}
        disabled={pending}
        className="px-2.5 py-1 rounded hover:bg-neon-violet/20 text-silver hover:text-white transition uppercase tracking-wider"
      >
        EN
      </button>
      <button
        onClick={() => set("ar")}
        disabled={pending}
        className="px-2.5 py-1 rounded hover:bg-neon-pink/20 text-silver hover:text-white transition"
      >
        ع
      </button>
    </div>
  );
}
