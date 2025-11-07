import express from "express";
import { createStudentAccount } from "../utils/RBAC.js";

const router = express.Router();

router.post("/verify", async (req, res) => {
  const { code } = req.body;
  console.log("Session at /verify:", req.session); // Add this line for debugging
  const temp = req.session.tempUser;

  if (!temp) {
    console.log("No tempUser found in session at /verify."); // Debug log
    return res.status(400).send("No registration in progress");
  }
  if (!temp.course) return res.status(400).send("Missing course information");
  if (code !== temp.verificationCode) return res.status(400).send("Invalid code");

  // Finalize registration (save user to DB/JSON)
  const result = createStudentAccount({
    ...temp,
    image: temp.image, // Base64 string directly saved
  });

  if (result.error) return res.status(409).json(result);

  delete req.session.tempUser;
  res.send("Registration complete!");
});

export default router;