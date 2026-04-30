# Full Stack Team Task Manager

A full-stack web application where users can create projects, assign tasks, and track progress with **role-based access (Admin/Member)**. Built with the MERN stack.

## Live Demo

🔗 **Live URL:** [Team Task Manager on Railway](https://team-task-manager-production.up.railway.app)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Role-Based Access Control](#role-based-access-control)
- [API Documentation](#api-documentation)
- [AI Disclosure](#ai-disclosure)
- [Known Issues](#known-issues)
- [Deployment](#deployment)

## Overview

Team Task Manager is a secure platform for teams to collaborate on projects. It features role-based access control (Admin and Member), allowing project leaders to manage their team members and distribute tasks efficiently, while providing members a clear view of their assigned work and deadlines.

## Key Features

- **Authentication (Signup/Login):** Secure registration and login with JWT and bcrypt password hashing.
- **Project & Team Management:** Create projects, add/remove team members by email.
- **Task Creation, Assignment & Status Tracking:** Create tasks, assign them to members, track with statuses (`not-started`, `in-progress`, `completed`), priorities, and due dates.
- **Dashboard:** A central hub displaying task statistics — total, completed, in-progress, and overdue tasks.
- **Role-Based Access Control:** Differentiated permissions for Admins and Members.

## Tech Stack

**Frontend:**
- React.js
- Axios
- Vanilla CSS

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd team-task-manager
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (see [Environment Variables](#environment-variables)) and start the server:

```bash
npm start
```
The server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal window:

```bash
cd client
npm install
npm start
```
The React app will open at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key
```

## Role-Based Access Control

### Admin
- **Projects:** Can create new projects (if Global Role is "admin"). Can update and delete their projects.
- **Members:** Can add existing users to their projects via email. Can remove members.
- **Tasks:** Can create tasks, assign them to members, update any task details, and delete any task within their project.

### Member
- **Projects:** Can view projects they have been added to by an Admin. Can **leave** a project at any time.
- **Tasks:** Can view tasks within their projects. Can update the **status** of any task (track progress). Can edit all details of tasks they created. Cannot delete tasks unless they are the original creator.

## API Documentation

### Base URL
`http://localhost:5000/api`

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user (email, password, name, role) |
| POST | `/api/auth/login` | Authenticate user and get JWT token |

### Project Routes (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects the user is part of |
| POST | `/api/projects` | Create a new project (User becomes Admin) |
| GET | `/api/projects/:id` | Get details of a specific project |
| PUT | `/api/projects/:id` | Update project details (Admin only) |
| DELETE | `/api/projects/:id` | Delete a project (Admin only) |
| POST | `/api/projects/:id/members` | Add a member by email (Admin only) |
| DELETE | `/api/projects/:id/members/:userId` | Remove a member (Admin only) |
| DELETE | `/api/projects/:id/leave` | Leave a project (Member only) |

### Task Routes (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get tasks (filterable by `projectId` and `status`) |
| GET | `/api/tasks/dashboard` | Get dashboard stats (task counts, overdue, recent) |
| POST | `/api/tasks` | Create a new task within a project |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task (Task Creator or Project Admin only) |

## AI Disclosure

This project was developed with the assistance of AI coding assistants for code generation, refactoring, and documentation. All AI-generated code has been reviewed, modified, and tested by the developer to ensure it meets project requirements and security standards.

## Known Issues

- **Responsive Design:** The dashboard layout may not be fully optimized for very small mobile screens.
- **Password Reset:** Currently, there is no functionality for users to reset their password if forgotten.
- **Data Deletion Cascading:** If a user is deleted from the system, tasks assigned to them may still reference their ID instead of displaying "Unassigned".

## Deployment

This application is deployed on **Railway**.

- **Backend:** Node.js/Express server with MongoDB Atlas
- **Frontend:** React build served as static files

To deploy your own instance:
1. Push code to a GitHub repository
2. Connect the repository to Railway
3. Set environment variables (`MONGO_URI`, `JWT_SECRET`, `PORT`)
4. Deploy and get your live URL
