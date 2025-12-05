const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: "Cause", required: true },
  amount: { type: Number, required: true },
  hash: { type: String },           // keccak256 hash
  onChainTx: { type: String },      // optional blockchain tx hash
  paymentGateway: {
    orderId: { type: String },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
    rawResponse: { type: Object }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Donation", donationSchema);
