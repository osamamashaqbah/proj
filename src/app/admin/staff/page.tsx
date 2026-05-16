import { getT } from "@/i18n/server";
import { CreateStaffForm } from "./CreateStaffForm";

export default function AdminStaffPage() {
  const t = getT();
  return (
    <div className="space-y-4 max-w-md">
      <h1 className="section-title">{t("dashboard.admin.createStaff")}</h1>
      <CreateStaffForm />
    </div>
  );
}
