const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// ---------------------------------------------------
// GET ALL TEACHERS (for signup dropdown)
// Public endpoint - no auth required
// ---------------------------------------------------
router.get("/teachers", async (req, res) => {
  try {
    // Find all users with teacher role, excluding password hash
    const teachers = await User.find({ role: "teacher" })
      .select("_id email")
      .sort({ email: 1 });
    
    res.json({ 
      success: true, 
      data: teachers 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// ---------------------------------------------------
// GET USER BY ID
// Used by students to fetch their teacher's info
// ---------------------------------------------------
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    res.json({ 
      success: true, 
      data: user 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// ---------------------------------------------------
// GET STUDENTS of the logged-in teacher
// Protected endpoint - requires auth
// ---------------------------------------------------
router.get("/my-students", authMiddleware, async (req, res) => {
  try {
    // Verify the user is a teacher
    if (req.user.role !== "teacher") {
      return res.status(403).json({ 
        success: false, 
        message: "Only teachers can access this endpoint" 
      });
    }

    const students = await User.find({ teacherId: req.user._id })
      .select("-passwordHash")
      .sort({ email: 1 });
    
    res.json({ 
      success: true, 
      data: students 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

module.exports = router;

