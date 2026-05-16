import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { CategoryRow } from "./CategoryRow";
import { NewCategoryForm } from "./NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const t = getT();
  const cats = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.categories")}</h1>
      <NewCategoryForm />
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>EN</th>
              <th>AR</th>
              <th>Kind</th>
              <th>Risk</th>
              <th>Enabled</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <CategoryRow key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
