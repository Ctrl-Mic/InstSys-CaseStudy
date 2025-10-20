import express from "express";
import axios from "axios";
import cors from "cors";
import loginRoute from "./routes/loginRoute.js";
// import guestRoute from "./routes/guestRoute.js";
import { callPythonAPI, configPythonAPI } from "./API/PythonAPI.js";
import { connection , upload } from "./src/modules/connection.js";
import cons from "./src/utils/cons.js";

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

app.use("/login", loginRoute);
// app.use("/student/:student_id", guestRoute);

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

app.listen(PORT, () => {
  console.log("✅ Server is running on port ${PORT}");
});

app.post("/v1/upload/file", upload("file"), async (req, res) => {

  try {

    await connection();

    const filePath = req.file
    if (!filePath) {
      res.status(400).json({ error: "No file uploaded" })
    }

    const file = {
      file: file.buffer,
      file_name: file.file_name,
      fileType: fileSchema.mimetype,
      uploadedAt: new Date(),
    }

    const result = await upload(file);
    res.json("File uploaded successfully!")

  } catch {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch data"});
  }
});

app.post("/Register", )