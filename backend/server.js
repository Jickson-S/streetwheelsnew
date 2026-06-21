require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const path = require("path");

const authRoutes = require("./routes/auth.routes");
const carRoutes = require("./routes/car.routes");
const bookingRoutes = require("./routes/booking.routes");
const adminRoutes = require("./routes/admin.routes");
const whatsappRoutes = require("./routes/whatsapp.routes");

const app = express();

/*
====================================
Database
====================================
*/
connectDB();

/*
====================================
Middlewares
====================================
*/
app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

/*
====================================
Test Route
====================================
*/
app.get("/", (req, res) => {

  res.json({
    success: true,
    message: "Car Rental API Running"
  });

});

app.use("/api/auth", authRoutes);

app.use("/api/cars", carRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/bookings", bookingRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/whatsapp", whatsappRoutes);

/*
====================================
Server
====================================
*/

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});