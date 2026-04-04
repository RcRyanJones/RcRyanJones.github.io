/**
 * Stewart Stitches — local API
 * Serves static files from this folder and receives form submissions.
 *
 * POST /api/in-stock-order   JSON: { item, email, notes }
 * POST /api/custom-brief     multipart: name, email, title, description, size, deadline, colors, file?
 *
 * Each submission is written under data/submissions/ as JSON.
 * Optional file for custom briefs is stored under data/uploads/.
 *
 * Email: set SMTP_USER + SMTP_PASS in .env (see .env.example). Notices go to MAIL_TO
 * (defaults to rc.ryanjones@gmail.com).
 */

require("dotenv").config();
const express = require("express");
const {
  sendInStockNotification,
  sendCustomBriefNotification,
  logMailStatusOnStartup,
} = require("./notify-email");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 5173;
const ROOT = __dirname;
const submissionsDir = path.join(ROOT, "data", "submissions");
const uploadsDir = path.join(ROOT, "data", "uploads");

function ensureDirs() {
  fs.mkdirSync(submissionsDir, { recursive: true });
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function safeUploadName(original) {
  const base = path.basename(original || "upload").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now()}-${crypto.randomBytes(4).toString("hex")}-${base}`.slice(0, 220);
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => cb(null, safeUploadName(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      /^image\//.test(file.mimetype) || file.mimetype === "application/pdf";
    if (ok) cb(null, true);
    else cb(new Error("Only images or PDF files are allowed."));
  },
});

function isValidEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const app = express();
app.use(express.json({ limit: "64kb" }));

app.post("/api/in-stock-order", async (req, res) => {
  const body = req.body || {};
  const email = String(body.email || "").trim();
  const item = String(body.item || "").trim();
  const notes = String(body.notes || "").trim();

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "A valid email is required." });
  }

  const id = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const record = {
    type: "in-stock-order",
    id,
    receivedAt: new Date().toISOString(),
    item: item.slice(0, 500),
    email: email.slice(0, 320),
    notes: notes.slice(0, 8000),
  };

  const filePath = path.join(submissionsDir, `in-stock-${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf8");

  let emailSent = false;
  try {
    const result = await sendInStockNotification(record);
    emailSent = result.sent;
  } catch (err) {
    console.error("[mail] In-stock notify failed:", err.message || err);
  }

  res.json({ ok: true, id, emailSent });
});

app.post("/api/custom-brief", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      const msg =
        err instanceof multer.MulterError
          ? err.message === "File too large"
            ? "File is too large (max 8 MB)."
            : err.message
          : err.message || "Upload failed.";
      return res.status(400).json({ ok: false, error: msg });
    }
    next();
  });
}, async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();

  if (!name || !email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Name and a valid email are required." });
  }
  if (!title || !description) {
    return res.status(400).json({ ok: false, error: "Title and description are required." });
  }

  const id = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const record = {
    type: "custom-brief",
    id,
    receivedAt: new Date().toISOString(),
    name: name.slice(0, 200),
    email: email.slice(0, 320),
    title: title.slice(0, 300),
    description: description.slice(0, 20000),
    size: String(body.size || "").slice(0, 200),
    deadline: String(body.deadline || "").slice(0, 32),
    colors: String(body.colors || "").slice(0, 500),
    attachment: req.file
      ? {
          storedFilename: req.file.filename,
          originalName: req.file.originalname,
          bytes: req.file.size,
          mimeType: req.file.mimetype,
        }
      : null,
  };

  const filePath = path.join(submissionsDir, `custom-${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf8");

  let emailSent = false;
  try {
    const result = await sendCustomBriefNotification(record, uploadsDir);
    emailSent = result.sent;
  } catch (err) {
    console.error("[mail] Custom brief notify failed:", err.message || err);
  }

  res.json({ ok: true, id, emailSent });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "stewart-stitches" });
});

app.use(
  express.static(ROOT, {
    setHeaders(res, filePath) {
      const norm = filePath.replace(/\\/g, "/");
      if (norm.includes("/images/")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
  })
);

ensureDirs();
logMailStatusOnStartup();

const MAX_PORT_TRIES = 40;
function listenWithFallback(startPort, attempt) {
  const port = startPort + attempt;
  if (attempt >= MAX_PORT_TRIES) {
    console.error(`No free port found after ${MAX_PORT_TRIES} tries (from ${startPort}).`);
    process.exit(1);
  }
  const server = app.listen(port, () => {
    if (attempt > 0) {
      console.warn(`[server] Port ${startPort} was busy; using ${port} instead.`);
    }
    console.log(`Stewart Stitches: http://localhost:${port}`);
    console.log("Submissions: data/submissions/   Uploads: data/uploads/");
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      listenWithFallback(startPort, attempt + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

listenWithFallback(PORT, 0);
