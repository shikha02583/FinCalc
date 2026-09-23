const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const calculationRoutes = require("./routes/calculationRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes (Signup & Login)
app.use("/api/auth", authRoutes);

// Calculation history routes
app.use("/api/calculations", calculationRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FinCalc backend is running!",
  });
});

// Protected Profile Route
app.get("/api/auth/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    userId: req.userId,
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 FinCalc server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
  });