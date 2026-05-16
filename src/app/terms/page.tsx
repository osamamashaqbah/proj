import { getT } from "@/i18n/server";

export default function TermsPage() {
  const t = getT();
  return (
    <div className="prose prose-invert max-w-3xl">
      <h1 className="section-title">{t("terms.title")}</h1>
      <p className="muted text-sm">
        {t("terms.lastUpdated")}: {new Date().toLocaleDateString()}
      </p>

      <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-4 my-6 text-yellow-200 text-sm">
        <div className="font-semibold mb-1">⚠ {t("terms.complianceTitle")}</div>
        <p>{t("terms.complianceBody")}</p>
      </div>

      <h2 className="text-silver-bright text-lg font-semibold mt-8 mb-2">{t("terms.userRights")}</h2>
      <p className="muted text-sm">
        Users are responsible for the accuracy of their listings, the legality of their items in their
        jurisdiction, and any obligations to third-party platforms. The marketplace reserves the right to
        review, approve, reject, or remove any listing.
      </p>

      <h2 className="text-silver-bright text-lg font-semibold mt-8 mb-2">{t("terms.guaranteeTerms")}</h2>
      <p className="muted text-sm">
        The Website Guarantee places funds in escrow until the buyer confirms delivery. Disputes are
        mediated by our team. Refunds and releases are at the sole discretion of the platform per the
        chosen guarantee tier.
      </p>

      <h2 className="text-silver-bright text-lg font-semibold mt-8 mb-2">{t("terms.paymentsTerms")}</h2>
      <p className="muted text-sm">
        Payment gateway integration is a placeholder for this MVP. No real card processing occurs unless
        a real provider is configured. Refunds, chargebacks and dispute timelines depend on the provider.
      </p>

      <h2 className="text-silver-bright text-lg font-semibold mt-8 mb-2">{t("terms.disputeTerms")}</h2>
      <p className="muted text-sm">
        Disputes are filed via a support ticket. The team will review within the SLA of the chosen
        guarantee tier and may rule for refund, partial refund, or release of funds.
      </p>

      <h2 className="text-silver-bright text-lg font-semibold mt-8 mb-2">{t("terms.contactTerms")}</h2>
      <p className="muted text-sm">For any questions, contact our support team via the support page.</p>
    </div>
  );
}
