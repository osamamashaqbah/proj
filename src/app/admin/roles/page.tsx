import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { RolePerms } from "./RolePerms";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const t = getT();
  const [roles, perms] = await Promise.all([
    prisma.role.findMany({ include: { permissions: { include: { permission: true } } }, orderBy: { name: "asc" } }),
    prisma.permission.findMany({ orderBy: { key: "asc" } }),
  ]);
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.roles")}</h1>
      <div className="space-y-4">
        {roles.map((r) => (
          <RolePerms
            key={r.id}
            role={{
              id: r.id,
              name: r.name,
              isSystem: r.isSystem,
              perms: r.permissions.map((p) => p.permission.key),
            }}
            allPerms={perms.map((p) => p.key)}
          />
        ))}
      </div>
    </div>
  );
}
