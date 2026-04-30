const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

router.use(protect);

// GET /users — get all users (for member search/invite)
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let filter = { _id: { $ne: req.user._id } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter).select("name email role").limit(20);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;