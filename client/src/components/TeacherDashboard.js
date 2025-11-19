import React, { useState, useEffect } from "react";
import axios from "axios";

export default function TeacherDashboard({ onLogout }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [tasks, setTasks] = useState([]);
  const [filterProgress, setFilterProgress] = useState("all");
  
  // Form state for creating/editing tasks
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    progress: "not-started",
    dueDate: ""
  });

  // Load all tasks (teacher's own + students' tasks)
  const loadTasks = async () => {
    try {
      const url = `http://localhost:5000/tasks?progress=${filterProgress}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filterProgress]);

  // Handle creating a new task (creates for teacher)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/tasks",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and reload tasks
      setFormData({ title: "", description: "", progress: "not-started", dueDate: "" });
      setShowForm(false);
      loadTasks();
    } catch (e) {
      console.error("Failed to create task:", e);
      alert(e.response?.data?.message || "Failed to create task");
    }
  };

  // Handle editing a task (only if teacher owns it)
  const handleEditTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/tasks/${editingTask._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reset form and reload tasks
      setFormData({ title: "", description: "", progress: "not-started", dueDate: "" });
      setEditingTask(null);
      setShowForm(false);
      loadTasks();
    } catch (e) {
      console.error("Failed to update task:", e);
      alert(e.response?.data?.message || "Failed to update task");
    }
  };

  // Handle deleting a task (only if teacher owns it)
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadTasks();
    } catch (e) {
      console.error("Failed to delete task:", e);
      alert(e.response?.data?.message || "Failed to delete task. You can only delete your own tasks.");
    }
  };

  // Start editing a task (only teacher's own tasks)
  const startEdit = (task) => {
    // Check if teacher owns this task
    if (task.userId._id !== user.id) {
      alert("You can only edit your own tasks, not students' tasks.");
      return;
    }

    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      progress: task.progress,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
    setShowForm(true);
  };

  // Cancel form
  const cancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: "", description: "", progress: "not-started", dueDate: "" });
  };

  // Check if teacher owns a task
  const isOwnTask = (task) => {
    return task.userId._id === user.id;
  };

  return (
    <div style={{ padding: "25px" }}>
      <h1>Teacher Dashboard</h1>

      {/* User info and logout */}
      <div style={{ marginBottom: "20px" }}>
        <p><b>Logged in as:</b> Teacher ({user.email})</p>
        
        <button
          onClick={onLogout}
          style={{
            float: "right",
            background: "red",
            color: "white",
            padding: "7px 15px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>

      {/* Create task button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#0066ff",
            color: "white",
            padding: "10px 20px",
            borderRadius: "6px",
            marginBottom: "20px",
            cursor: "pointer"
          }}
        >
          + Create New Task
        </button>
      )}

      {/* Task form (create or edit) */}
      {showForm && (
        <div style={{
          background: "#f8f8f8",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "25px"
        }}>
          <h3>{editingTask ? "Edit Task" : "Create New Task"}</h3>
          <form onSubmit={editingTask ? handleEditTask : handleCreateTask}>
            <input
              type="text"
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            
            <textarea
              placeholder="Task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            
            <div style={{ marginBottom: "10px" }}>
              <label>Progress: </label>
              <select
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                style={{ marginLeft: "10px", padding: "5px" }}
              >
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div style={{ marginBottom: "10px" }}>
              <label>Due Date: </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                style={{ marginLeft: "10px", padding: "5px" }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                background: "#0066ff",
                color: "white",
                padding: "8px 20px",
                borderRadius: "6px",
                marginRight: "10px",
                cursor: "pointer"
              }}
            >
              {editingTask ? "Update Task" : "Create Task"}
            </button>
            
            <button
              type="button"
              onClick={cancelForm}
              style={{
                background: "#999",
                color: "white",
                padding: "8px 20px",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Progress filter */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>Filter by Progress:</label>
        <select
          value={filterProgress}
          onChange={(e) => setFilterProgress(e.target.value)}
          style={{ padding: "5px" }}
        >
          <option value="all">All</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <h2>All Tasks (Your Tasks + Students' Tasks)</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        Note: You can only edit and delete your own tasks. Students' tasks are read-only.
      </p>

      {/* Tasks table */}
      <table border="1" width="100%" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ padding: "10px" }}>Owner</th>
            <th style={{ padding: "10px" }}>Title</th>
            <th style={{ padding: "10px" }}>Description</th>
            <th style={{ padding: "10px" }}>Due Date</th>
            <th style={{ padding: "10px" }}>Progress</th>
            <th style={{ padding: "10px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No tasks found.
              </td>
            </tr>
          ) : (
            tasks.map((task) => {
              const owned = isOwnTask(task);
              return (
                <tr key={task._id} style={{ background: owned ? "#fff" : "#f9f9f9" }}>
                  <td style={{ padding: "10px" }}>
                    {task.userId.email}
                    {owned && <span style={{ color: "#0066ff", marginLeft: "5px" }}>(You)</span>}
                  </td>
                  <td style={{ padding: "10px" }}>{task.title}</td>
                  <td style={{ padding: "10px" }}>{task.description}</td>
                  <td style={{ padding: "10px" }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                  </td>
                  <td style={{ padding: "10px" }}>
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      background: 
                        task.progress === "completed" ? "#d4edda" :
                        task.progress === "in-progress" ? "#fff3cd" : "#f8d7da",
                      color:
                        task.progress === "completed" ? "#155724" :
                        task.progress === "in-progress" ? "#856404" : "#721c24"
                    }}>
                      {task.progress === "not-started" ? "Not Started" :
                       task.progress === "in-progress" ? "In Progress" : "Completed"}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    {owned ? (
                      <>
                        <button
                          onClick={() => startEdit(task)}
                          style={{
                            padding: "5px 12px",
                            background: "#0066ff",
                            color: "white",
                            borderRadius: "5px",
                            marginRight: "5px",
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          style={{
                            padding: "5px 12px",
                            background: "#dc3545",
                            color: "white",
                            borderRadius: "5px",
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>
                        View only
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
