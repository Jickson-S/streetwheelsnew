const express = require("express");
const Car = require("../models/Car");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth.middleware");
const Review = require("../models/Review");

const router = express.Router();

/* =========================
   ADD CAR (ADMIN)
========================= */
router.post("/", upload.single("image"), async (req, res) => {

  try {

    const {
      carName,
      brand,
      fuelType,
      transmission,
      seats,
      pricePerDay
    } = req.body;

    const image = req.file ? req.file.filename : "";

    const car = await Car.create({
      carName,
      brand,
      fuelType,
      transmission,
      seats,
      pricePerDay,
      image
    });

    res.json({
      success: true,
      car
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error adding car"
    });
  }
});

/* =========================
   GET ALL CARS
========================= */
router.get("/", async (req, res) => {

  const cars = await Car.find();

  res.json({
    success: true,
    cars
  });
});

/* =========================
   GET AVAILABLE CARS (ZOOMCAR STYLE)
========================= */
router.get("/available", async (req, res) => {
  try {
    const { pickupDateTime, returnDateTime, brand, fuelType } = req.query;

    if (!pickupDateTime || !returnDateTime) {
      return res.status(400).json({
        success: false,
        message: "pickupDateTime and returnDateTime are required"
      });
    }

    const start = new Date(pickupDateTime);
    const end = new Date(returnDateTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "Return date must be after pickup date"
      });
    }

    // Find overlapping bookings
    const Booking = require("../models/Booking");
    const overlappingBookings = await Booking.find({
      status: { $in: ["Pending", "Confirmed"] },
      pickupDateTime: { $lt: end },
      returnDateTime: { $gt: start }
    }).select("carId");

    const blockedCarIds = overlappingBookings.map(b => b.carId);

    // Find all available cars
    const filter = {
      _id: { $nin: blockedCarIds },
      available: true
    };

    if (brand && brand !== "All") filter.brand = brand;
    if (fuelType && fuelType !== "All") filter.fuelType = fuelType;

    const cars = await Car.find(filter);

    res.json({
      success: true,
      cars
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching available cars: " + err.message
    });
  }
});

/* =========================
   GET SINGLE CAR
========================= */
router.get("/:id", async (req, res) => {

  const car = await Car.findById(req.params.id);

  res.json({
    success: true,
    car
  });
});

/* =========================
   SEARCH CARS
========================= */
router.get("/search/query", async (req, res) => {

  const { brand, fuelType } = req.query;

  const filter = {};

  if (brand) filter.brand = brand;
  if (fuelType) filter.fuelType = fuelType;

  const cars = await Car.find(filter);

  res.json({
    success: true,
    cars
  });
});

/* =========================
   RATINGS & REVIEWS
========================= */

// POST /api/cars/:id/reviews
router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const review = await Review.create({
      userId: req.user.userId,
      carId: req.params.id,
      rating: +rating,
      comment: comment || ""
    });

    res.json({
      success: true,
      review
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to post review: " + err.message
    });
  }
});

// GET /api/cars/:id/reviews
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ carId: req.params.id })
      .populate("userId", "name phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews: " + err.message
    });
  }
});

module.exports = router;