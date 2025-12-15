const mongoose = require("mongoose");

const causeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requiredAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  location: { type: String },
  volunteersRequired: { type: Number, default: 0 },
  volunteers: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now },
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // NGO who created
  status: { type: String, enum: ["active", "completed"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Cause", causeSchema);

