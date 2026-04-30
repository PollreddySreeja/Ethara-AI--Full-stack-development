# Video Walkthrough Script (2-5 Minutes)

## Before Recording Checklist

- [ ] Both servers running locally (backend on 5000, frontend on 3000) or Live Railway URL open
- [ ] MongoDB connected
- [ ] Ensure database is clean or has no conflicting users for the demo
- [ ] Browser window prepared
- [ ] Code editor open with key files (`routes/tasks.js`, `routes/projects.js`, `models/Project.js`) ready
- [ ] Screen recording software ready

---

## Part 1: Introduction (15 seconds)

**[SCREEN: Show the login/signup page]**

**SCRIPT:**
> "Hello! This is my submission for the Ethara AI Full-Stack Assessment. I have built the **Full Stack App**, a full-stack web application using the MERN stack. It features role-based access control with Admin and Member roles, allowing users to create projects, assign tasks, and track their progress."

---

## Part 2: User Registration & Role-Based Access (45 seconds)

### A. Register Admin Account

**[SCREEN: Click "Signup here"]**

**SCRIPT:**
> "First, I'll create an Admin account. This role will allow me to create projects and manage the team."

**ACTIONS:**
1. Enter name: `Admin User`
2. Enter email: `admin@example.com`
3. Enter password: `password123`
4. Select role: **Admin**
5. Click **Signup**

### B. Register Member Account

**[SCREEN: Show success message, then navigate back to signup]**

**SCRIPT:**
> "Next, I'll create a Member account to act as part of the team."

**ACTIONS:**
1. Enter name: `Team Member`
2. Enter email: `member@example.com`
3. Enter password: `password123`
4. Select role: **Member**
5. Click **Signup**

---

## Part 3: Project & Team Management (Admin Dashboard) (60 seconds)

**[SCREEN: Login as Admin]**

**ACTIONS:**
1. Login with: `admin@example.com` / `password123`

**SCRIPT:**
> "Logging in as the Admin, we see the dashboard. Currently, there are no tasks. Let's head to the Projects tab to set up a new project."

**ACTIONS:**
2. Click **Projects** tab.
3. Click **+ New Project**.
4. Enter Name: `Website Redesign`
5. Click **Create Project**.
6. Click **Open Project →** on the newly created project card.

**SCRIPT:**
> "As the project creator, I am automatically the project Admin. Now, I need to add my team member to this project so we can collaborate."

**ACTIONS:**
7. Under "Add Member", enter `member@example.com`.
8. Click **Add**.

**SCRIPT:**
> "The member has been successfully added to the project."

---

## Part 4: Task Creation, Assignment & Status Tracking (60 seconds)

**[SCREEN: Still in the Project view as Admin]**

**SCRIPT:**
> "Now I will assign a task to the team member."

**ACTIONS:**
1. Click **+ New Task**.
2. Title: `Design Homepage UI`
3. Priority: `High Priority`
4. Due Date: Pick a date in the past (to show overdue functionality) or a future date.
5. Assign To: Select `Team Member (member)` from dropdown.
6. Click **Create Task**.

**SCRIPT:**
> "The task is created under 'Not Started'. Now let me quickly log out and log back in as the Member to show their perspective."

**[SCREEN: Logout, then login as `member@example.com`]**

**ACTIONS:**
1. Log out.
2. Log in with `member@example.com` / `password123`.

**SCRIPT:**
> "As a member, my dashboard shows the tasks assigned to me, including any overdue tasks. When I open the project, I can see the task the Admin assigned to me."

**ACTIONS:**
3. Go to **Projects** -> Open the `Website Redesign` project.
4. On the task, change the status dropdown from `Not Started` to `In Progress`.

**SCRIPT:**
> "I can update the progress of my task. Notice that members can update tasks, but they cannot delete the project or add new members, demonstrating role-based access control."

---

## Part 5: Code Walkthrough (60 seconds)

**[SCREEN: Switch to VS Code]**

**SCRIPT:**
> "Let's briefly look at the code structure that makes this possible."

**[SCREEN: Open `server/routes/projects.js` or `server/routes/tasks.js`]**

**SCRIPT:**
> "For the role-based access control, the backend enforces strict validation. For example, in the project routes, when trying to add a member or delete a project, the API explicitly checks if the logged-in user's ID matches the `admin` field of the project document."

**[SCREEN: Show `server/models/Project.js`]**

**SCRIPT:**
> "This is managed through the Mongoose schemas. The Project schema maintains an `admin` reference and an array of `members`. The Task schema establishes clear relationships by referencing the Project, the User it's assigned to, and the Creator. This ensures proper relationships and data integrity."

---

## Part 6: Closing (15 seconds)

**[SCREEN: Back to the app dashboard or Railway Live URL]**

**SCRIPT:**
> "The application is fully deployed on Railway, utilizing Express REST APIs on the backend and React on the frontend. It successfully meets all requirements for Authentication, Project & Team Management, Task Tracking, and Role-Based Access Control. Thank you for watching!"

---
