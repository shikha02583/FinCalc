const express = require("express");
const Calculation = require("../models/Calculation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST: Save a calculation
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { calculationType, inputs, result } = req.body;

    console.log("Incoming calculation:", req.body);
    console.log("Logged-in user ID:", req.userId);

    // Validate required fields
    if (
      !calculationType ||
      inputs === undefined ||
      result === undefined
    ) {
      return res.status(400).json({
        message: "Please provide calculationType, inputs, and result",
      });
    }

    // Save calculation for logged-in user
    const calculation = await Calculation.create({
      user: req.userId,
      calculationType,
      inputs,
      result,
    });

    res.status(201).json({
      message: "Calculation saved successfully",
      calculation,
    });
  } catch (error) {
    console.error("Save calculation error:", error.message);

    res.status(500).json({
      message: "Server error while saving calculation",
    });
  }
});

// GET: Fetch logged-in user's calculation history
router.get("/", authMiddleware, async (req, res) => {
  try {
    const calculations = await Calculation.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Calculation history fetched successfully",
      count: calculations.length,
      calculations,
    });
  } catch (error) {
    console.error("Fetch history error:", error.message);

    res.status(500).json({
      message: "Server error while fetching history",
    });
  }
});

// DELETE: Clear logged-in user's calculation history
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const result = await Calculation.deleteMany({
      user: req.userId,
    });

    res.status(200).json({
      message: "Calculation history cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear history error:", error.message);

    res.status(500).json({
      message: "Server error while clearing history",
    });
  }
});

module.exports = router;