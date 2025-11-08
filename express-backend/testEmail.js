import nodemailer from "nodemailer";

const test = async () => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "minmic0630@gmail.com",
      pass: "dkqcoltzhrhtqqko",
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Gmail ready! Credentials work.");
  } catch (err) {
    console.error("❌ Email connection failed:", err);
  }
};

test();
