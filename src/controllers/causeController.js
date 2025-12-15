const Cause = require("../models/Cause");

// POST /api/causes  (NGO only)
async function createCause(req, res) {
  try {
    const {
      title,
      description,
      requiredAmount,
      location,
      volunteersRequired,
    } = req.body;

    if (!title || !description || !requiredAmount) {
      return res.status(400).json({
        success: false,
        message: "title, description, requiredAmount are required",
      });
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
    const causes = await Cause.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .populate("volunteers.user", "name email");
    return res.json({ success: true, causes });
  } catch (err) {
    console.error("listCauses err:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/causes/mine  (NGO dashboard)
async function listMyCauses(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const causes = await Cause.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("volunteers.user", "name email");

    return res.json({ success: true, causes });
  } catch (err) {
    console.error("listMyCauses err:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
}

// POST /api/causes/:id/volunteer  (volunteer joins a cause)
async function volunteerForCause(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const causeId = req.params.id;
    const cause = await Cause.findById(causeId);
    if (!cause) {
      return res
        .status(404)
        .json({ success: false, message: "Cause not found" });
    }

    const already =
      cause.volunteers &&
      cause.volunteers.some((v) => v.user.toString() === req.user.id);
    if (already) {
      return res.json({
        success: true,
        cause,
        message: "Already registered as volunteer",
      });
    }

    cause.volunteers.push({ user: req.user.id });
    await cause.save();

    return res.json({ success: true, cause });
  } catch (err) {
    console.error("volunteerForCause err:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
}

module.exports = {
  createCause,
  listCauses,
  listMyCauses,
  volunteerForCause,
};

