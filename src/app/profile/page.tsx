import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const t = getT();
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: me.id } });
  if (!user) redirect("/login");
  return (
    <div className="max-w-md space-y-4">
      <h1 className="section-title">{t("profile.title")}</h1>
      <p className="muted text-sm">{t("profile.subtitle")}</p>
      <ProfileForm
        initial={{ name: user.name ?? "", locale: user.locale }}
        labels={{
          name: t("auth.name"),
          language: t("common.language"),
          en: t("common.english"),
          ar: t("common.arabic"),
          save: t("common.save"),
          saved: t("profile.saved"),
        }}
      />
    </div>
  );
}
