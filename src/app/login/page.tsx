import { getT } from "@/i18n/server";
import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  const t = getT();
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="section-title">{t("auth.loginTitle")}</h1>
      <LoginForm
        callbackUrl={searchParams.callbackUrl}
        labels={{
          email: t("auth.email"),
          password: t("auth.password"),
          login: t("common.login"),
          google: t("auth.loginGoogle"),
          forgot: t("auth.forgot"),
          noAccount: t("auth.noAccount"),
          register: t("common.register"),
          or: t("common.or"),
          invalid: t("auth.errors.invalid"),
        }}
      />
    </div>
  );
}
