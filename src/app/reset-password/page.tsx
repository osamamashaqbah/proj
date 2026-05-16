import { getT } from "@/i18n/server";
import { ResetForm } from "./ResetForm";

export default function ResetPage({ searchParams }: { searchParams: { token?: string } }) {
  const t = getT();
  const token = searchParams.token ?? "";
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="section-title">{t("auth.resetTitle")}</h1>
      <ResetForm token={token} labels={{ password: t("auth.newPassword"), submit: t("common.save") }} />
    </div>
  );
}
