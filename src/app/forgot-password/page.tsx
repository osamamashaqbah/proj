import { getT } from "@/i18n/server";
import { ForgotForm } from "./ForgotForm";

export default function ForgotPage() {
  const t = getT();
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="section-title">{t("auth.resetTitle")}</h1>
      <ForgotForm labels={{ email: t("auth.email"), submit: t("auth.sendReset") }} />
    </div>
  );
}
