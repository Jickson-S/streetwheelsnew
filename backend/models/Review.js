const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"]
  },
  
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: [true, "Car ID is required"]
  },
  
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1 star"],
    max: [5, "Rating cannot exceed 5 stars"]
  },
  
  comment: {
    type: String,
    trim: true,
    default: ""
  }
},
{
  timestamps: true
});

// Indexes for review lookup on car details
reviewSchema.index({ carId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
