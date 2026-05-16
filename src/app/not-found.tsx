import Link from "next/link";
import { getT } from "@/i18n/server";

export default function NotFound() {
  const t = getT();
  return (
    <div className="card text-center py-12">
      <div className="text-6xl mb-4 animate-pulse-neon">🕹️</div>
      <h1 className="arcade-title text-3xl mt-4">404</h1>
      <p className="muted mt-3 text-lg">{t("notFound.title")}</p>
      <p className="muted text-sm mt-1">{t("notFound.subtitle")}</p>
      <Link href="/" className="btn-primary mt-6 inline-block">{t("notFound.goHome")}</Link>
    </div>
  );
}
