import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "uploads",
      resource_type: isVideo ? "video" : "image",
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(jpeg|jpg|png|gif|webp|mp4|mov|avi|mkv|heic|heif)$/i;
    const allowedMime = /^(image\/|video\/)/;
    if (allowed.test(file.originalname) || allowedMime.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const router = Router();
	
router.post("/", upload.array("files",3), (req, res) => {
  const files = req.files as any[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: "No files uploaded" });
    return;
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.get("host");
  // Cloudinary URLs
  const urls = files.map((f: any) => f.path);
  res.json({ urls });
});

export default router;

