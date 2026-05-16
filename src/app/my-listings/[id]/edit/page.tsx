import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";
import { getLocale, getT } from "@/i18n/server";
import { EditListingForm } from "./EditListingForm";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  const t = getT();
  const locale = getLocale();
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { category: true },
  });
  if (!listing) notFound();
  if (listing.sellerId !== me.id && !me.roles.includes("ADMIN") && !me.roles.includes("EMPLOYEE")) {
    redirect("/my-listings");
  }
  const categories = await prisma.category.findMany({
    where: { enabled: true },
    orderBy: { nameEn: "asc" },
  });
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="section-title">{t("common.edit")}: {listing.title}</h1>
      <EditListingForm
        id={listing.id}
        initial={{
          title: listing.title,
          description: listing.description,
          categoryId: listing.categoryId,
          priceCents: listing.priceCents,
          images: listing.images,
        }}
        categories={categories.map((c) => ({
          id: c.id,
          name: locale === "ar" ? c.nameAr : c.nameEn,
        }))}
        labels={{
          title: t("sell.fields.title"),
          description: t("sell.fields.description"),
          category: t("sell.fields.category"),
          price: t("sell.fields.price"),
          images: t("sell.fields.images"),
          save: t("common.save"),
        }}
      />
    </div>
  );
}
