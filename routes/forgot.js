const express = require("express");
const crypto  = require("crypto");
const bcrypt  = require("bcryptjs");
const nodemailer = require("nodemailer");
const router  = express.Router();
const User    = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/* -------- SEND RESET EMAIL -------- */
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Please enter your email." });

    const user = await User.findOne({ email });

    if (!user) return res.json({ message: "If that email is registered, a reset link has been sent." });

    if (user.provider !== "local") {
      return res.json({ message: "This account uses Google or LinkedIn login — no password to reset." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken       = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.APP_URL}/reset.html?token=${token}`;

    await transporter.sendMail({
      from: `"Online Voting" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:30px;border-radius:12px;background:#f8fafc;border:1px solid #e2e8f0;">
          <h2 style="color:#334155;margin-top:0;">Password Reset</h2>
          <p style="color:#475569;">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetLink}" style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(135deg,#a5b4fc,#93c5fd);color:#1e293b;text-decoration:none;border-radius:999px;font-weight:600;font-size:15px;">Reset Password</a>
          <p style="color:#94a3b8;font-size:13px;">If you did not request this, ignore this email.</p>
        </div>
      `
    });

    res.json({ message: "✅ Reset link sent! Check your inbox." });
  } catch (e) {
    console.error("FORGOT:", e);
    res.status(500).json({ message: "Failed to send reset email. Try again." });
  }
});

/* -------- RESET PASSWORD -------- */
router.post("/reset/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Reset link is invalid or expired. Please request a new one." });

    user.password         = await bcrypt.hash(password, 10);
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (e) {
    console.error("RESET:", e);
    res.status(500).json({ message: "Password reset failed. Try again." });
  }
});

module.exports = router;
