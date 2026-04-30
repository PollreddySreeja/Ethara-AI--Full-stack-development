import React, { useState, useEffect } from "react";
import { getDashboard, getProjects, createProject, updateProject, updateTask, deleteTask, addMember, removeMember, deleteProject, leaveProject } from "../api";

function Dashboard({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // New project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });

  // New task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });

  // Edit task
  const [editingTask, setEditingTask] = useState(null);

  // Edit project
  const [editingProject, setEditingProject] = useState(null);

  // Add member
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMsg, setMemberMsg] = useState("");

  useEffect(() => { fetchDashboard(); fetchProjects(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setDashboard(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await createProject(projectForm);
      setProjects([res.data.data, ...projects]);
      setProjectForm({ name: "", description: "" });
      setShowProjectForm(false);
      setMsg("Project created!");
      fetchDashboard();
    } catch (err) { setMsg(err.response?.data?.message || "Failed to create project"); }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setTab("tasks");
    try {
      const { getTasks } = await import("../api");
      const res = await getTasks({ projectId: project._id });
      setTasks(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { createTask } = await import("../api");
      const res = await createTask({ ...taskForm, projectId: selectedProject._id });
      setTasks([res.data.data, ...tasks]);
      setTaskForm({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });
      setShowTaskForm(false);
      fetchDashboard();
    } catch (err) { setMsg(err.response?.data?.message || "Failed to create task"); }
  };

  const handleEditTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const { updateTask } = await import("../api");
      const payload = {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        dueDate: editingTask.dueDate || null,
        assignedTo: editingTask.assignedTo || null,
      };
      if (typeof payload.assignedTo === 'object' && payload.assignedTo !== null) {
        payload.assignedTo = payload.assignedTo._id;
      }
      const res = await updateTask(editingTask._id, payload);
      setTasks(tasks.map(t => t._id === editingTask._id ? res.data.data : t));
      setEditingTask(null);
      fetchDashboard();
      setMsg("Task updated successfully!");
    } catch (err) { setMsg(err.response?.data?.message || "Failed to update task"); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data.data : t));
      fetchDashboard();
    } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
      fetchDashboard();
    } catch (err) { console.error(err); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await addMember(selectedProject._id, memberEmail);
      setMemberMsg("Member added successfully!");
      setMemberEmail("");
      // Refresh projects and sync selectedProject with updated data
      const res = await getProjects();
      setProjects(res.data.data);
      const updated = res.data.data.find(p => p._id === selectedProject._id);
      if (updated) setSelectedProject(updated);
    } catch (err) { setMemberMsg(err.response?.data?.message || "Failed to add member"); }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await removeMember(selectedProject._id, memberId);
      setMemberMsg("Member removed successfully!");
      // Refresh projects and sync selectedProject with updated data
      const res = await getProjects();
      setProjects(res.data.data);
      const updated = res.data.data.find(p => p._id === selectedProject._id);
      if (updated) setSelectedProject(updated);
    } catch (err) { setMemberMsg(err.response?.data?.message || "Failed to remove member"); }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      await deleteProject(projectId);
      setMsg("Project deleted successfully.");
      setProjects(projects.filter(p => p._id !== projectId));
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
        setTab("projects");
      }
      fetchDashboard();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to delete project");
    }
  };

  const handleLeaveProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to leave this project?")) return;
    try {
      await leaveProject(projectId);
      setMsg("You have left the project.");
      setProjects(projects.filter(p => p._id !== projectId));
      if (selectedProject?._id === projectId) {
        setSelectedProject(null);
        setTab("projects");
      }
      fetchDashboard();
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to leave project");
    }
  };

  const handleEditProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editingProject.name,
        description: editingProject.description,
      };
      const res = await updateProject(editingProject._id, payload);
      
      setProjects(projects.map(p => p._id === editingProject._id ? { ...p, ...res.data.data } : p));
      if (selectedProject?._id === editingProject._id) {
        setSelectedProject({ ...selectedProject, ...res.data.data });
      }
      
      setEditingProject(null);
      setMsg("Project updated successfully!");
      fetchDashboard();
    } catch (err) { 
      setMsg(err.response?.data?.message || "Failed to update project"); 
    }
  };

  const statusColor = (status) => {
    if (status === "completed") return "#22c55e";
    if (status === "in-progress") return "#f59e0b";
    return "#6b7280";
  };

  const priorityColor = (priority) => {
    if (priority === "high") return "#ef4444";
    if (priority === "medium") return "#f59e0b";
    return "#22c55e";
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>🚀 Full Stack App</div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <button style={{ ...styles.navBtn, ...(tab === "dashboard" ? styles.navBtnActive : {}) }} onClick={() => setTab("dashboard")}>📊 Dashboard</button>
          <button style={{ ...styles.navBtn, ...(tab === "projects" ? styles.navBtnActive : {}) }} onClick={() => setTab("projects")}>📁 Projects</button>
          {selectedProject && (
            <button style={{ ...styles.navBtn, ...(tab === "tasks" ? styles.navBtnActive : {}) }} onClick={() => setTab("tasks")}>✅ Tasks</button>
          )}
        </nav>

        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {msg && <div style={styles.msgBanner}>{msg} <button onClick={() => setMsg("")} style={styles.closeBtn}>×</button></div>}

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && dashboard && (
          <div>
            <h1 style={styles.pageTitle}>Welcome back, {user?.name}! 👋</h1>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}><div style={styles.statNum}>{dashboard.stats.total}</div><div style={styles.statLabel}>Total Tasks</div></div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #22c55e" }}><div style={styles.statNum}>{dashboard.stats.completed}</div><div style={styles.statLabel}>Completed</div></div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}><div style={styles.statNum}>{dashboard.stats.inProgress}</div><div style={styles.statLabel}>In Progress</div></div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #ef4444" }}><div style={styles.statNum}>{dashboard.stats.overdue}</div><div style={styles.statLabel}>Overdue</div></div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #6366f1" }}><div style={styles.statNum}>{dashboard.projects.length}</div><div style={styles.statLabel}>Projects</div></div>
            </div>

            {dashboard.overdueTasks.length > 0 && (
              <div style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: "#ef4444" }}>⚠️ Overdue Tasks</h2>
                {dashboard.overdueTasks.map(task => (
                  <div key={task._id} style={styles.taskCard}>
                    <div style={styles.taskTitle}>{task.title}</div>
                    <div style={styles.taskMeta}>📁 {task.project?.name} • Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>🕐 Recent Tasks</h2>
              {dashboard.recentTasks.length === 0 ? (
                <p style={styles.empty}>No tasks yet. Create a project and add tasks!</p>
              ) : dashboard.recentTasks.map(task => (
                <div key={task._id} style={styles.taskCard}>
                  <div style={styles.taskTitle}>{task.title}</div>
                  <div style={styles.taskMeta}>
                    📁 {task.project?.name} •
                    <span style={{ color: statusColor(task.status), marginLeft: 6 }}>{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          <div>
            <div style={styles.pageHeader}>
              <h1 style={styles.pageTitle}>📁 Projects</h1>
              {user?.role === "admin" && (
                <button style={styles.primaryBtn} onClick={() => setShowProjectForm(!showProjectForm)}>+ New Project</button>
              )}
            </div>

            {showProjectForm && (
              <form onSubmit={handleCreateProject} style={styles.form}>
                <input style={styles.input} placeholder="Project Name *" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} required />
                <textarea style={styles.textarea} placeholder="Description (optional)" value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                <div style={styles.formBtns}>
                  <button type="submit" style={styles.primaryBtn}>Create Project</button>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowProjectForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {projects.length === 0 ? (
              <p style={styles.empty}>No projects yet. Create your first project!</p>
            ) : (
              <div style={styles.projectsGrid}>
                {projects.map(project => (
                  <div key={project._id} style={styles.projectCard}>
                    <div style={styles.projectName}>{project.name}</div>
                    <div style={styles.projectDesc}>{project.description || "No description"}</div>
                    <div style={styles.projectMeta}>
                      👑 {project.admin?.name} • 👥 {project.members?.length} members
                    </div>
                    <div style={styles.projectStats}>
                      <span>✅ {project.taskCounts?.completed}/{project.taskCounts?.total} tasks</span>
                      {project.taskCounts?.overdue > 0 && <span style={{ color: "#ef4444" }}>⚠️ {project.taskCounts.overdue} overdue</span>}
                    </div>
                    <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                      <button style={{ ...styles.primaryBtn, flex: 1 }} onClick={() => handleSelectProject(project)}>Open Project →</button>
                      {project.admin?._id === user?.id ? (
                        <>
                          <button style={{ ...styles.editBtn, padding: "10px", height: "auto" }} onClick={(e) => { e.stopPropagation(); setEditingProject(project); }} title="Edit Project">✏️</button>
                          <button style={{ ...styles.deleteBtn, padding: "10px", height: "auto" }} onClick={(e) => { e.stopPropagation(); handleDeleteProject(project._id); }} title="Delete Project">🗑️</button>
                        </>
                      ) : (
                        <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={(e) => { e.stopPropagation(); handleLeaveProject(project._id); }}>🚪 Leave</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TASKS TAB */}
        {tab === "tasks" && selectedProject && (
          <div>
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>✅ {selectedProject.name}</h1>
                <p style={styles.projectDesc}>👑 Admin: {selectedProject.admin?.name}</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {selectedProject.admin?._id === user?.id ? (
                  <>
                    <button style={{ ...styles.secondaryBtn, color: "#3b82f6", border: "1px solid #3b82f6", background: "transparent" }} onClick={() => setEditingProject({ ...selectedProject })}>✏️ Edit Project</button>
                    <button style={{ ...styles.secondaryBtn, color: "#ef4444", border: "1px solid #ef4444", background: "transparent" }} onClick={() => handleDeleteProject(selectedProject._id)}>🗑️ Delete Project</button>
                  </>
                ) : (
                  <button style={{ ...styles.secondaryBtn, color: "#64748b", border: "1px solid #64748b", background: "transparent" }} onClick={() => handleLeaveProject(selectedProject._id)}>🚪 Leave Project</button>
                )}
                <button style={styles.primaryBtn} onClick={() => setShowTaskForm(!showTaskForm)}>+ New Task</button>
              </div>
            </div>

            {/* Project Members Section */}
            <div style={styles.memberSection}>
              <h3 style={styles.sectionTitle}>👥 Project Members</h3>
              <div style={styles.membersList}>
                {selectedProject.members?.map(m => (
                  <span key={m._id} style={styles.memberChip}>
                    👤 {m.name} ({m.role})
                    {selectedProject.admin?._id === user?.id && m._id !== selectedProject.admin?._id && (
                      <button 
                        style={styles.removeMemberBtn} 
                        onClick={() => handleRemoveMember(m._id)}
                        title="Remove member"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add Member (admin only) */}
              {selectedProject.admin?._id === user?.id && (
                <div style={{ marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                  <h4 style={{ ...styles.sectionTitle, fontSize: 16 }}>Add New Member</h4>
                  <form onSubmit={handleAddMember} style={styles.memberForm}>
                    <input style={styles.input} placeholder="Member's email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required />
                    <button type="submit" style={styles.primaryBtn}>Add</button>
                  </form>
                  {memberMsg && <div style={styles.memberMsg}>{memberMsg}</div>}
                </div>
              )}
            </div>

            {/* Task Form */}
            {showTaskForm && (
              <form onSubmit={handleCreateTask} style={styles.form}>
                <input style={styles.input} placeholder="Task Title *" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                <textarea style={styles.textarea} placeholder="Description (optional)" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                <div style={styles.formRow}>
                  <select style={styles.select} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                  <input type="date" style={styles.input} value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
                <select style={styles.select} value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">-- Assign to member --</option>
                  {selectedProject.members?.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
                <div style={styles.formBtns}>
                  <button type="submit" style={styles.primaryBtn}>Create Task</button>
                  <button type="button" style={styles.secondaryBtn} onClick={() => setShowTaskForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <p style={styles.empty}>No tasks yet. Create your first task!</p>
            ) : (
              <div>
                {["not-started", "in-progress", "completed"].map(status => (
                  <div key={status} style={styles.section}>
                    <h2 style={{ ...styles.sectionTitle, color: statusColor(status) }}>
                      {status === "not-started" ? "⏳ Not Started" : status === "in-progress" ? "🔄 In Progress" : "✅ Completed"}
                      <span style={styles.count}>{tasks.filter(t => t.status === status).length}</span>
                    </h2>
                    {tasks.filter(t => t.status === status).map(task => (
                      <div key={task._id} style={styles.taskCard}>
                        <div style={styles.taskHeader}>
                          <div style={styles.taskTitle}>{task.title}</div>
                          <span style={{ ...styles.priorityBadge, background: priorityColor(task.priority) }}>{task.priority}</span>
                        </div>
                        {task.description && <div style={styles.taskDesc}>{task.description}</div>}
                        <div style={styles.taskMeta}>
                          {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                          {task.dueDate && <span style={{ color: new Date(task.dueDate) < new Date() && task.status !== "completed" ? "#ef4444" : "inherit" }}>📅 {new Date(task.dueDate).toLocaleDateString()}</span>}
                        </div>
                        <div style={styles.taskActions}>
                          <select style={styles.statusSelect} value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          {(selectedProject?.admin?._id === user?.id || task.createdBy?._id === user?.id) && (
                            <>
                              <button style={styles.editBtn} onClick={() => setEditingTask({...task, assignedTo: task.assignedTo?._id || task.assignedTo || ""})}>✏️ Edit</button>
                              <button style={styles.deleteBtn} onClick={() => handleDeleteTask(task._id)}>🗑️ Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Edit Task Modal */}
            {editingTask && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                  <h3 style={{ marginTop: 0, marginBottom: 16, color: "#1e293b" }}>✏️ Edit Task</h3>
                  <form onSubmit={handleEditTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input style={styles.input} placeholder="Task Title *" value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })} required />
                    <textarea style={styles.textarea} placeholder="Description (optional)" value={editingTask.description || ""} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })} />
                    <div style={styles.formRow}>
                      <select style={styles.select} value={editingTask.priority} onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}>
                        <option value="low">🟢 Low Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="high">🔴 High Priority</option>
                      </select>
                      <input type="date" style={styles.input} value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ""} onChange={e => setEditingTask({ ...editingTask, dueDate: e.target.value })} />
                    </div>
                    <select style={styles.select} value={editingTask.assignedTo || ""} onChange={e => setEditingTask({ ...editingTask, assignedTo: e.target.value })}>
                      <option value="">-- Assign to member --</option>
                      {selectedProject.members?.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                      ))}
                    </select>
                    <div style={{ ...styles.formBtns, marginTop: 8 }}>
                      <button type="submit" style={styles.primaryBtn}>Save Changes</button>
                      <button type="button" style={styles.secondaryBtn} onClick={() => setEditingTask(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Project Modal */}
            {editingProject && (
              <div style={styles.modalOverlay}>
                <div style={styles.modalContent}>
                  <h3 style={{ marginTop: 0, marginBottom: 16, color: "#1e293b" }}>✏️ Edit Project</h3>
                  <form onSubmit={handleEditProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input style={styles.input} placeholder="Project Name *" value={editingProject.name} onChange={e => setEditingProject({ ...editingProject, name: e.target.value })} required />
                    <textarea style={styles.textarea} placeholder="Description (optional)" value={editingProject.description || ""} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} />
                    <div style={{ ...styles.formBtns, marginTop: 8 }}>
                      <button type="submit" style={styles.primaryBtn}>Save Changes</button>
                      <button type="button" style={styles.secondaryBtn} onClick={() => setEditingProject(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f1f5f9" },
  sidebar: { width: 240, background: "#1e293b", color: "#fff", display: "flex", flexDirection: "column", padding: "24px 16px", position: "fixed", height: "100vh", overflowY: "auto" },
  logo: { fontSize: 20, fontWeight: 700, marginBottom: 32, color: "#6366f1" },
  userInfo: { display: "flex", alignItems: "center", gap: 12, marginBottom: 32, padding: "12px", background: "#334155", borderRadius: 8 },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 },
  userName: { fontWeight: 600, fontSize: 14 },
  userRole: { fontSize: 12, color: "#94a3b8", textTransform: "capitalize" },
  nav: { display: "flex", flexDirection: "column", gap: 8, flex: 1 },
  navBtn: { background: "transparent", border: "none", color: "#94a3b8", padding: "10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 14, transition: "all 0.2s" },
  navBtnActive: { background: "#6366f1", color: "#fff" },
  logoutBtn: { background: "#ef4444", border: "none", color: "#fff", padding: "10px 12px", borderRadius: 8, cursor: "pointer", fontSize: 14, marginTop: "auto" },
  main: { marginLeft: 240, flex: 1, padding: 32, maxWidth: "calc(100vw - 240px)" },
  pageTitle: { fontSize: 28, fontWeight: 700, color: "#1e293b", marginBottom: 8 },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 },
  statCard: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderTop: "4px solid #6366f1" },
  statNum: { fontSize: 36, fontWeight: 700, color: "#1e293b" },
  statLabel: { fontSize: 14, color: "#64748b", marginTop: 4 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 },
  count: { background: "#e2e8f0", borderRadius: 12, padding: "2px 8px", fontSize: 13, color: "#64748b" },
  taskCard: { background: "#fff", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  taskHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  taskTitle: { fontWeight: 600, color: "#1e293b", fontSize: 15 },
  taskDesc: { color: "#64748b", fontSize: 13, marginBottom: 8 },
  taskMeta: { display: "flex", gap: 16, fontSize: 13, color: "#64748b", marginBottom: 8 },
  taskActions: { display: "flex", gap: 8, alignItems: "center" },
  priorityBadge: { padding: "2px 8px", borderRadius: 12, color: "#fff", fontSize: 12, fontWeight: 600 },
  statusSelect: { padding: "4px 8px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 },
  editBtn: { background: "transparent", border: "1px solid #3b82f6", color: "#3b82f6", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  deleteBtn: { background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#fff", padding: 24, borderRadius: 12, width: "100%", maxWidth: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
  projectsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 },
  projectCard: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 8 },
  projectName: { fontSize: 18, fontWeight: 700, color: "#1e293b" },
  projectDesc: { fontSize: 13, color: "#64748b" },
  projectMeta: { fontSize: 13, color: "#94a3b8" },
  projectStats: { display: "flex", gap: 12, fontSize: 13 },
  form: { background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 12 },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formBtns: { display: "flex", gap: 8 },
  input: { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  textarea: { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", minHeight: 80, fontFamily: "inherit" },
  select: { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "#fff" },
  primaryBtn: { background: "#6366f1", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 },
  secondaryBtn: { background: "#e2e8f0", color: "#64748b", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: 14 },
  memberSection: { background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  memberForm: { display: "flex", gap: 8, marginBottom: 12 },
  memberMsg: { fontSize: 13, color: "#22c55e", marginBottom: 8 },
  membersList: { display: "flex", flexWrap: "wrap", gap: 8 },
  memberChip: { background: "#e0e7ff", color: "#4338ca", padding: "4px 12px", borderRadius: 20, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 },
  removeMemberBtn: { background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16, padding: 0, marginLeft: 2, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  empty: { color: "#94a3b8", fontSize: 15, textAlign: "center", padding: 40 },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: 20 },
  msgBanner: { background: "#dcfce7", color: "#166534", padding: "12px 16px", borderRadius: 8, marginBottom: 20, display: "flex", justifyContent: "space-between" },
  closeBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: 18 },
};

export default Dashboard;