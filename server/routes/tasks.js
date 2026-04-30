const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/auth");

router.use(protect);

const isMember = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, members: userId });
  return project;
};

// GET /tasks
router.get("/", async (req, res) => {
  try {
    const { projectId, status } = req.query;
    let filter = {};

    if (projectId) {
      const project = await isMember(projectId, req.user._id);
      if (!project) return res.status(403).json({ success: false, message: "Access denied." });
      filter.project = projectId;
    } else {
      const userProjects = await Project.find({ members: req.user._id }).select("_id");
      filter.project = { $in: userProjects.map((p) => p._id) };
    }

    if (status && status !== "all") filter.status = status;

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// GET /tasks/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const userProjects = await Project.find({ members: req.user._id }).select("_id name");
    const projectIds = userProjects.map((p) => p._id);
    const now = new Date();

    const [total, completed, inProgress, notStarted, overdue, myTasks] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: "completed" }),
      Task.countDocuments({ project: { $in: projectIds }, status: "in-progress" }),
      Task.countDocuments({ project: { $in: projectIds }, status: "not-started" }),
      Task.countDocuments({ project: { $in: projectIds }, status: { $ne: "completed" }, dueDate: { $lt: now } }),
      Task.countDocuments({ assignedTo: req.user._id }),
    ]);

    const overdueTasks = await Task.find({
      project: { $in: projectIds },
      status: { $ne: "completed" },
      dueDate: { $lt: now },
    }).populate("project", "name").populate("assignedTo", "name email").sort({ dueDate: 1 }).limit(5);

    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: { total, completed, inProgress, notStarted, overdue, myTasks },
        overdueTasks,
        recentTasks,
        projects: userProjects,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// POST /tasks
router.post("/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("projectId").notEmpty().withMessage("Project is required"),
    body("status").optional().isIn(["not-started", "in-progress", "completed"]),
    body("priority").optional().isIn(["low", "medium", "high"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });

    try {
      const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

      const project = await isMember(projectId, req.user._id);
      if (!project) return res.status(403).json({ success: false, message: "Access denied." });

      if (assignedTo) {
        const assignee = await isMember(projectId, assignedTo);
        if (!assignee) return res.status(400).json({ success: false, message: "Assigned user is not a project member." });
      }

      const task = await Task.create({
        title,
        description: description || "",
        project: projectId,
        assignedTo: assignedTo || null,
        createdBy: req.user._id,
        status: status || "not-started",
        priority: priority || "medium",
        dueDate: dueDate || null,
      });

      await task.populate("project", "name");
      await task.populate("assignedTo", "name email");
      await task.populate("createdBy", "name email");

      res.status(201).json({ success: true, data: task });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

// PUT /tasks/:id
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: "project",
      populate: { path: "admin", select: "_id" },
    });

    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    // Must be project member
    const project = await isMember(task.project._id, req.user._id);
    if (!project) return res.status(403).json({ success: false, message: "Access denied." });

    // RBAC: Only project admin or task creator can edit all fields. Members can only update status.
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isProjectAdmin = task.project.admin._id.toString() === req.user._id.toString();

    const { title, description, status, priority, assignedTo, dueDate } = req.body;

    if (isCreator || isProjectAdmin) {
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    } else {
      // Members can only track progress (update status)
      if (status) task.status = status;
    }

    await task.save();
    await task.populate("project", "name");
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    res.json({ success: true, data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: "project",
      populate: { path: "admin", select: "_id" },
    });

    if (!task) return res.status(404).json({ success: false, message: "Task not found." });

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isProjectAdmin = task.project.admin._id.toString() === req.user._id.toString();

    if (!isCreator && !isProjectAdmin) {
      return res.status(403).json({ success: false, message: "Only task creator or project admin can delete." });
    }

    await task.deleteOne();
    res.json({ success: true, data: { message: "Task deleted successfully." } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;