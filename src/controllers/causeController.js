const Cause = require("../models/Cause");

// POST /api/causes  (NGO only)
async function createCause(req, res) {
  try {
    const { title, description, requiredAmount, location, volunteersRequired } = req.body;

    if (!title || !description || !requiredAmount) {
      return res.status(400).json({ success: false, message: "title, description, requiredAmount are required" });
    }

    const cause = await Cause.create({
      title,
      description,
      requiredAmount,
      location,
      volunteersRequired,
      createdBy: req.user.id,
    });

    return res.status(201).json({ success: true, cause });
  } catch (err) {
    console.error("createCause err:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/causes  (public/volunteer/donor)
async function listCauses(req, res) {
  try {
    const causes = await Cause.find().sort({ createdAt: -1 }).populate("createdBy", "name email");
    return res.json({ success: true, causes });
  } catch (err) {
    console.error("listCauses err:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { createCause, listCauses };
