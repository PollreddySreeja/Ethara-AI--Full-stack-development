# Product Requirements Document
## EdTech Learning Task Manager

---

### **Project Overview**

**Product Name:** EdTech Learning Task Manager  
**Target Role:** Full-Stack Developer (Fresher)  
**Duration:** 5-7 days  
**Tech Stack:** React, Node.js, Express, MongoDB

---

## **1. Product Vision**

A role-based task management system designed for educational environments, enabling students to manage their personal learning tasks while allowing teachers to oversee and support their assigned students' progress.

---

## **2. User Roles & Permissions**

### **2.1 Student**
- **Purpose:** Manage personal learning tasks
- **Permissions:**
  - Create, read, update, and delete only their own tasks
  - Must be assigned to a teacher during registration
  - View their assigned teacher's information

### **2.2 Teacher**
- **Purpose:** Oversee assigned students' learning progress
- **Permissions:**
  - View all tasks belonging to their assigned students
  - Create their own tasks
  - Update and delete only tasks they personally created
  - Cannot modify students' tasks

---

## **3. Core Features**

### **3.1 Authentication & Authorization**

#### **User Registration**
- Email and password-based signup
- Required fields:
  - Email (unique)
  - Password (hashed using bcrypt)
  - Role selection (student or teacher)
  - Teacher ID (mandatory for students)
- Validation:
  - Valid email format
  - Password strength requirements
  - Teacher ID must reference an existing teacher

#### **User Login**
- Email and password authentication
- JWT token generation on successful login
- Rate limiting to prevent brute force attacks
- Token expiration handling

#### **Authorization Middleware**
- JWT verification for all protected routes
- Role-based access control
- User ownership validation for task operations

---

### **3.2 Data Models**

#### **Users Collection**
```
{
  _id: ObjectId,
  email: String (unique, required),
  passwordHash: String (required),
  role: String (enum: ["student", "teacher"]),
  teacherId: ObjectId (required for students, references Users)
}
```

#### **Learning Tasks Collection**
```
{
  _id: ObjectId,
  userId: ObjectId (references Users),
  title: String (required),
  description: String (required),
  dueDate: Date (optional),
  progress: String (enum: ["not-started", "in-progress", "completed"]),
  createdAt: Date (auto-generated)
}
```

---

### **3.3 Backend API Endpoints**

#### **Authentication Routes**

| Method | Endpoint | Description | Auth Required | Validation |
|--------|----------|-------------|---------------|------------|
| POST | `/auth/signup` | Register new user | No | Email, password, role, teacherId (if student) |
| POST | `/auth/login` | Authenticate user | No | Email, password, rate limiting |

#### **Task Routes**

| Method | Endpoint | Description | Auth Required | Access Rules |
|--------|----------|-------------|---------------|--------------|
| GET | `/tasks` | Retrieve tasks | Yes | Students: own tasks only<br>Teachers: own tasks + assigned students' tasks |
| POST | `/tasks` | Create new task | Yes | userId must match logged-in user |
| PUT | `/tasks/:id` | Update task | Yes | Only task owner can update |
| DELETE | `/tasks/:id` | Delete task | Yes | Only task owner can delete |

#### **Request/Response Format**

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

### **3.4 Frontend Application**

#### **Required Pages**

**1. Signup Page**
- Email input field
- Password input field (with visibility toggle)
- Role selection (Student/Teacher radio buttons)
- Teacher selection dropdown (visible only for students)
- Submit button
- Link to login page

**2. Login Page**
- Email input field
- Password input field (with visibility toggle)
- Submit button
- Link to signup page

**3. Dashboard**
- **Header Section:**
  - User role display
  - Assigned teacher name/ID (for students)
  - Logout button

- **Task Management Section:**
  - Add new task button/form
  - Task list with the following for each task:
    - Title
    - Description
    - Due date (if set)
    - Progress status dropdown (not-started, in-progress, completed)
    - Edit button
    - Delete button
  
- **Filter Section:**
  - Progress filter (All, Not Started, In Progress, Completed)

#### **UI/UX Requirements**
- Clean, modern interface with intuitive navigation
- Responsive design for desktop and tablet
- Visual distinction between different progress states
- Loading states for async operations
- Error message display for failed operations
- Confirmation dialogs for destructive actions (delete)
- Form validation with inline error messages

---

## **4. Technical Requirements**

### **4.1 Security**
- Password hashing using bcrypt
- JWT-based authentication
- Secure token storage (localStorage)
- Protected API routes with middleware
- Input sanitization to prevent injection attacks
- Rate limiting on login endpoint

### **4.2 Validation**
- Backend: Use Joi or express-validator for all inputs
- Frontend: Client-side validation for better UX
- Validate:
  - Email format
  - Password strength
  - Required fields
  - Date formats
  - Enum values (role, progress)

### **4.3 Error Handling**
- Centralized error handling middleware in Express
- Consistent error response format
- Appropriate HTTP status codes
- User-friendly error messages on frontend
- Console logging for debugging

### **4.4 Code Quality**
- Meaningful variable and function names
- In-code comments explaining complex logic
- Modular code structure
- Separation of concerns (routes, controllers, middleware)
- DRY (Don't Repeat Yourself) principle

---

## **5. Optional Bonus Features**

Choose **one** if time permits:

1. **Date Filtering**
   - Filter tasks due this week
   - Show overdue tasks
   - Implement date range logic in API

2. **Pagination**
   - Paginate task list when exceeding 10 items
   - Particularly useful for teachers with many students

3. **Responsive UI**
   - Use Tailwind CSS or Bootstrap
   - Mobile-friendly design

4. **Deployment**
   - Deploy application on Render
   - Provide live demo URL

---

## **6. Deliverables**

### **6.1 Code Repository**
- GitHub repository with clear structure:
  - `/client` - React frontend
  - `/server` - Node.js/Express backend
- Multiple meaningful commits showing development progress
- `.gitignore` configured properly
- Environment variable template (`.env.example`)

### **6.2 Documentation**
- **README.md** including:
  - Project overview
  - Setup instructions (prerequisites, installation, configuration)
  - How to run the application
  - Explanation of role-based functionality
  - Teacher task-view logic explanation
  - AI assistance disclosure (if used)
  - Known issues or limitations
  - Future improvement suggestions

### **6.3 Video Walkthrough (5-10 minutes)**
Must demonstrate:
1. **Role-based behavior:**
   - Login as a teacher
   - Login as a student
   - Show restricted task visibility

2. **CRUD operations:**
   - Create a new task
   - Update task progress
   - Delete a task

3. **Code walkthrough:**
   - JWT validation middleware
   - Role-based authorization checks
   - Teacher-student association logic
   - GET `/tasks` query implementation

---

## **7. Success Criteria**

### **Must Have:**
- ✅ Users can register and login with role-based access
- ✅ Students can only manage their own tasks
- ✅ Teachers can view their students' tasks but only edit their own
- ✅ All CRUD operations work correctly
- ✅ JWT authentication protects all task routes
- ✅ Proper error handling and validation
- ✅ Clean, functional UI with progress filtering

### **Quality Indicators:**
- ✅ No exposed passwords or tokens in code
- ✅ Consistent code style and structure
- ✅ Clear comments on complex logic
- ✅ Meaningful commit messages
- ✅ Working application with no critical bugs

---

## **8. AI Usage Guidelines**

If AI tools are used:
- You must understand all submitted code
- Include a dedicated section in README: "AI Assistance"
  - Specify what AI helped with
  - Describe what you implemented or fixed independently
- Demonstrate understanding in video walkthrough

---

## **9. Evaluation Focus**

This project will be evaluated on:
1. **Correctness:** Features work as specified
2. **Security:** Proper authentication and authorization
3. **Code Quality:** Clean, maintainable, well-commented code
4. **Architecture:** Logical separation of concerns
5. **Error Handling:** Robust validation and error management
6. **Understanding:** Clear demonstration of concepts in video

**Note:** Partial implementation is acceptable if properly documented with explanations of what's missing and why.