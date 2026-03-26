const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
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
  let storage;

  if (env.USE_CLOUDINARY) {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: `evoting/${subdir}`,
        allowed_formats: ["jpg", "png", "jpeg", "webp", ...(allowPdf ? ["pdf"] : [])],
        public_id: (req, file) => {
          const id = crypto.randomBytes(12).toString("hex");
          return `${Date.now()}-${id}`;
        },
      },
    });
  } else {
    const uploadRoot = path.resolve(process.cwd(), env.UPLOADS_DIR, subdir);
    ensureDir(uploadRoot);

    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadRoot),
      filename: (req, file, cb) => {
        const ext = safeExt(file.mimetype);
        const id = crypto.randomBytes(16).toString("hex");
        cb(null, `${Date.now()}-${id}${ext || ""}`);
      },
    });
  }

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
  let storage;

  if (env.USE_CLOUDINARY) {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: (req, file) => {
          const subdir = fieldToSubdir[file.fieldname] || "others";
          return `evoting/${subdir}`;
        },
        allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"], // Handle dynamically in filter
        public_id: (req, file) => {
          const id = crypto.randomBytes(12).toString("hex");
          return `${Date.now()}-${id}`;
        },
      },
    });
  } else {
    const resolved = {};
    for (const [field, subdir] of Object.entries(fieldToSubdir)) {
      const root = path.resolve(process.cwd(), env.UPLOADS_DIR, subdir);
      ensureDir(root);
      resolved[field] = root;
    }

    storage = multer.diskStorage({
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
  }

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
    limits: { fileSize: 5 * 1024 * 1024 },
  });
}

module.exports = { makeUploader, makeMappedUploader, makeMemoryUploader };

