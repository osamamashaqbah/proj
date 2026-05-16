import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { GuaranteePackageRow } from "./GuaranteePackageRow";

export const dynamic = "force-dynamic";

export default async function AdminGuaranteePackagesPage() {
  const t = getT();
  const packages = await prisma.guaranteePackage.findMany({ orderBy: { feePercent: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.guaranteePackages")}</h1>
      <div className="space-y-3">
        {packages.map((p) => <GuaranteePackageRow key={p.id} p={p} />)}
      </div>
    </div>
  );
}
