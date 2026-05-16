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
    <div className="flex items-center gap-1 rounded-md border border-purple-800/40 bg-bg-soft p-0.5 text-xs">
      <button
        onClick={() => set("en")}
        disabled={pending}
        className="px-2 py-1 rounded hover:bg-bg-elevated text-silver"
      >
        EN
      </button>
      <button
        onClick={() => set("ar")}
        disabled={pending}
        className="px-2 py-1 rounded hover:bg-bg-elevated text-silver"
      >
        ع
      </button>
    </div>
  );
}
