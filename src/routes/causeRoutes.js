const express = require("express");
const router = express.Router();
const {
  createCause,
  listCauses,
  listMyCauses,
  volunteerForCause,
} = require("../controllers/causeController");
const { verifyToken, authRole } = require("../middlewares/auth");

// NGO creates cause
router.post("/", verifyToken, authRole("ngo"), createCause);

// NGO dashboard: list own causes
router.get("/mine", verifyToken, authRole("ngo"), listMyCauses);

// volunteer joins a cause
router.post("/:id/volunteer", verifyToken, volunteerForCause);

// public list
router.get("/", listCauses);

module.exports = router;

