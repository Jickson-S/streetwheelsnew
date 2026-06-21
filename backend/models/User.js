const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },

  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,12}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number! (Must be 10-12 digits without country sign +)`
    }
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: "",
    validate: {
      validator: function(v) {
        if (!v) return true; // allow empty email initially
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },

  drivingLicense: {
    type: String,
    trim: true,
    default: ""
  },

  password: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: {
      values: ["customer", "admin"],
      message: "{VALUE} is not a valid role"
    },
    default: "customer"
  }
},
{
  timestamps: true
});

// Create index for faster search by phone (MongoDB unique index is automatically created, but we can document it)
userSchema.index({ phone: 1 });

module.exports = mongoose.model("User", userSchema);