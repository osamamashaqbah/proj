import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, handleError, ok, sanitizeText } from "@/lib/api";
import { getCurrentUser, requirePermission } from "@/lib/rbac";

const Body = z.object({
  subject: z.string().min(2).max(200),
  body: z.string().min(2).max(5000),
});

export async function POST(req: Request) {
  try {
    const me = await getCurrentUser();
    requirePermission(me, "ticket.create");
    const body = Body.parse(await req.json());
    const t = await prisma.supportTicket.create({
      data: {
        authorId: me!.id,
        subject: sanitizeText(body.subject, 200),
        body: sanitizeText(body.body, 5000),
      },
    });
    return ok({ id: t.id });
  } catch (e) {
    return handleError(e);
  }
}
