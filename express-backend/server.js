import express from "express";
import cors from "cors";
import loginRoute from "./routes/loginRoute.js";
// import guestRoute from "./routes/guestRoute.js";
import { connection , upload } from "./src/modules/modules.connection.js";
import fetchStudentRoute from "./routes/fetchStudentRoute.js";
import registerRoute from "./routes/registerRoute.js";
import refreshCollections from "./routes/refreshCollections.js";
import coursesRoute from "./routes/coursesRoute.js";
import { callPythonAPI, configPythonAPI } from "./API/PythonAPI.js";
import Filemeta from './src/utils/cons.js'
import path from "path";
import multer from 'multer';
const memoryUpload = multer({ storage: multer.memoryStorage() });

const app = express();

console.log("server is starting...");

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5174", // allow your Vite frontend
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check route for frontend
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Express server is running" });
  console.log("Health check endpoint was called.");
});

app.use("/", loginRoute);
app.use("/student", fetchStudentRoute);
app.use("/", refreshCollections);
app.use("/", registerRoute);
app.use("/", coursesRoute);

// ✅ Example endpoint that talks to Python
app.post("/v1/chat/prompt", async (req, res) => {
  try {
    const { query: userQuery } = req.body;
    console.log("Received request to /v1/chat/prompt with query:", userQuery);

    if (!userQuery) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const response = await callPythonAPI(userQuery);
    res.json(response);
  } catch (error) {
    console.error("Error in /v1/chat/prompt:", error.message);
    res.status(500).json({ error: "Failed to fetch data from Python API" });
  }
});

app.post("/v1/upload/file", memoryUpload.single("file"), async (req, res) => {
    try {
      await connection();

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded (use field name 'file')" });
      }

      const { originalname, buffer } = req.file;
      const ext = path.extname(originalname).toLowerCase();

      const fileType =
        typeof Filemeta.getFileType === "function"
          ? Filemeta.getFileType(ext)
          : new Filemeta().getFileType(ext);

      const allowed = [".xlsx", ".xls", ".pdf"];
      if (!allowed.includes(ext)) {
        return res.status(415).json({ error: "Unsupported file type" });
      }

      const category = req.body?.category.toString();
      const overwrite = (req.body?.overwrite === "true") || false;

      const filePayload = {
        file_name: originalname,
        fileType,
        file: buffer,             
        file_category: category,
        overwrite
      };

      const saved = await upload(filePayload);

      if (!saved) {
        return res.status(500).json({ success: false, error: "Upload failed" });
      }

      if (saved.status === 409) {
        return res.status(409).json(saved);
      }

      return res.status(201).json({ success: true, file: saved });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Failed to upload file" });
    }
  }
);

(async () => {
  try {
    console.log("🧠 Initializing AI Analyst via Python API...");
    const result = await configPythonAPI(["default_collection"]);
    console.log("✅ AI Analyst configured successfully:", result);
  } catch (err) {
    console.error("❌ Failed to configure AI Analyst:", err.message);
  }
})();

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});