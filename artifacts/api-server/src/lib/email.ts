import nodemailer from "nodemailer";
import { db, notificationsTable } from "@workspace/db";
import { logger } from "./logger";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM ?? EMAIL_USER ?? "noreply@novaelitefc.com";
const ACADEMY_NAME = "Nova Elite FC Academy";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });
  }
  return transporter;
}

export type NotificationType =
  | "player_approved"
  | "player_rejected"
  | "document_submitted"
  | "trial_booked";

interface NotifyOptions {
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlBody: string;
  plainBody: string;
  relatedPlayerId?: number;
}

export async function sendNotification(opts: NotifyOptions): Promise<void> {
  const { type, recipientEmail, recipientName, subject, htmlBody, plainBody, relatedPlayerId } = opts;

  let emailSent = false;
  let emailError: string | undefined;

  const t = getTransporter();
  if (t) {
    try {
      await t.sendMail({
        from: `"${ACADEMY_NAME}" <${EMAIL_FROM}>`,
        to: recipientEmail,
        subject,
        text: plainBody,
        html: wrapHtml(subject, htmlBody),
      });
      emailSent = true;
      logger.info({ type, recipientEmail }, "Email notification sent");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      emailError = msg;
      logger.warn({ type, recipientEmail, error: msg }, "Email send failed — stored in DB only");
    }
  } else {
    logger.info({ type, recipientEmail }, "Email not configured — notification stored in DB only");
  }

  await db.insert(notificationsTable).values({
    type,
    recipientEmail,
    recipientName,
    subject,
    body: plainBody,
    relatedPlayerId: relatedPlayerId ?? null,
    emailSent,
    emailError: emailError ?? null,
    read: false,
  });
}

// ── Notification helpers ─────────────────────────────────────────────────────

export async function notifyPlayerApproved(opts: {
  playerEmail: string;
  playerName: string;
  playerId: number;
}) {
  const { playerEmail, playerName, playerId } = opts;
  await sendNotification({
    type: "player_approved",
    recipientEmail: playerEmail,
    recipientName: playerName,
    subject: `Your Nova Elite FC Academy registration has been approved`,
    plainBody: `Dear ${playerName},\n\nCongratulations! Your registration with Nova Elite FC Academy has been reviewed and your account is now active.\n\nYou can now log in to your player dashboard to view your training schedule, team assignments, and more.\n\nWe look forward to seeing you on the pitch.\n\nNova Elite FC Academy`,
    htmlBody: `
      <p>Dear <strong>${playerName}</strong>,</p>
      <p>Congratulations! Your registration with <strong>Nova Elite FC Academy</strong> has been reviewed and your account is now <span style="color:#d4af37;font-weight:bold;">ACTIVE</span>.</p>
      <p>You can now log in to your player dashboard to view your training schedule, team assignments, and more.</p>
      <p>We look forward to seeing you on the pitch.</p>
    `,
    relatedPlayerId: playerId,
  });
}

export async function notifyPlayerRejected(opts: {
  playerEmail: string;
  playerName: string;
  playerId: number;
}) {
  const { playerEmail, playerName, playerId } = opts;
  await sendNotification({
    type: "player_rejected",
    recipientEmail: playerEmail,
    recipientName: playerName,
    subject: `Update on your Nova Elite FC Academy registration`,
    plainBody: `Dear ${playerName},\n\nThank you for applying to Nova Elite FC Academy. After reviewing your submission, we are unable to activate your account at this time.\n\nIf you believe this is an error or need further information, please contact us via our website.\n\nNova Elite FC Academy`,
    htmlBody: `
      <p>Dear <strong>${playerName}</strong>,</p>
      <p>Thank you for applying to <strong>Nova Elite FC Academy</strong>. After reviewing your submission, we are unable to activate your account at this time.</p>
      <p>If you believe this is an error or would like further clarification, please <a href="https://novaelitefc.com/contact" style="color:#d4af37;">contact us</a>.</p>
    `,
    relatedPlayerId: playerId,
  });
}

export async function notifyAdminDocumentSubmitted(opts: {
  adminEmail: string;
  playerName: string;
  playerId: number;
  documentType: string;
}) {
  const { adminEmail, playerName, playerId, documentType } = opts;
  await sendNotification({
    type: "document_submitted",
    recipientEmail: adminEmail,
    recipientName: "Academy Admin",
    subject: `Document submitted for review — ${playerName}`,
    plainBody: `A player has submitted a document for review.\n\nPlayer: ${playerName}\nDocument: ${documentType}\nPlayer ID: ${playerId}\n\nPlease log in to the admin panel to review and approve or reject this submission.\n\nNova Elite FC Academy`,
    htmlBody: `
      <p>A player has submitted a document for review.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Player</td><td style="padding:8px;font-weight:bold;">${playerName}</td></tr>
        <tr style="background:rgba(255,255,255,0.03)"><td style="padding:8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Document</td><td style="padding:8px;">${documentType}</td></tr>
        <tr><td style="padding:8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Player ID</td><td style="padding:8px;">#${playerId}</td></tr>
      </table>
      <p><a href="/admin/documents" style="color:#d4af37;font-weight:bold;">Review in Admin Panel →</a></p>
    `,
    relatedPlayerId: playerId,
  });
}

export async function notifyTrialBooked(opts: {
  playerEmail: string;
  playerName: string;
  trialTitle: string;
  trialDate: string;
  trialLocation: string;
}) {
  const { playerEmail, playerName, trialTitle, trialDate, trialLocation } = opts;
  await sendNotification({
    type: "trial_booked",
    recipientEmail: playerEmail,
    recipientName: playerName,
    subject: `Trial booking confirmed — ${trialTitle}`,
    plainBody: `Dear ${playerName},\n\nYour trial booking has been confirmed.\n\nTrial: ${trialTitle}\nDate: ${trialDate}\nLocation: ${trialLocation}\n\nPlease arrive 15 minutes early in full kit. Bring a valid ID and any required documents.\n\nNova Elite FC Academy`,
    htmlBody: `
      <p>Dear <strong>${playerName}</strong>,</p>
      <p>Your trial booking has been confirmed.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;">
        <tr><td style="padding:8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Trial</td><td style="padding:8px;font-weight:bold;">${trialTitle}</td></tr>
        <tr style="background:rgba(255,255,255,0.03)"><td style="padding:8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Date</td><td style="padding:8px;">${trialDate}</td></tr>
        <tr><td style="padding:8px;color:#999;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Location</td><td style="padding:8px;">${trialLocation}</td></tr>
      </table>
      <p>Please arrive <strong>15 minutes early</strong> in full kit. Bring a valid ID and any required documents.</p>
    `,
  });
}

// ── HTML wrapper ─────────────────────────────────────────────────────────────

function wrapHtml(subject: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;color:#e0e0e0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111;border:1px solid rgba(255,255,255,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;border-bottom:2px solid #d4af37;padding:28px 36px;text-align:center;">
            <span style="font-size:22px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#d4af37;">NOVA ELITE FC</span>
            <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#666;margin-top:4px;">Academy</div>
          </td>
        </tr>
        <!-- Subject -->
        <tr>
          <td style="padding:28px 36px 0;">
            <h1 style="margin:0;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#fff;">${subject}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:20px 36px 32px;font-size:14px;line-height:1.7;color:#b0b0b0;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 36px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#555;letter-spacing:1px;text-transform:uppercase;">Nova Elite FC Academy &nbsp;·&nbsp; All rights reserved</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
