const mongoose = require("mongoose");

const calculationSchema = new mongoose.Schema(
  {
    // User who performed the calculation
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of calculator (EMI, SIP, SWP, etc.)
    calculationType: {
      type: String,
      required: true,
    },

    // Inputs entered by the user
    inputs: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // Final calculation result
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Calculation = mongoose.model("Calculation", calculationSchema);

module.exports = Calculation;