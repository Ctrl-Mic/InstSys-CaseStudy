import express from "express";
import cors from "cors";
import loginRoute from "./routes/loginRoute.js";
import fetchStudentRoute from "./routes/fetchStudentRoute.js";
import registerRoute from "./routes/registerRoute.js";
import refreshCollections from "./routes/refreshCollections.js";
import coursesRoute from "./routes/coursesRoute.js";
import fileRoute from "./routes/fileRoute.js";
import { connection , upload } from "./src/modules/modules.connection.js";
import { callPythonAPI, configPythonAPI } from "./API/PythonAPI.js";
import Filemeta from './src/utils/cons.js'
import path from "path";
import multer from 'multer';
const memoryUpload = multer({ storage: multer.memoryStorage() });

const app = express();

console.log("server is starting...");

const PORT = process.env.PORT || 5000;

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ✅ Health check route for frontend
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Express server is running" });
  console.log("Health check endpoint was called.");
});

app.get("/initialize/AI", (req, res) => {
  try {
    configPythonAPI();
  } catch (err) {
    console.error("AI initialization failed:", err);
  }
});

app.use("/", loginRoute);
app.use("/student", fetchStudentRoute);
app.use("/", refreshCollections);
app.use("/", registerRoute);
app.use("/", coursesRoute);
app.use("/", fileRoute);

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
    console.error("Error in /v1/chat/prompt:", error);
    console.log("Request body received:", req.body);
    res.status(500).json({ error: "Failed to fetch data from Python API" });
  }
});

app.use(express.urlencoded({ extended: true }));

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

      const category = String(req.body?.category || "unknown");
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

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});