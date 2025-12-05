const express = require("express");
const router = express.Router();
const { createCause, listCauses } = require("../controllers/causeController");
const { verifyToken, authRole } = require("../middlewares/auth");

// NGO creates cause
router.post("/", verifyToken, authRole("ngo"), createCause);

// public list
router.get("/", listCauses);

module.exports = router;
