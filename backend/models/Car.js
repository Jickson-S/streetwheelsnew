const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
{
  carName: {
    type: String,
    required: [true, "Car name is required"],
    trim: true
  },

  brand: {
    type: String,
    required: [true, "Brand is required"],
    trim: true
  },

  fuelType: {
    type: String,
    required: [true, "Fuel type is required"],
    trim: true,
    enum: {
      values: ["Petrol", "Diesel", "Electric", "Hybrid"],
      message: "{VALUE} is not a valid fuel type"
    }
  },

  transmission: {
    type: String,
    required: [true, "Transmission type is required"],
    trim: true,
    enum: {
      values: ["Manual", "Automatic"],
      message: "{VALUE} is not a valid transmission"
    }
  },

  seats: {
    type: Number,
    required: [true, "Seats capacity is required"],
    min: [2, "Seats must be at least 2"],
    max: [10, "Seats cannot exceed 10"]
  },

  image: {
    type: String,
    trim: true,
    default: ""
  },

  pricePerDay: {
    type: Number,
    required: [true, "Rate per day is required"],
    min: [0, "Rate per day cannot be negative"]
  },

  available: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
});

// Indexes for faster filter combinations
carSchema.index({ brand: 1 });
carSchema.index({ fuelType: 1 });
carSchema.index({ available: 1 });

module.exports = mongoose.model("Car", carSchema);