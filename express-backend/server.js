import express from "express";
import cors from "cors";
import loginRoute from "./routes/loginRoute.js";
// import guestRoute from "./routes/guestRoute.js";
import { connection , upload } from "./src/modules/modules.connection.js";
import fetchStudentRoute from "./routes/fetchStudentRoute.js";
import registerRoute from "./routes/registerRoute.js";
import refreshCollections from "./routes/refreshCollections.js";
import { callPythonAPI, configPythonAPI } from "./API/PythonAPI.js";
import f from 'fs';
import Filemeta from './src/utils/cons.js'
import path from "path";

const app = express();

console.log("server is starting...");

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // allow your Vite frontend
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

// ✅ Example endpoint that talks to Python
app.get("/v1/chat/prompt", async (req, res) => {
  try {
    const userQuery = req.query;

    if (!userQuery) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    const response = await callPythonAPI();
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/v1/upload/file", async (req, res) => {
  try {

    await connection();

    if (!req.file) {
      res.status(400).json({ error: "No File Uploaded"});
    }

    const file = req.file;
    const ext = path.extname()
    const fileType = Filemeta.getFileType(path.basename);

    const allowed = ['.xlsx', '.xls', '.pdf'];
    if (!allowed.includes(ext)) {
      return res.status(415).json({ error: 'Unsupported file type' });
    }

    const category = (req.body?.folder || req.body?.category || 'unknown').toString();

    const buffer = await f.readfile(filePath);

    const FilePayload = {
      file_name: path.basename(filePath),
      fileType: fileType,
      file: buffer,
      file_format: category,
    }

    const saved = await upload(FilePayload);

    return res.status(201).json({ success: true, file: saved})

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

