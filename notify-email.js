/**
 * Sends submission details to the shop inbox (default: rc.ryanjones@gmail.com).
 * Requires SMTP_USER + SMTP_PASS. Optional: see .env.example
 */

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const DEFAULT_NOTIFY_TO = "rc.ryanjones@gmail.com";

function smtpConfig() {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  const notifyTo = (process.env.MAIL_TO || DEFAULT_NOTIFY_TO).trim();
  return {
    configured: Boolean(user && pass),
    notifyTo,
    from: (process.env.SMTP_FROM || user).trim(),
    user,
    pass,
    host: (process.env.SMTP_HOST || "smtp.gmail.com").trim(),
    port: Number(process.env.SMTP_PORT) || 465,
    secure: process.env.SMTP_SECURE !== "false",
  };
}

let transporter = null;
function getTransporter(cfg) {
  if (!cfg.configured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }
  return transporter;
}

async function sendInStockNotification(record) {
  const cfg = smtpConfig();
  const tx = getTransporter(cfg);
  if (!tx) return { sent: false, reason: "smtp_not_configured" };

  const subject = `[Stewart Stitches] In-stock: ${record.item || "Request"}`;
  const text = [
    "Stewart Stitches — new in-stock request",
    "",
    `Submission ID: ${record.id}`,
    `Received (UTC): ${record.receivedAt}`,
    "",
    `Requested item: ${record.item || "(not specified)"}`,
    `Customer email: ${record.email}`,
    "",
    "Notes from customer:",
    record.notes || "(none)",
  ].join("\n");

  await tx.sendMail({
    from: cfg.from,
    to: cfg.notifyTo,
    replyTo: record.email,
    subject,
    text,
  });
  return { sent: true };
}

async function sendCustomBriefNotification(record, uploadsDir) {
  const cfg = smtpConfig();
  const tx = getTransporter(cfg);
  if (!tx) return { sent: false, reason: "smtp_not_configured" };

  const subject = `[Stewart Stitches] Custom: ${record.title}`;
  const text = [
    "Stewart Stitches — new custom project brief",
    "",
    `Submission ID: ${record.id}`,
    `Received (UTC): ${record.receivedAt}`,
    "",
    `Customer name: ${record.name}`,
    `Customer email: ${record.email}`,
    `Project title: ${record.title}`,
    "",
    "Description:",
    record.description,
    "",
    `Approx. size: ${record.size || "(not given)"}`,
    `Deadline: ${record.deadline || "(not given)"}`,
    `Colors: ${record.colors || "(not given)"}`,
    "",
    record.attachment
      ? `Attachment on server: ${record.attachment.storedFilename} (original: ${record.attachment.originalName})`
      : "No file attachment.",
  ].join("\n");

  const mail = {
    from: cfg.from,
    to: cfg.notifyTo,
    replyTo: record.email,
    subject,
    text,
  };

  if (record.attachment && record.attachment.storedFilename) {
    const fp = path.join(uploadsDir, record.attachment.storedFilename);
    if (fs.existsSync(fp)) {
      mail.attachments = [
        {
          filename: record.attachment.originalName || "attachment",
          path: fp,
        },
      ];
    }
  }

  await tx.sendMail(mail);
  return { sent: true };
}

function logMailStatusOnStartup() {
  const cfg = smtpConfig();
  if (!cfg.configured) {
    console.warn(
      "[mail] SMTP_USER / SMTP_PASS not set — emails will not send. Copy .env.example to .env and add Gmail app password."
    );
  } else {
    console.log(`[mail] Sending submission notices to ${cfg.notifyTo}`);
  }
}

module.exports = {
  sendInStockNotification,
  sendCustomBriefNotification,
  logMailStatusOnStartup,
};
