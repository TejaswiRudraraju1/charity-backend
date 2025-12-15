const express = require("express");
const router = express.Router();
const {
  createDonationIntent,
  verifyDonation,
  listMyDonations,
} = require("../controllers/donationController");
const { verifyToken } = require("../middlewares/auth");

// donor creates donation intent
router.post("/create", verifyToken, createDonationIntent);

// payment gateway callback / frontend verify
router.post("/verify", verifyDonation);

// donor donation history
router.get("/my", verifyToken, listMyDonations);

module.exports = router;

