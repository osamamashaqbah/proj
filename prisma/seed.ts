import { PrismaClient, CategoryKind, GuaranteeTier } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  // listings
  "listing.create",
  "listing.edit.own",
  "listing.edit.any",
  "listing.delete.own",
  "listing.delete.any",
  "listing.approve",
  "listing.reject",
  // categories
  "category.manage",
  // store
  "store.manage",
  // orders
  "order.view.own",
  "order.view.any",
  "order.manage",
  // guarantee
  "guarantee.request",
  "guarantee.handle",
  "guarantee.manage",
  // users / rbac
  "user.manage",
  "role.manage",
  // payment
  "payment.manage",
  // tickets
  "ticket.create",
  "ticket.handle",
  // admin
  "admin.dashboard",
  "employee.dashboard",
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  USER: [
    "listing.create",
    "listing.edit.own",
    "listing.delete.own",
    "order.view.own",
    "guarantee.request",
    "ticket.create",
  ],
  EMPLOYEE: [
    "listing.approve",
    "listing.reject",
    "listing.edit.any",
    "guarantee.handle",
    "ticket.handle",
    "order.view.any",
    "employee.dashboard",
  ],
  ADMIN: PERMISSIONS, // full access
};

async function main() {
  console.log("Seeding permissions...");
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key },
    });
  }

  console.log("Seeding roles...");
  for (const roleName of Object.keys(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { isSystem: true },
      create: { name: roleName, isSystem: true, description: `${roleName} role` },
    });

    // attach permissions
    const perms = await prisma.permission.findMany({
      where: { key: { in: ROLE_PERMISSIONS[roleName] } },
    });
    for (const p of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id },
      });
    }
  }

  console.log("Seeding categories...");
  const categories = [
    { slug: "used-games", nameEn: "Used Games", nameAr: "ألعاب مستعملة", kind: CategoryKind.USED_GAMES, riskWarning: false },
    { slug: "accounts", nameEn: "Gaming Accounts", nameAr: "حسابات ألعاب", kind: CategoryKind.ACCOUNTS, riskWarning: true },
    { slug: "subscriptions", nameEn: "Subscriptions", nameAr: "اشتراكات", kind: CategoryKind.SUBSCRIPTIONS, riskWarning: true },
    { slug: "digital-items", nameEn: "Digital Items", nameAr: "عناصر رقمية", kind: CategoryKind.DIGITAL_ITEMS, riskWarning: true },
    { slug: "services", nameEn: "Gaming Services", nameAr: "خدمات الألعاب", kind: CategoryKind.SERVICES, riskWarning: false },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { ...c },
      create: { ...c, enabled: true },
    });
  }

  console.log("Seeding guarantee packages...");
  const packages = [
    {
      tier: GuaranteeTier.BASIC,
      nameEn: "Basic Guarantee",
      nameAr: "ضمان أساسي",
      feePercent: 3,
      minFeeCents: 99,
      features: [
        "Funds held until buyer confirms delivery",
        "24h support response",
      ],
    },
    {
      tier: GuaranteeTier.PREMIUM,
      nameEn: "Premium Guarantee",
      nameAr: "ضمان متميز",
      feePercent: 6,
      minFeeCents: 199,
      features: [
        "Faster dispute handling",
        "Partial refund options",
        "12h support response",
      ],
    },
    {
      tier: GuaranteeTier.FULL,
      nameEn: "Full Protection Guarantee",
      nameAr: "حماية كاملة",
      feePercent: 9,
      minFeeCents: 299,
      features: [
        "Full buyer protection",
        "Priority human review",
        "Refund within 7 days on disputes",
      ],
    },
  ];
  for (const p of packages) {
    await prisma.guaranteePackage.upsert({
      where: { tier: p.tier },
      update: { ...p, isActive: true },
      create: { ...p, isActive: true },
    });
  }

  console.log("Seeding payment methods...");
  const methods = [
    { key: "stripe_card", labelEn: "Credit / Debit Card (Stripe)", labelAr: "بطاقة ائتمان/خصم (Stripe)", description: "Real card payment via Stripe Checkout.", sortOrder: 1, provider: "STRIPE" as const },
    { key: "paypal", labelEn: "PayPal", labelAr: "PayPal", description: "Real PayPal checkout. Cards are accepted via PayPal too.", sortOrder: 2, provider: "PAYPAL" as const },
    { key: "myfatoorah", labelEn: "Card / KNET / Wallet (MyFatoorah)", labelAr: "بطاقة / محفظة (MyFatoorah)", description: "Card and local wallets via MyFatoorah — supports Visa, Mastercard, KNET, Mada, Apple Pay across the Middle East.", sortOrder: 3, provider: "MYFATOORAH" as const },
    { key: "bank_transfer", labelEn: "Bank Transfer", labelAr: "تحويل بنكي", description: "Manual bank transfer (admin verifies).", sortOrder: 4, provider: "MANUAL" as const },
    { key: "manual_cash", labelEn: "Manual / Cash", labelAr: "نقدي يدوي", description: "In-person or manual cash settlement.", sortOrder: 5, provider: "MANUAL" as const },
  ];
  for (const m of methods) {
    await prisma.paymentMethodSetting.upsert({
      where: { key: m.key },
      update: { ...m, enabled: true },
      create: { ...m, enabled: true },
    });
  }
  // Remove obsolete keys from earlier seeds (only if present)
  await prisma.paymentMethodSetting.deleteMany({
    where: { key: { in: ["card", "wallet"] } },
  });

  console.log("Seeding demo users...");
  const adminEmail = "admin@example.com";
  const empEmail = "employee@example.com";
  const userEmail = "user@example.com";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: "Admin" },
    create: { email: adminEmail, name: "Admin", passwordHash, locale: "en" },
  });
  const empUser = await prisma.user.upsert({
    where: { email: empEmail },
    update: { passwordHash, name: "Employee" },
    create: { email: empEmail, name: "Employee", passwordHash, locale: "en" },
  });
  const normUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: { passwordHash, name: "User" },
    create: { email: userEmail, name: "User", passwordHash, locale: "en" },
  });

  const [adminRole, empRole, userRole] = await Promise.all([
    prisma.role.findUnique({ where: { name: "ADMIN" } }),
    prisma.role.findUnique({ where: { name: "EMPLOYEE" } }),
    prisma.role.findUnique({ where: { name: "USER" } }),
  ]);

  const links = [
    [adminUser.id, adminRole!.id],
    [adminUser.id, userRole!.id],
    [empUser.id, empRole!.id],
    [empUser.id, userRole!.id],
    [normUser.id, userRole!.id],
  ] as const;
  for (const [uid, rid] of links) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: uid, roleId: rid } },
      update: {},
      create: { userId: uid, roleId: rid },
    });
  }

  console.log("Done.");
  console.log("Demo accounts:");
  console.log(`  ADMIN    -> ${adminEmail} / Password123!`);
  console.log(`  EMPLOYEE -> ${empEmail} / Password123!`);
  console.log(`  USER     -> ${userEmail} / Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
