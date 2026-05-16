import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(creds.email).toLowerCase() },
        });
        if (!user || !user.passwordHash || user.isBanned) return null;
        const ok = await bcrypt.compare(creds.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          image: user.image,
        } as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // ensure normal users always get USER role on Google sign-in
      if (!user?.email) return true;
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        include: { roles: true },
      });
      if (existing && existing.roles.length === 0) {
        const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
        if (userRole) {
          await prisma.userRole.upsert({
            where: {
              userId_roleId: { userId: existing.id, roleId: userRole.id },
            },
            update: {},
            create: { userId: existing.id, roleId: userRole.id },
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: {
            roles: {
              include: { role: { include: { permissions: { include: { permission: true } } } } },
            },
          },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.locale = dbUser.locale;
          token.roles = dbUser.roles.map((r) => r.role.name);
          token.permissions = Array.from(
            new Set(
              dbUser.roles.flatMap((r) =>
                r.role.permissions.map((p) => p.permission.key)
              )
            )
          );
          token.banned = dbUser.isBanned;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).roles = token.roles ?? [];
        (session.user as any).permissions = token.permissions ?? [];
        (session.user as any).locale = token.locale ?? "en";
        (session.user as any).banned = token.banned ?? false;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
