# Full Stack Team Task Manager

A modern full-stack task management web application that enables teams to collaborate efficiently through project creation, task assignment, and real-time progress tracking. Built with a focus on scalability, clean UI, and secure role-based access control (RBAC).

## Live Demo

🔗 **Live URL:** https://sincere-nourishment-production.up.railway.app/

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Role-Based Access Control](#role-based-access-control)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## Overview

Team Task Manager is a secure platform for teams to collaborate on projects. It features role-based access control (Admin and Member), allowing project leaders to manage their team members and distribute tasks efficiently, while providing members a clear view of their assigned work and deadlines.

## Key Features

- **Authentication (Signup/Login):** Secure registration and login with JWT and bcrypt password hashing.
- **Project & Team Management:** Create projects, add/remove team members by email.
- **Task Creation, Assignment & Status Tracking:** Create tasks, assign them to members, track with statuses (not-started, in-progress, completed), priorities, and due dates.
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

**Database:**
- MongoDB with Mongoose ODM

**Other:**
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation
- express-mongo-sanitize for input sanitization

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/PollreddySreeja/Ethara-AI--Full-stack-development.git
cd Ethara-AI--Full-stack-development
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (see [Environment Variables](#environment-variables)) and start the server:

```bash
npm run dev
```

The server will run on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal window:

```bash
cd client
npm install
npm start
```

The React app will open at `http://localhost:3000`.

## Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
```

> `CLIENT_URL` is used by the backend's CORS configuration. It accepts a single origin or a comma-separated list of allowed origins (e.g. `https://your-frontend.up.railway.app,http://localhost:3000`).

### Frontend (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000
```

> In production, set `REACT_APP_API_URL` to your deployed backend URL (e.g. `https://your-backend.up.railway.app`). This value is baked in at build time, so the frontend must be rebuilt whenever it changes.

## Role-Based Access Control

### Admin

**Projects:**
- Can create new projects (if Global Role is `admin`).
- Can update and delete their projects.

**Members:**
- Can add existing users to their projects via email.
- Can remove members.

**Tasks:**
- Can create tasks, assign them to members, update any task details, and delete any task within their project.

### Member

**Projects:**
- Can view projects they have been added to by an Admin.
- Can leave a project at any time.

**Tasks:**
- Can view tasks within their projects.
- Can update the status of any task (track progress).
- Can edit all details of tasks they created.
- Cannot delete tasks unless they are the original creator.

## API Documentation

### Base URL

- Local development: `http://localhost:5000`
- Production: `https://ethara-ai-full-stack-development-production.up.railway.app`

> All endpoints are mounted directly at the root (no `/api` prefix).

### Auth Routes

| Method | Endpoint        | Description                                        |
| ------ | --------------- | -------------------------------------------------- |
| POST   | `/auth/signup`  | Register a new user (email, password, name, role)  |
| POST   | `/auth/login`   | Authenticate user and get JWT token                |
| GET    | `/auth/me`      | Get the currently authenticated user (Auth)        |

### Project Routes (Requires Auth)

| Method | Endpoint                              | Description                              |
| ------ | ------------------------------------- | ---------------------------------------- |
| GET    | `/projects`                           | Get all projects the user is part of     |
| POST   | `/projects`                           | Create a new project (User becomes Admin)|
| GET    | `/projects/:id`                       | Get details of a specific project        |
| PUT    | `/projects/:id`                       | Update project details (Admin only)      |
| DELETE | `/projects/:id`                       | Delete a project (Admin only)            |
| POST   | `/projects/:id/members`               | Add a member by email (Admin only)       |
| DELETE | `/projects/:id/members/:userId`       | Remove a member (Admin only)             |
| DELETE | `/projects/:id/leave`                 | Leave a project (Member only)            |

### Task Routes (Requires Auth)

| Method | Endpoint            | Description                                                  |
| ------ | ------------------- | ------------------------------------------------------------ |
| GET    | `/tasks`            | Get tasks (filterable by `projectId` and `status`)           |
| GET    | `/tasks/dashboard`  | Get dashboard stats (task counts, overdue, recent)           |
| POST   | `/tasks`            | Create a new task within a project                           |
| PUT    | `/tasks/:id`        | Update a task                                                |
| DELETE | `/tasks/:id`        | Delete a task (Task Creator or Project Admin only)           |

### User Routes (Requires Auth)

| Method | Endpoint   | Description                              |
| ------ | ---------- | ---------------------------------------- |
| GET    | `/users`   | Search users (supports `search` query)   |

### Health Check

| Method | Endpoint   | Description                  |
| ------ | ---------- | ---------------------------- |
| GET    | `/health`  | Returns `{ status: "ok" }`   |

## Deployment

This application is deployed on **Railway** as two separate services:

- **Backend:** Node.js / Express server connected to MongoDB Atlas.
- **Frontend:** React app built with `npm run build` and served as static files.

### To deploy your own instance

1. Push the code to a GitHub repository.
2. Create two services on Railway from the same repo (one for `server`, one for `client`), or deploy as a single service serving the React build from Express.
3. Set environment variables on the **backend** service:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (Railway provides this automatically)
   - `CLIENT_URL` — must include the deployed frontend origin (comma-separated if multiple), otherwise CORS preflight requests will be rejected.
4. Set environment variables on the **frontend** service:
   - `REACT_APP_API_URL` — the deployed backend URL (used at build time).
5. Deploy and visit your live URL.
