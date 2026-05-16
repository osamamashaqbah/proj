import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      roles: string[];
      permissions: string[];
      locale: string;
      banned: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    roles?: string[];
    permissions?: string[];
    locale?: string;
    banned?: boolean;
  }
}
