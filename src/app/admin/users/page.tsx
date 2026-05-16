import { prisma } from "@/lib/prisma";
import { getT } from "@/i18n/server";
import { UserRow } from "./UserRow";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const t = getT();
  const users = await prisma.user.findMany({
    include: { roles: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="section-title">{t("dashboard.admin.users")}</h1>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Roles</th>
              <th>Status</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  email: u.email,
                  name: u.name,
                  banned: u.isBanned,
                  roles: u.roles.map((r) => r.role.name),
                }}
                allRoles={roles.map((r) => ({ id: r.id, name: r.name }))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
