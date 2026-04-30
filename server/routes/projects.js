const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { protect, adminOnly } = require("../middleware/auth");

// All routes require auth
router.use(protect);

// GET /projects — get projects for the logged-in user
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate("admin", "name email")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    // Attach task counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const total = await Task.countDocuments({ project: project._id });
        const completed = await Task.countDocuments({ project: project._id, status: "completed" });
        const overdue = await Task.countDocuments({
          project: project._id,
          status: { $ne: "completed" },
          dueDate: { $lt: new Date() },
        });
        return { ...project.toJSON(), taskCounts: { total, completed, overdue } };
      })
    );

    res.json({ success: true, data: projectsWithCounts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /projects — create project (any authenticated user becomes admin)
router.post(
  "/",
  adminOnly,
  [
    body("name").trim().notEmpty().withMessage("Project name is required"),
    body("description").optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const { name, description } = req.body;
      const project = await Project.create({
        name,
        description,
        admin: req.user._id,
        members: [req.user._id],
      });

      await project.populate("admin", "name email");
      await project.populate("members", "name email role");

      res.status(201).json({ success: true, data: project });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

// GET /projects/:id — get single project
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      members: req.user._id,
    })
      .populate("admin", "name email")
      .populate("members", "name email role");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// PUT /projects/:id — update project (admin only)
router.put("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
    if (!project) {
      return res.status(403).json({ success: false, message: "Only project admin can update." });
    }

    const { name, description, status } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();
    await project.populate("admin", "name email");
    await project.populate("members", "name email role");

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE /projects/:id — delete project (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
    if (!project) {
      return res.status(403).json({ success: false, message: "Only project admin can delete." });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, data: { message: "Project deleted successfully." } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /projects/:id/members — add member by email (admin only)
router.post("/:id/members", async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
    if (!project) {
      return res.status(403).json({ success: false, message: "Only project admin can add members." });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: "No user found with that email." });
    }

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ success: false, message: "User is already a member." });
    }

    project.members.push(userToAdd._id);
    await project.save();
    await project.populate("admin", "name email");
    await project.populate("members", "name email role");

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE /projects/:id/members/:userId — remove member (admin only)
router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, admin: req.user._id });
    if (!project) {
      return res.status(403).json({ success: false, message: "Only project admin can remove members." });
    }

    if (req.params.userId === project.admin.toString()) {
      return res.status(400).json({ success: false, message: "Cannot remove the project admin." });
    }

    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();

    res.json({ success: true, data: { message: "Member removed." } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE /projects/:id/leave — member leaves project
router.delete("/:id/leave", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });

    if (project.admin.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "Admin cannot leave the project. Delete it instead." });
    }

    if (!project.members.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You are not a member of this project." });
    }

    project.members = project.members.filter((m) => m.toString() !== req.user._id.toString());
    await project.save();

    // Unassign tasks from this user in this project
    await Task.updateMany(
      { project: project._id, assignedTo: req.user._id },
      { assignedTo: null }
    );

    res.json({ success: true, data: { message: "Left project successfully." } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;