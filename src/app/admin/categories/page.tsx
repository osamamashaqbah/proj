import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { CategoryRow } from "./CategoryRow";
import { NewCategoryForm } from "./NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const t = getT();
  const cats = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });

  const rowLabels = {
    yes: t("common.yes"),
    no: t("common.no"),
    enabled: t("common.enabled"),
    disabled: t("common.disabled"),
  };
  const formLabels = {
    slug: t("admin.categories.form.slug"),
    nameEn: t("admin.categories.form.nameEn"),
    nameAr: t("admin.categories.form.nameAr"),
    kind: t("admin.categories.form.kind"),
    risk: t("admin.categories.form.risk"),
    add: t("admin.categories.form.add"),
  };

  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.categories")}</h1>
      <NewCategoryForm labels={formLabels} />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.categories.headings.slug")}</th>
              <th>{t("admin.categories.headings.en")}</th>
              <th>{t("admin.categories.headings.ar")}</th>
              <th>{t("admin.categories.headings.kind")}</th>
              <th>{t("admin.categories.headings.risk")}</th>
              <th>{t("admin.categories.headings.enabled")}</th>
              <th>{t("admin.categories.headings.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <CategoryRow key={c.id} c={c} labels={rowLabels} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
