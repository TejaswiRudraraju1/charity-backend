const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");

router.get("/me", verifyToken, async (req, res) => {
  return res.json({ success:true, user: req.user });
});

module.exports = router;
