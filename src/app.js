const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*", // Allow all origins in dev, set specific in production
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get("/", (req, res) =>
  res.json({ success: true, msg: "charity-backend alive" })
);

// routes
const authRoutes = require("./routes/authRoutes"); // /api/auth
const protectedRoutes = require("./routes/protected"); // /api/protected
const causeRoutes = require("./routes/causeRoutes");
const donationRoutes = require("./routes/donationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/causes", causeRoutes);
app.use("/api/donations", donationRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(500)
    .json({ success: false, message: err.message || "Server error" });
});

module.exports = app;

