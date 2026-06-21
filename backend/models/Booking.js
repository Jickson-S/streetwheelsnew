const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID reference is required"]
  },

  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: [true, "Car ID reference is required"]
  },

  pickupLocation: {
    type: String,
    required: [true, "Pickup location is required"],
    trim: true
  },

  returnLocation: {
    type: String,
    required: [true, "Return location is required"],
    trim: true
  },

  pickupDateTime: {
    type: Date,
    required: [true, "Pickup date & time is required"]
  },

  returnDateTime: {
    type: Date,
    required: [true, "Return date & time is required"]
  },

  destination: {
    type: String,
    trim: true,
    default: ""
  },

  totalDays: {
    type: Number,
    required: [true, "Total days is required"],
    min: [1, "Total days must be at least 1"]
  },

  pricePerDay: {
    type: Number,
    required: [true, "Price per day is required"],
    min: [0, "Price per day cannot be negative"]
  },

  totalPrice: {
    type: Number,
    required: [true, "Total price is required"],
    min: [0, "Total price cannot be negative"]
  },

  status: {
    type: String,
    enum: {
      values: ["Pending", "Confirmed", "Completed", "Cancelled"],
      message: "{VALUE} is not a valid status"
    },
    default: "Pending"
  }
},
{
  timestamps: true
});

// Optimization Indexes
bookingSchema.index({ userId: 1 });
bookingSchema.index({ carId: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);