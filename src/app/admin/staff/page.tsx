import { getT } from "@/i18n/server";
import { CreateStaffForm } from "./CreateStaffForm";

export default function AdminStaffPage() {
  const t = getT();
  const labels = {
    email: t("admin.staff.form.email"),
    name: t("admin.staff.form.name"),
    password: t("admin.staff.form.password"),
    role: t("admin.staff.form.role"),
    submit: t("admin.staff.form.submit"),
    created: t("admin.staff.form.createdMessage"),
    generic: t("auth.errors.generic"),
  };
  return (
    <div className="space-y-4 max-w-md">
      <h1 className="section-title">{t("dashboard.admin.createStaff")}</h1>
      <CreateStaffForm labels={labels} />
    </div>
  );
}
