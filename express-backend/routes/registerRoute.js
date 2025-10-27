import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createStudentAccount } from "../utils/RBAC.js"; // adjust path if needed

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __outdirname = path.dirname(__dirname);

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__outdirname, "../express-backend/src/uploads");
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG files are allowed"));
    }
  },
});

// POST /register
router.post("/register", upload.single("image"), (req, res) => {
  try {
    const { data } = req.body;
    const parsedData = JSON.parse(data); // Parse the JSON string from the formData

    console.log("Register route hit with data:", parsedData);

    const requiredFields = [
      "studentId",
      "firstName",
      "middleName",
      "lastName",
      "email",
      "year",
      "course",
      "password",
      "faceDescriptor", // New field
    ];

    // Check for missing fields
    const missing = requiredFields.filter((field) => !(field in parsedData));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    // Map short course code to full course name
    const courseMap = {
      BSCS: "Bachelor of Science in Computer Science (BSCS)",
      BSIT: "Bachelor of Science in Information Technology (BSIT)",
      BSHM: "Bachelor of Science in Hospitality Management (BSHM)",
      BSTM: "Bachelor of Science in Tourism Management (BSTM)",
      BSOAd: "Bachelor of Science in Office Administration (BSOAd)",
      BECEd: "Bachelor of Early Childhood Education (BECEd)",
      BTLEd: "Bachelor of Technology in Livelihood Education (BTLEd)",
    };

    const courseFull = courseMap[parsedData.course] || parsedData.course;

    // Save the student account
    const result = createStudentAccount({
      studentId: parsedData.studentId,
      firstName: parsedData.firstName,
      middleName: parsedData.middleName,
      lastName: parsedData.lastName,
      year: parsedData.year,
      course: courseFull,
      password: parsedData.password,
      email: parsedData.email,
      faceDescriptor: parsedData.faceDescriptor, // Save face descriptor
      imagePath: req.file ? req.file.path : null, // Save image file path
    });

    if (result.error) {
      return res.status(409).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
});

export default router;
