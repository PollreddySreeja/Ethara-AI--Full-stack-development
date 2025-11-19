const mongoose = require("mongoose");

// Task model aligned with PRD specifications
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // PRD specifies required
  progress: { // Changed from 'status' to 'progress' per PRD
    type: String,
    enum: ["not-started", "in-progress", "completed"], // Kebab-case per PRD
    default: "not-started"
  },
  dueDate: { type: Date }, // Optional per PRD
  userId: { // Changed from 'user' to 'userId' per PRD
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);



