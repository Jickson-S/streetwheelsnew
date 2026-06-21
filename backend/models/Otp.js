const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
{
  phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true
  },
  
  code: {
    type: String,
    required: [true, "OTP code is required"],
    trim: true
  },

  expiresAt: {
    type: Date,
    required: [true, "Expiry timestamp is required"],
    expires: 0 // Native MongoDB TTL index (automatically deletes document when expiresAt passes)
  }
},
{
  timestamps: true
});

module.exports = mongoose.model("Otp", otpSchema);