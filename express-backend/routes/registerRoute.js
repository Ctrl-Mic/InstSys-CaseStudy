import express from "express";
import { createStudentAccount } from "../utils/RBAC.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const parsedData = req.body;

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
      "faceDescriptor",
      "image", // ✅ new required field
    ];

    const missing = requiredFields.filter((field) => !(field in parsedData));
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

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

    // ✅ Save to your DB / JSON
    const result = createStudentAccount({
      ...parsedData,
      course: courseFull,
      image: parsedData.image, // ✅ Base64 string directly saved
    });

    if (result.error) return res.status(409).json(result);
    return res.json(result);
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
});

export default router;
