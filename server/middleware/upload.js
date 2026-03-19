const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { env } = require("../config/env");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeExt(mime) {
  if (mime === "image/png") return ".png";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/webp") return ".webp";
  if (mime === "application/pdf") return ".pdf";
  return null;
}

function makeUploader({ subdir, allowPdf = false }) {
  const uploadRoot = path.resolve(process.cwd(), env.UPLOADS_DIR, subdir);
  ensureDir(uploadRoot);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadRoot),
    filename: (req, file, cb) => {
      const ext = safeExt(file.mimetype);
      const id = crypto.randomBytes(16).toString("hex");
      cb(null, `${Date.now()}-${id}${ext || ""}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = safeExt(file.mimetype);
      const okImage = Boolean(ext && ext !== ".pdf");
      const okPdf = allowPdf && ext === ".pdf";
      if (!okImage && !okPdf) return cb(new Error("Unsupported file type"));
      cb(null, true);
    },
  });
}

function makeMappedUploader({ fieldToSubdir, allowPdfFields = [] }) {
  const resolved = {};
  for (const [field, subdir] of Object.entries(fieldToSubdir)) {
    const root = path.resolve(process.cwd(), env.UPLOADS_DIR, subdir);
    ensureDir(root);
    resolved[field] = root;
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = resolved[file.fieldname];
      if (!dest) return cb(new Error("Unexpected upload field"));
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const ext = safeExt(file.mimetype);
      const id = crypto.randomBytes(16).toString("hex");
      cb(null, `${Date.now()}-${id}${ext || ""}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = safeExt(file.mimetype);
      const allowPdf = allowPdfFields.includes(file.fieldname);
      const okImage = Boolean(ext && ext !== ".pdf");
      const okPdf = allowPdf && ext === ".pdf";
      if (!okImage && !okPdf) return cb(new Error("Unsupported file type"));
      cb(null, true);
    },
  });
}

function makeMemoryUploader() {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for Base64 storage
  });
}

module.exports = { makeUploader, makeMappedUploader, makeMemoryUploader };

