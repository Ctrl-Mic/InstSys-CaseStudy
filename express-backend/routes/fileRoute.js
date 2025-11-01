import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __outdirname = path.dirname(__dirname);

// === CONFIG ===
const UPLOAD_FOLDER = path.join(__outdirname, "utils/uploaded_files");
const ALLOWED_EXTENSIONS = [".xlsx", ".json", ".pdf"];

// === Multer setup ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder?.toLowerCase();
    if (!["faculty", "students", "admin"].includes(folder)) {
      return cb(new Error("Invalid folder"));
    }

    const targetFolder = path.join(UPLOAD_FOLDER, folder);
    fs.mkdirSync(targetFolder, { recursive: true });
    cb(null, targetFolder);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) cb(null, true);
    else cb(new Error("Invalid file type"));
  },
});

// === Helper ===
function isAllowed(filename) {
  return ALLOWED_EXTENSIONS.some((ext) =>
    filename.toLowerCase().endsWith(ext)
  );
}

// === GET /files ===
router.get("/files", (req, res) => {
  const base = UPLOAD_FOLDER;

  // Helper function to recursively fetch files
  const getFilesRecursively = (folderPath) => {
    const result = {};
    const items = fs.readdirSync(folderPath);

    items.forEach((item) => {
      const itemPath = path.join(folderPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        result[item] = getFilesRecursively(itemPath); // Recurse into subfolder
      } else if (stat.isFile() && isAllowed(item)) {
        if (!result.files) result.files = [];
        result.files.push(item); // Add file to the current folder
      }
    });

    return result;
  };

  try {
    const files = getFilesRecursively(base);
    res.json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

// === POST /upload ===
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    const file = req.file;
    const folder = req.body.folder?.toLowerCase();

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!["faculty", "students", "admin"].includes(folder)) {
      return res
        .status(400)
        .json({ message: "❌ Invalid folder. Must be faculty, students, or admin." });
    }

    const targetFolder = path.join(UPLOAD_FOLDER, folder);
    const filepath = path.join(targetFolder, file.originalname);

    // Check duplicate unless overwrite flag is true
    if (fs.existsSync(filepath) && req.body.overwrite !== "true") {
      return res.status(409).json({
        message: `⚠️ File '${file.originalname}' already exists in ${folder}/. Overwrite?`,
        duplicate: true,
      });
    }

    // Replace existing file
    fs.writeFileSync(filepath, fs.readFileSync(file.path));

    // (Optional) Rebuild AI collections here
    // collections = collectData(data_dir, role, assign);
    // ai = new AIAnalyst(collections, llm_config=full_config, execution_mode=api_mode);

    res.json({ message: "File uploaded successfully!", filename: file.originalname });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === DELETE /delete_upload/:category/:filename ===
router.delete("/delete_upload/:category/:filename", (req, res) => {
  const { category, filename } = req.params;

  if (!["faculty", "students", "admin"].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const folderPath = path.join(UPLOAD_FOLDER, category);
  const filePath = path.join(folderPath, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: "File deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
