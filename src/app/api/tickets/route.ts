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

    const subject = sanitizeText(body.subject, 200);
    const initialBody = sanitizeText(body.body, 5000);

    const t = await prisma.supportTicket.create({
      data: {
        authorId: me!.id,
        subject,
        body: initialBody,
        // Auto-create initial message so the conversation thread is consistent
        messages: {
          create: [
            {
              authorId: me!.id,
              body: initialBody,
              isStaff: false,
            },
          ],
        },
      },
    });
    return ok({ id: t.id });
  } catch (e) {
    return handleError(e);
  }
}
