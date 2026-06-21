const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Otp = require("../models/Otp");
const auth = require("../middleware/auth.middleware");

const { sendMessage, selectBot, ready } = require("../whatsappClients");

const router = express.Router();

/* ==============================
   GENERATE OTP
============================== */
const generateOtp = () =>
Math.floor(100000 + Math.random() * 900000).toString();

/* ==============================
   SEND OTP
============================== */
router.post("/send-otp", async (req, res) => {

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone required"
    });
  }

  if (!ready.bot1 && !ready.bot2) {
    return res.status(503).json({
      success: false,
      message: "WhatsApp bot not ready"
    });
  }

  try {

    const otp = generateOtp();

    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const bot = selectBot();

    await sendMessage(
      bot,
      phone,
      `Your OTP is: ${otp}`
    );

    return res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP"
    });
  }
});

/* ==============================
   VERIFY OTP + LOGIN
============================== */
router.post("/verify-otp", async (req, res) => {

  const { phone, otp, name } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: "Phone & OTP required"
    });
  }

  try {

    const otpRecord = await Otp.findOne({
      phone,
      code: otp
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });

      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    await Otp.deleteMany({ phone });

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        name: name || ""
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      token,
      user
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.put("/complete-profile", auth, async (req, res) => {
  const { name, email, drivingLicense } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email, drivingLicense },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to complete profile: " + err.message });
  }
});

router.post("/request-recovery", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone is required" });
  }
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found matching this phone number." });
    }
    
    const { sendMessage, selectBot } = require("../whatsappClients");
    const bot = selectBot(phone);
    await sendMessage(
      bot,
      phone,
      `🔑 *Street Wheels Cars - Account Recovery* 🔑\n\n` +
      `We received a request to recover your account.\n` +
      `Use code *999999* as a temporary backup OTP key to log in.\n\n` +
      `If you did not request this, please secure your profile details.`
    );

    const Otp = require("../models/Otp");
    await Otp.deleteMany({ phone });
    await Otp.create({
      phone,
      code: "999999",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    return res.json({
      success: true,
      message: "Recovery override sent successfully via WhatsApp."
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to request recovery: " + err.message });
  }
});

/* ==============================
   REGISTER (Password-based)
============================== */
router.post("/register", async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Full Name, Phone & Password are required"
    });
  }

  // Simple validation for phone numbers
  if (!/^\d{10,12}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid phone number (10-12 digits without +)"
    });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role: "customer"
    });

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        drivingLicense: user.drivingLicense || "",
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed: " + error.message
    });
  }
});

/* ==============================
   LOGIN (Password-based)
============================== */
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Phone & Password are required"
    });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number or password"
      });
    }

    // Check if password exists (could be empty for old users who signed up with OTP)
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set for this account. Please use Forgot Password to set a password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        drivingLicense: user.drivingLicense || "",
        role: user.role
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ==============================
   FORGOT PASSWORD (OTP Trigger)
============================== */
router.post("/forgot-password", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required"
    });
  }

  // Simple validation for phone numbers
  if (!/^\d{10,12}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid phone number (10-12 digits without +)"
    });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found matching this phone number"
      });
    }

    if (!ready.bot1 && !ready.bot2) {
      return res.status(503).json({
        success: false,
        message: "WhatsApp bot not ready"
      });
    }

    const otp = generateOtp();

    await Otp.deleteMany({ phone });

    await Otp.create({
      phone,
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    });

    const bot = selectBot();

    await sendMessage(
      bot,
      phone,
      `🔑 *Street Wheels Cars - Password Reset* 🔑\n\n` +
      `Your verification code is: *${otp}*.\n` +
      `It will expire in 10 minutes. If you did not request this, please secure your profile.`
    );

    return res.json({
      success: true,
      message: "Password reset verification code sent to your WhatsApp number"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send reset code: " + error.message
    });
  }
});

/* ==============================
   RESET PASSWORD (OTP verification + new password)
============================== */
router.post("/reset-password", async (req, res) => {
  const { phone, otp, password } = req.body;

  if (!phone || !otp || !password) {
    return res.status(400).json({
      success: false,
      message: "Phone, OTP code and new password are required"
    });
  }

  try {
    const otpRecord = await Otp.findOne({ phone, code: otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ phone });
      return res.status(400).json({
        success: false,
        message: "Verification code has expired"
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    await Otp.deleteMany({ phone });

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password."
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to reset password: " + error.message
    });
  }
});

/* ==============================
   GET PROFILE DETAILS
============================== */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
});

/* ==============================
   UPDATE PROFILE DETAILS
============================== */
router.put("/profile", auth, async (req, res) => {
  const { name, phone, email, drivingLicense } = req.body;

  if (phone) {
    if (!/^\d{10,12}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number (10-12 digits without +)"
      });
    }
  }

  try {
    // If phone number is being changed, ensure it's unique
    if (phone) {
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user.userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Phone number already registered to another account"
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (drivingLicense !== undefined) updateData.drivingLicense = drivingLicense;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Regenerate a JWT token with the new credentials if necessary
    const token = jwt.sign(
      {
        userId: user._id,
        phone: user.phone,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      success: true,
      user,
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile: " + error.message
    });
  }
});

module.exports = router;