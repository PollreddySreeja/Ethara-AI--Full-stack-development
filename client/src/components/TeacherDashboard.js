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
      // Handle new response format: { success: true, data: [...tasks] }
      setTasks(res.data.data);
    } catch (e) {
      console.error("Failed to load tasks:", e);
      // Handle token expiration
      if (e.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        onLogout();
      }
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
      // Handle token expiration
      if (e.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        onLogout();
      } else {
        alert(e.response?.data?.message || "Failed to create task");
      }
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
      // Handle token expiration
      if (e.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        onLogout();
      } else {
        alert(e.response?.data?.message || "Failed to update task");
      }
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
      // Handle token expiration
      if (e.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        onLogout();
      } else {
        alert(e.response?.data?.message || "Failed to delete task. You can only delete your own tasks.");
      }
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
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-title-section">
          <h1>Teacher Dashboard</h1>
          <div className="dashboard-user-info">
            <div>
              <strong>Logged in as:</strong> {user.email} (Teacher)
            </div>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <button onClick={onLogout} className="btn btn-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Create Task Button */}
      {!showForm && (
        <div className="mb-2">
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Create New Task
          </button>
        </div>
      )}

      {/* Task Form (create or edit) */}
      {showForm && (
        <div className="task-form">
          <h3 className="task-form-title">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h3>
          <form onSubmit={editingTask ? handleEditTask : handleCreateTask}>
            <div className="task-form-grid">
              {/* Task Title */}
              <input
                type="text"
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="form-input"
              />
              
              {/* Task Description */}
              <textarea
                placeholder="Task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              
              {/* Progress and Due Date Row */}
              <div className="task-form-row">
                <div className="form-group">
                  <label className="form-label">Progress:</label>
                  <select
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="form-select"
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Due Date:</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="task-form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
                <button type="button" onClick={cancelForm} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Progress Filter */}
      <div className="filter-section">
        <label className="filter-label">Filter by Progress:</label>
        <select
          value={filterProgress}
          onChange={(e) => setFilterProgress(e.target.value)}
          className="form-select"
        >
          <option value="all">All</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tasks Section */}
      <div className="card">
        <h2 className="card-title">All Tasks (Your Tasks + Students' Tasks)</h2>
        <p className="text-muted mb-2">
          Note: You can only edit and delete your own tasks. Students' tasks are read-only.
        </p>
        
        <div className="table-container">
          <table className="task-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Title</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const owned = isOwnTask(task);
                  return (
                    <tr key={task._id} className={owned ? '' : 'student-task'}>
                      <td>
                        {task.userId.email}
                        {owned && <span className="owner-badge">(You)</span>}
                      </td>
                      <td>{task.title}</td>
                      <td>{task.description}</td>
                      <td>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </td>
                      <td>
                        <span className={`status-badge ${task.progress}`}>
                          {task.progress === "not-started" ? "Not Started" :
                           task.progress === "in-progress" ? "In Progress" : "Completed"}
                        </span>
                      </td>
                      <td>
                        {owned ? (
                          <div className="table-actions">
                            <button
                              onClick={() => startEdit(task)}
                              className="btn btn-primary btn-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="view-only-text">
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
      </div>
    </div>
  );
}
