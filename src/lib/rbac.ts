import { auth } from "./auth";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  roles: string[];
  permissions: string[];
  locale: string;
  banned: boolean;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as any;
  if (!u.id) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    roles: u.roles ?? [],
    permissions: u.permissions ?? [],
    locale: u.locale ?? "en",
    banned: !!u.banned,
  };
}

export function hasRole(user: SessionUser | null, role: string) {
  return !!user?.roles?.includes(role);
}

export function hasPermission(user: SessionUser | null, perm: string) {
  if (!user) return false;
  if (user.roles.includes("ADMIN")) return true;
  return user.permissions.includes(perm);
}

export function requireUser(user: SessionUser | null): asserts user is SessionUser {
  if (!user) {
    const err = new Error("UNAUTHORIZED");
    (err as any).status = 401;
    throw err;
  }
}

export function requirePermission(user: SessionUser | null, perm: string) {
  requireUser(user);
  if (!hasPermission(user, perm)) {
    const err = new Error("FORBIDDEN");
    (err as any).status = 403;
    throw err;
  }
}

export function dashboardPathFor(user: SessionUser | null): string {
  if (!user) return "/login";
  if (user.roles.includes("ADMIN")) return "/admin";
  if (user.roles.includes("EMPLOYEE")) return "/employee";
  return "/dashboard";
}
