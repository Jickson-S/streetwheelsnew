const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const { sendMessage, selectBot } = require("../whatsappClients");

const router = express.Router();

router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(400).json({
      success: false,
      message: "Admin not found"
    });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid password"
    });
  }

  const token = jwt.sign(
    {
      adminId: admin._id,
      role: "admin"
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  res.json({
    success: true,
    token
  });
});

router.get("/cars", async (req, res) => {

  const cars = await Car.find();

  res.json({
    success: true,
    cars
  });
});

router.delete("/cars/:id", async (req, res) => {

  await Car.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Car deleted"
  });
});

router.put("/cars/:id", async (req, res) => {

  const car = await Car.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({
    success: true,
    car
  });
});

router.get("/whatsapp-status", async (req, res) => {
  try {
    return res.json({
      success: true,
      data: getAllBotStatus()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get WhatsApp status"
    });
  }
});

router.post("/whatsapp-reconnect/:botName", async (req, res) => {
  const { botName } = req.params;

  if (!["bot1", "bot2"].includes(botName)) {
    return res.status(400).json({
      success: false,
      message: "Invalid bot name"
    });
  }

  try {
    const status = await reconnectBot(botName);
    return res.json({
      success: true,
      data: status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reconnect bot"
    });
  }
});

router.get("/bookings", async (req, res) => {

  const bookings = await Booking.find()
    .populate("userId")
    .populate("carId")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    bookings
  });
});

router.put("/bookings/:id", async (req, res) => {

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate("userId")
    .populate("carId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Send WhatsApp update if status changes to Confirmed or Cancelled
    if (booking.userId && booking.userId.phone && (booking.status === "Confirmed" || booking.status === "Cancelled")) {
      try {
        const bot = selectBot(booking.userId.phone);
        const statusEmoji = booking.status === "Confirmed" ? "✅" : "❌";
        const message = 
          `${statusEmoji} *Street Wheels Cars - Booking Update* ${statusEmoji}\n\n` +
          `Your booking for *${booking.carId ? booking.carId.carName : "Car"}* has been *${booking.status.toUpperCase()}*.\n\n` +
          `📍 *Pickup:* ${booking.pickupLocation}\n` +
          `📍 *Return:* ${booking.returnLocation}\n` +
          `💰 *Total Price:* ₹${booking.totalPrice}\n\n` +
          (booking.status === "Confirmed" 
            ? "Thank you for choosing Street Wheels Cars! Get ready for your ride." 
            : "If you have any questions or would like to select another car, please contact us.");

        await sendMessage(bot, booking.userId.phone, message);
      } catch (wsError) {
        console.warn("Failed to send WhatsApp booking status update alert:", wsError.message);
      }
    }

    res.json({
      success: true,
      booking
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update booking: " + err.message
    });
  }
});

router.post("/trip", async (req, res) => {
  const {
    bookingId,
    startingKm,
    endingKm,
    timeIn,
    timeOut,
    paymentWithoutToll,
    tollAmount,
    marginPayment,
    remarks
  } = req.body;

  const mongoose = require("mongoose");
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Booking ID format. Must be a 24-character hexadecimal ID."
    });
  }

  try {
    const Booking = require("../models/Booking");
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking ID not found in database records."
      });
    }

    const totalKm = endingKm - startingKm;
    const durationHours = (new Date(timeOut) - new Date(timeIn)) / (1000 * 60 * 60);
    const totalPayment = paymentWithoutToll + tollAmount;

    const Trip = require("../models/Trip");
    const trip = await Trip.create({
      bookingId,
      startingKm,
      endingKm,
      totalKm,
      timeIn,
      timeOut,
      durationHours,
      paymentWithoutToll,
      tollAmount,
      totalPayment,
      marginPayment,
      remarks
    });

    return res.json({
      success: true,
      trip
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to log trip record."
    });
  }
});

router.get("/trip", async (req, res) => {

  const trips = await require("../models/Trip").find().populate("bookingId");

  res.json({
    success: true,
    trips
  });
});

router.patch("/cars/:id/status", async (req, res) => {
  const { available } = req.body;
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }
    res.json({
      success: true,
      car
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle status: " + err.message
    });
  }
});

router.get("/users", async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({ role: "customer" }).sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load users: " + err.message
    });
  }
});

module.exports = router;