const Donation = require("../models/Donation");
const keccak256 = require("keccak256");
const { recordDonationOnChain } = require("../services/blockchainService");

// POST /api/donations/create  (donor, authenticated)
async function createDonationIntent(req, res) {
  try {
    const { causeId, amount } = req.body;
    if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
    if (!causeId || !amount) return res.status(400).json({ success: false, message: "causeId and amount required" });

    const orderId = "order_" + Date.now();

    const donation = await Donation.create({
      donorId: req.user.id,
      causeId,
      amount,
      paymentGateway: { orderId, status: "PENDING" }
    });

    return res.json({
      success: true,
      payment: { orderId, provider: "paytm" },
      donationId: donation._id
    });
  } catch (err) {
    console.error("createDonationIntent err:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/donations/verify  (Paytm callback / simulated)
async function verifyDonation(req, res) {
  try {
    const { donationId, status, txDetails } = req.body;
    const donation = await Donation.findById(donationId).populate("causeId");
    if (!donation) return res.status(404).json({ success: false, message: "Donation not found" });

    donation.paymentGateway.rawResponse = txDetails || {};
    donation.paymentGateway.status = status || "FAILED";

    if (status === "SUCCESS") {
      // compute keccak256 hash of donation summary
      const toHash = JSON.stringify({
        donationId: donation._id.toString(),
        donorId: donation.donorId.toString(),
        causeId: donation.causeId.toString(),
        amount: donation.amount,
        createdAt: donation.createdAt.toISOString()
      });

      const hash = "0x" + keccak256(Buffer.from(toHash)).toString("hex");
      donation.hash = hash;

      // Update cause's currentAmount
      if (donation.causeId) {
        donation.causeId.currentAmount = (donation.causeId.currentAmount || 0) + donation.amount;
        await donation.causeId.save();
      }

      // Best-effort on-chain record
      try {
        const txHash = await recordDonationOnChain({
          entityId: donation._id.toString(),
          hash,
        });
        if (txHash) {
          donation.onChainTx = txHash;
        }
      } catch (chainErr) {
        console.error("On-chain record failed:", chainErr.message);
      }
    }

    await donation.save();
    return res.json({ success: true, donation });
  } catch (err) {
    console.error("verifyDonation err:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/donations/my  (authenticated user - donor history)
async function listMyDonations(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const donations = await Donation.find({ donorId: req.user.id })
      .sort({ createdAt: -1 })
      .populate("causeId", "title description");

    return res.json({ success: true, donations });
  } catch (err) {
    console.error("listMyDonations err:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
}

module.exports = { createDonationIntent, verifyDonation, listMyDonations };

