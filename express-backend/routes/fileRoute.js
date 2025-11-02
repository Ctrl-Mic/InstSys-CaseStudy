/**
 * The provided JavaScript code defines routes for file upload, retrieval, and deletion using Express
 * and Multer in a Node.js application.
 * @param filename - The `filename` parameter is a string that represents the name of a file, including
 * its extension. It is used to identify a specific file within the context of file operations such as
 * uploading, fetching, or deleting files. In the provided code snippet, the `filename` parameter is
 * used when handling file
 * @returns The code snippet provided is an Express router configuration for handling file uploads,
 * listing files, and deleting files. It sets up routes for GET `/files`, POST `/upload`, and DELETE
 * `/delete_upload/:category/:filename`.
 */
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __outdirname = path.dirname(__dirname);

// === CONFIG ===
const UPLOAD_FOLDER = path.join(__outdirname, "utils/uploaded_files");

// Simplify the storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Multer processing request:", {
      body: req.body,
      file: file.originalname,
    });

    // Create base upload folder if it doesn't exist
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

    // Initially save to the base upload folder
    // The actual file will be moved to the correct subfolder after upload
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Remove the file type checking from the backend since it's handled in the frontend
const upload = multer({ storage });

// === Helper ===
function isAllowed(filename) {
  return true; // All files are allowed
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
      } else if (stat.isFile()) {
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

const VALID_FOLDERS = [
  "students_data",
  "non_teaching_faculty",
  "teaching_faculty",
  "cor",
  "faculty_schedule",
  "grades",
  "admin",
  "curriculum",
  "generalinfo",
];

// === POST /upload ===
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    console.log("Received upload request:", {
      file: req.file?.originalname,
      folder: req.body?.folder,
      body: req.body,
    });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const folder = req.body.folder;
    if (!folder) {
      return res.status(400).json({ message: "No folder specified" });
    }

    // Remove folder validation since the modal now handles the folder naming
    // We just need to ensure the folder exists
    const targetFolder = path.join(UPLOAD_FOLDER, folder);
    fs.mkdirSync(targetFolder, { recursive: true });

    console.log("Created target folder:", targetFolder);

    // Move the file to the correct folder
    const originalPath = req.file.path;
    const targetPath = path.join(targetFolder, req.file.filename);

    fs.renameSync(originalPath, targetPath);

    console.log("File uploaded successfully:", {
      filename: req.file.filename,
      folder: folder,
      path: targetPath,
    });

    res.json({
      message: "File uploaded successfully!",
      filename: req.file.filename,
      folder: folder,
      path: targetPath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// === DELETE /delete_upload/:category/:filename ===
router.delete("/delete_upload/:category/:filename", (req, res) => {
  const { category, filename } = req.params;

  const matchedFolder = VALID_FOLDERS.find((validFolder) =>
    category.includes(validFolder)
  );

  if (!matchedFolder) {
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
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const handleFileChange = async (file, folder) => {
  if (!file) return;

  console.log("Uploading file:", file.name);
  console.log("Target folder:", folder);

  // ✅ Allowed file extensions
  const allowedExtensions = [".xlsx", ".json", ".pdf"];

  // Check if the file is one of the allowed types
  if (!allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))) {
    alert("Only Excel (.xlsx), JSON (.json), and PDF (.pdf) files are allowed ❌");
    return;
  }

  // 👉 Validate folder name
  if (!folder || !VALID_FOLDERS.includes(folder.toLowerCase())) {
    alert(`❌ Invalid choice. Please select one of: ${VALID_FOLDERS.join(", ")}`);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder.toLowerCase()); // ✅ send folder choice

  try {
    const response = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Upload response:", result);

    if (response.ok) {
      showPopup("success", "✅ Upload complete");
      fetchFiles();
    } else {
      showPopup("error", result.message || "❌ Upload failed");
    }
  } catch (error) {
    console.error("Upload failed:", error);
    showPopup("error", "❌ Upload failed");
  }
};

export default router;
