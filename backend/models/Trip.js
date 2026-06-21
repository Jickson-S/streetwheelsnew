const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
{
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: [true, "Booking ID reference is required"]
  },

  startingKm: {
    type: Number,
    required: [true, "Starting Odometer reading is required"],
    min: [0, "Odometer readings cannot be negative"]
  },
  
  endingKm: {
    type: Number,
    required: [true, "Ending Odometer reading is required"],
    min: [0, "Odometer readings cannot be negative"]
  },

  totalKm: {
    type: Number,
    required: [true, "Total KM driven is required"],
    min: [0, "Total distance cannot be negative"]
  },

  timeIn: {
    type: Date,
    required: [true, "Trip start time (Time In) is required"]
  },

  timeOut: {
    type: Date,
    required: [true, "Trip end time (Time Out) is required"]
  },

  durationHours: {
    type: Number,
    required: [true, "Duration is required"],
    min: [0, "Duration hours cannot be negative"]
  },

  paymentWithoutToll: {
    type: Number,
    required: [true, "Payment amount excluding toll is required"],
    min: [0, "Payment cannot be negative"]
  },

  tollAmount: {
    type: Number,
    required: [true, "Toll amount is required"],
    min: [0, "Toll amount cannot be negative"]
  },

  totalPayment: {
    type: Number,
    required: [true, "Total trip payment is required"],
    min: [0, "Total payment cannot be negative"]
  },

  marginPayment: {
    type: Number,
    required: [true, "Margin payment amount is required"],
    min: [0, "Margin payment cannot be negative"]
  },

  remarks: {
    type: String,
    trim: true,
    default: ""
  }
},
{
  timestamps: true
});

// Index for query optimization
tripSchema.index({ bookingId: 1 });

module.exports = mongoose.model("Trip", tripSchema);