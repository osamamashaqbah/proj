import { getT } from "@/i18n/server";
import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  const t = getT();
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="section-title">{t("support.title")}</h1>
      <p className="muted text-sm">{t("support.subtitle")}</p>
      <ContactForm
        labels={{
          subject: t("support.subject"),
          message: t("support.message"),
          submit: t("support.submit"),
          submitted: t("support.submitted"),
        }}
      />
    </div>
  );
}
