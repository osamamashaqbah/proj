import { getT } from "@/i18n/server";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  const t = getT();
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="section-title">{t("auth.registerTitle")}</h1>
      <RegisterForm
        labels={{
          email: t("auth.email"),
          password: t("auth.password"),
          confirm: t("auth.confirmPassword"),
          name: t("auth.name"),
          submit: t("common.register"),
          haveAccount: t("auth.haveAccount"),
          login: t("common.login"),
          mismatch: t("auth.errors.mismatch"),
          weak: t("auth.errors.weak"),
          generic: t("auth.errors.generic"),
          exists: t("auth.errors.exists"),
        }}
      />
    </div>
  );
}
