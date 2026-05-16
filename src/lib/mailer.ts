// Lightweight mailer placeholder. In dev it logs to the console.
// Wire to an actual SMTP provider via env vars when ready.

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!process.env.SMTP_HOST) {
    console.log("[mail:dev]", opts);
    return { dev: true };
  }
  // Real SMTP would use nodemailer. Left as a future hook.
  console.log("[mail:placeholder]", opts);
  return { dev: false };
}
