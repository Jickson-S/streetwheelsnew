const express = require("express");
const Booking = require("../models/Booking");
const Car = require("../models/Car");
const auth = require("../middleware/auth.middleware");
const { sendMessage, selectBot } = require("../whatsappClients");

const router = express.Router();

router.post("/", auth, async (req, res) => {

  try {

    const {
      carId,
      pickupLocation,
      returnLocation,
      pickupDateTime,
      returnDateTime,
      destination
    } = req.body;

    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: "Car not found"
      });
    }

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Return date/time must be after pickup date/time"
      });
    }

    // Check for double booking
    const overlappingBooking = await Booking.findOne({
      carId,
      status: { $in: ["Pending", "Confirmed"] },
      pickupDateTime: { $lt: end },
      returnDateTime: { $gt: start }
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "Car is already booked for the selected date range"
      });
    }

    // calculate days
    const diffTime = end - start;

    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const totalPrice = totalDays * car.pricePerDay;

    const booking = await Booking.create({
      userId: req.user.userId,
      carId,
      pickupLocation,
      returnLocation,
      pickupDateTime,
      returnDateTime,
      destination,
      totalDays,
      pricePerDay: car.pricePerDay,
      totalPrice
    });

    // Send WhatsApp Alert (Try/catch to avoid failing booking request if bot is offline)
    try {
      const bot = selectBot(req.user.phone);
      const formattedPickup = new Date(pickupDateTime).toLocaleString();
      const formattedReturn = new Date(returnDateTime).toLocaleString();
      
      await sendMessage(
        bot,
        req.user.phone,
        `🚗 *Street Wheels Cars - Booking Request* 🚗\n\n` +
        `Your booking request for *${car.carName}* is received and pending approval.\n\n` +
        `📍 *Pickup:* ${pickupLocation} (${formattedPickup})\n` +
        `📍 *Return:* ${returnLocation} (${formattedReturn})\n` +
        `🏁 *Destination:* ${destination}\n` +
        `📅 *Duration:* ${totalDays} Day(s)\n` +
        `💰 *Estimated Total:* ₹${totalPrice}\n\n` +
        `We will notify you once the booking is confirmed by our admin!`
      );
    } catch (wsError) {
      console.warn("Failed to send WhatsApp booking alert:", wsError.message);
    }

    res.json({
      success: true,
      booking
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Booking failed: " + err.message
    });
  }
});

router.get("/my", auth, async (req, res) => {

  const bookings = await Booking.find({
    userId: req.user.userId
  })
  .populate("carId")
  .sort({ createdAt: -1 });

  res.json({
    success: true,
    bookings
  });
});

router.get("/:id", auth, async (req, res) => {

  const booking = await Booking.findById(req.params.id)
    .populate("carId")
    .populate("userId");

  res.json({
    success: true,
    booking
  });
});

router.get("/:id/trip", auth, async (req, res) => {
  try {
    const Trip = require("../models/Trip");
    const trip = await Trip.findOne({ bookingId: req.params.id });
    res.json({
      success: true,
      trip
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch trip logs: " + err.message
    });
  }
});

module.exports = router;