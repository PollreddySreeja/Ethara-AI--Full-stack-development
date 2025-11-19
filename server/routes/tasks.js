const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// ---------------------------------------------------
// CREATE TASK
// ---------------------------------------------------
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, progress, dueDate } = req.body;

    // Security: Always use authenticated user's ID, never accept userId from request body
    const task = new Task({
      title,
      description,
      progress: progress || "not-started", // Default to not-started if not provided
      dueDate,
      userId: req.user._id, // Use authenticated user's ID
    });

    await task.save();
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ---------------------------------------------------
// GET TASKS  (UPDATED FULL VERSION)
// ---------------------------------------------------
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { progress } = req.query; // Changed from 'status' to 'progress'

    // -----------------------------
    // TEACHER: See own tasks + all student tasks
    // -----------------------------
    if (req.user.role === "teacher") {
      // Get all students assigned to this teacher
      const students = await User.find({ teacherId: req.user._id }).select("_id");
      const studentIds = students.map((s) => s._id);

      // Build filter: teacher's own tasks OR students' tasks
      const filter = {
        userId: { $in: [...studentIds, req.user._id] } // Include teacher's ID and all student IDs
      };
      
      // Apply progress filter if specified
      if (progress && progress !== "all") {
        filter.progress = progress;
      }

      const allTasks = await Task.find(filter)
        .sort({ createdAt: -1 })
        .populate("userId", "email role"); // Populate to show who owns each task

      return res.json(allTasks);
    }

    // -----------------------------
    // STUDENT: See own tasks only
    // -----------------------------
    const filter = { userId: req.user._id };
    if (progress && progress !== "all") {
      filter.progress = progress;
    }

    const userTasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "email");

    res.json(userTasks);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

// ---------------------------------------------------
// UPDATE TASK
// ---------------------------------------------------
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, progress, dueDate } = req.body;

    // Security: Check if task exists and user owns it
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only the task owner can update their task
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // Update the task with new values
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, progress, dueDate },
      { new: true, runValidators: true } // Run validators to ensure data integrity
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ---------------------------------------------------
// DELETE TASK
// ---------------------------------------------------
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Security: Check if task exists and user owns it
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only the task owner can delete their task
    if (task.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
