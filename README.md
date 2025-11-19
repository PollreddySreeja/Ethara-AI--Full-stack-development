# EdTech Learning Task Manager

A full-stack role-based task management system designed for educational environments. Students can manage their personal learning tasks while teachers oversee their assigned students' progress.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Role-Based Functionality](#role-based-functionality)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Known Issues](#known-issues)
- [Future Improvements](#future-improvements)

## Overview

This application provides a secure, role-based task management platform for educational purposes. It features separate interfaces for students and teachers, with proper authentication and authorization controls.

## Features

### Authentication & Authorization
- Secure email/password based registration and login
- JWT-based authentication with token expiration handling
- Role-based access control (Student and Teacher roles)
- Password hashing using bcrypt
- Rate limiting to prevent brute-force attacks
- Input sanitization to prevent injection attacks

### Student Features
- Create, read, update, and delete personal tasks
- View assigned teacher information
- Filter tasks by progress status (Not Started, In Progress, Completed)
- Set due dates for tasks
- Visual progress indicators
- Automatic logout on token expiration

### Teacher Features
- View all tasks from assigned students
- Create personal tasks
- Update and delete only own tasks (read-only access to student tasks)
- Filter tasks by progress status
- See task ownership information
- Monitor student progress

### User Experience
- Clean, modern interface with intuitive navigation
- Responsive design for desktop and tablet
- Loading states for async operations
- Inline validation with clear error messages
- Confirmation dialogs for destructive actions
- Password visibility toggle
- Visual distinction between task progress states

## Tech Stack

**Frontend:**
- React.js
- Axios for API calls
- CSS for styling

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- express-mongo-sanitize for security

## Prerequisites

Before running this application, make sure you have:

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd edtech-learning-task-manager
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (see [Environment Variables](#environment-variables) section):

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
PORT=5000
```

**Important:** 
- Replace `your_mongodb_connection_string` with your actual MongoDB connection string
- Generate a strong random string for `JWT_SECRET` (use: `openssl rand -base64 32`)
- Never commit the `.env` file to version control

See `.env.example` for a template.

## Running the Application

### Development Mode

**Start Backend Server:**

```bash
cd server
node index.js
```

The server will run on `http://localhost:5000`

**Start Frontend Development Server:**

Open a new terminal window:

```bash
cd client
npm start
```

The React app will open in your browser at `http://localhost:3000`

### Production Mode

For production deployment, build the React app and serve it with your backend:

```bash
cd client
npm run build
# Configure your backend to serve the build folder
```

## Role-Based Functionality

### Student Role

**Permissions:**
- Create tasks for themselves only
- Read only their own tasks
- Update only their own tasks
- Delete only their own tasks
- View their assigned teacher's information

**Restrictions:**
- Cannot see other students' tasks
- Cannot modify other students' tasks
- Must be assigned to a teacher during registration

### Teacher Role

**Permissions:**
- View all tasks from students assigned to them
- View their own tasks
- Create tasks for themselves
- Update only their own tasks
- Delete only their own tasks

**Restrictions:**
- Cannot modify students' tasks (read-only access)
- Cannot delete students' tasks
- Can only see tasks from students who selected them as their teacher

### How Teacher-Student Association Works

1. **During Signup:** Students must select a teacher from the dropdown list
2. **Database Link:** The student's `teacherId` field references the teacher's user ID
3. **Task Retrieval:** When a teacher logs in and requests tasks:
   - Backend finds all students where `teacherId` matches the teacher's ID
   - Returns all tasks belonging to those students + teacher's own tasks
4. **Authorization:** Backend middleware validates ownership before allowing updates/deletes

**Code Implementation:**

```javascript
// In routes/tasks.js - GET /tasks endpoint
if (req.user.role === "teacher") {
  // Find all students assigned to this teacher
  const students = await User.find({ teacherId: req.user._id });
  const studentIds = students.map(s => s._id);
  
  // Fetch tasks for teacher + all their students
  const tasks = await Task.find({
    userId: { $in: [...studentIds, req.user._id] }
  });
}
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "teacherId": "teacher_id_here" // Required if role is student
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "User registered successfully"
  }
}
```

#### POST `/auth/login`
Authenticate a user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "student",
      "teacherId": "teacher_id"
    }
  }
}
```

### Task Endpoints

All task endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <token>
```

#### GET `/tasks?progress=all`
Get tasks based on user role
- Students: Returns their own tasks
- Teachers: Returns their tasks + all assigned students' tasks

**Query Parameters:**
- `progress` (optional): Filter by progress status (all, not-started, in-progress, completed)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_id",
      "title": "Complete assignment",
      "description": "Finish math homework",
      "progress": "in-progress",
      "dueDate": "2024-12-31",
      "userId": {
        "_id": "user_id",
        "email": "student@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST `/tasks`
Create a new task

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Task description",
  "progress": "not-started",
  "dueDate": "2024-12-31" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "task_id",
    "title": "Task title",
    "description": "Task description",
    "progress": "not-started",
    "dueDate": "2024-12-31",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/tasks/:id`
Update a task (only task owner)

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "progress": "completed",
  "dueDate": "2024-12-31"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated task object
  }
}
```

#### DELETE `/tasks/:id`
Delete a task (only task owner)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Task deleted successfully"
  }
}
```

### User Endpoints

#### GET `/users/teachers`
Get all teachers (for signup dropdown)
- Public endpoint, no authentication required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "teacher_id",
      "email": "teacher@example.com"
    }
  ]
}
```

#### GET `/users/:id`
Get user by ID (requires authentication)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "teacher"
  }
}
```

## Security Features

### Authentication & Authorization
- **JWT Tokens:** All protected routes require valid JWT token
- **Role-Based Access:** Middleware checks user roles before granting access
- **Ownership Validation:** Users can only modify their own resources

### Password Security
- **Hashing:** Passwords hashed using bcrypt with salt rounds
- **No Plain Text:** Passwords never stored or transmitted in plain text

### Attack Prevention
- **Rate Limiting:** Login endpoint limited to 5 attempts per 15 minutes per IP
- **Input Sanitization:** express-mongo-sanitize prevents NoSQL injection
- **Validation:** express-validator validates all inputs
- **Error Handling:** Generic error messages prevent information disclosure

### Best Practices
- Environment variables for secrets
- CORS configured for security
- Password strength requirements (min 6 characters)
- Token expiration (24 hours default)
- Secure HTTP headers

## Known Issues

1. **Session Persistence:** If the user refreshes the page, the application will lose the login state (can be fixed by storing token validation in App.js)
2. **No Password Reset:** Currently no forgot password functionality
3. **Email Verification:** No email verification on signup
4. **Responsive Mobile:** Mobile view needs optimization for smaller screens
5. **Real-time Updates:** No WebSocket support for real-time task updates

## Future Improvements

### High Priority
1. Add password reset/forgot password functionality
2. Implement email verification on signup
3. Add session persistence across page refreshes
4. Improve mobile responsiveness

### Medium Priority
5. Add pagination for task lists (important for teachers with many students)
6. Implement date filtering (overdue tasks, due this week)
7. Add search functionality for tasks
8. Export tasks to CSV/PDF
9. Add task categories/tags
10. Implement notifications for due dates

### Low Priority
11. Add profile management (change password, update email)
12. Implement dark mode
13. Add task statistics dashboard
14. Real-time updates using WebSockets
15. Add file attachments to tasks
16. Implement collaborative tasks
17. Add comments on tasks

## Project Structure

```
edtech-learning-task-manager/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── App.js        # Main app component
│       └── index.js      # Entry point
│
├── server/                # Node.js backend
│   ├── middleware/       # Auth and error middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── .env             # Environment variables (not in repo)
│   ├── .env.example     # Environment template
│   └── index.js         # Server entry point
│
└── README.md            # This file
```

## License

This project is for educational purposes.

## Contributing

This is a learning project. Feel free to fork and experiment!

## Support

For issues or questions, please create an issue in the GitHub repository.

