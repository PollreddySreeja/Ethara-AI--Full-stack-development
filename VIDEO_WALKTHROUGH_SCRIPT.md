# Video Walkthrough Script (5-10 Minutes)

## Before Recording Checklist

- [ ] Both servers running (backend on 5000, frontend on 3000)
- [ ] MongoDB connected
- [ ] At least 1 teacher account created
- [ ] Browser window prepared
- [ ] Code editor open with key files ready
- [ ] Screen recording software ready

---

## Part 1: Introduction (30 seconds)

**[SCREEN: Show the login page]**

**SCRIPT:**
> "Hi! This is my EdTech Learning Task Manager application. It's a full-stack role-based task management system built with React, Node.js, Express, and MongoDB. The app has two main user roles: students and teachers, each with different permissions. Let me walk you through how it works."

---

## Part 2: User Registration & Role-Based Signup (1-2 minutes)

### A. Register Teacher Account

**[SCREEN: Click "Signup here"]**

**SCRIPT:**
> "First, let me create a teacher account."

**ACTIONS:**
1. Enter email: `teacher@example.com`
2. Enter password: `password123`
3. Select role: **Teacher**
4. Click **Signup**

**SCRIPT:**
> "Notice that teachers don't need to select another teacher. They're independent users."

**[SCREEN: Show success message, then redirect to login]**

---

### B. Register Student Account

**[SCREEN: Click "Signup here" again]**

**SCRIPT:**
> "Now let me create a student account. Watch what happens when I select the Student role."

**ACTIONS:**
1. Enter email: `student1@example.com`
2. Enter password: `password123`
3. Select role: **Student**

**SCRIPT:**
> "As soon as I select Student, a dropdown appears showing all available teachers. This is mandatory - every student must be assigned to a teacher. This is how the teacher-student relationship is established."

**ACTIONS:**
4. Select teacher: `teacher@example.com` from dropdown
5. Click **Signup**

**SCRIPT:**
> "The student is now registered and linked to the teacher."

---

## Part 3: Student Dashboard & CRUD Operations (2-3 minutes)

### A. Login as Student

**[SCREEN: Login page]**

**SCRIPT:**
> "Let me log in as the student I just created."

**ACTIONS:**
1. Enter: `student1@example.com`
2. Enter: `password123`
3. Click **Login**

**[SCREEN: Student Dashboard appears]**

**SCRIPT:**
> "This is the student dashboard. At the top, you can see I'm logged in as a student, and my assigned teacher is displayed here. Students can only see and manage their own tasks."

---

### B. Create Tasks

**SCRIPT:**
> "Let me create a few tasks to demonstrate the CRUD operations."

**ACTIONS:**
1. Click **"+ Create New Task"**
2. Fill in:
   - Title: `Complete Math Assignment`
   - Description: `Finish chapter 5 exercises`
   - Progress: `Not Started`
   - Due Date: `[Select a date]`
3. Click **Create Task**

**SCRIPT:**
> "Great, task created. Let me add one more."

**ACTIONS:**
4. Create another task:
   - Title: `Study for History Exam`
   - Description: `Review chapters 1-3`
   - Progress: `In Progress`
   - Due Date: `[Select a date]`
5. Click **Create Task**

**[SCREEN: Show both tasks in the table]**

---

### C. Update Task Progress

**SCRIPT:**
> "Now let me update the progress of a task."

**ACTIONS:**
1. Click **Edit** on the first task
2. Change Progress to: **In Progress**
3. Click **Update Task**

**[SCREEN: Show the updated progress badge color changing]**

**SCRIPT:**
> "Notice how the progress badge changes color. Red for Not Started, yellow for In Progress, and green when completed."

---

### D. Filter Tasks

**SCRIPT:**
> "I can filter tasks by their progress status."

**ACTIONS:**
1. Click the filter dropdown
2. Select **"In Progress"**

**[SCREEN: Show filtered results]**

**SCRIPT:**
> "Now I only see tasks that are in progress. Let me reset this filter."

**ACTIONS:**
3. Select **"All"** from dropdown

---

### E. Delete Task

**SCRIPT:**
> "And if I need to delete a task..."

**ACTIONS:**
1. Click **Delete** on one task
2. Confirm deletion in the dialog

**SCRIPT:**
> "Notice the confirmation dialog. This prevents accidental deletions."

---

### F. Logout

**ACTIONS:**
1. Click **Logout** button

**SCRIPT:**
> "Now let me log out and show you the teacher's perspective."

---

## Part 4: Teacher Dashboard & Role-Based Permissions (2-3 minutes)

### A. Login as Teacher

**[SCREEN: Login page]**

**SCRIPT:**
> "Let me log in as the teacher account."

**ACTIONS:**
1. Login with: `teacher@example.com` / `password123`

**[SCREEN: Teacher Dashboard]**

**SCRIPT:**
> "This is the teacher dashboard. Notice it says 'Teacher' at the top. Now here's the key difference: teachers can see not only their own tasks, but also all tasks from students who are assigned to them."

---

### B. Show Student Tasks Visibility

**[SCREEN: Point to the task table]**

**SCRIPT:**
> "See this 'Owner' column? It shows who owns each task. The student tasks I created earlier are visible here, marked with the student's email. Tasks I create show 'You' next to my email."

---

### C. Create Teacher Task

**SCRIPT:**
> "Let me create a task as the teacher."

**ACTIONS:**
1. Click **"+ Create New Task"**
2. Fill in:
   - Title: `Prepare Lesson Plan`
   - Description: `Create slides for next week`
   - Progress: `Not Started`
   - Due Date: `[Select date]`
3. Click **Create Task**

**[SCREEN: Show the new task with "(You)" indicator]**

---

### D. Demonstrate Read-Only Access to Student Tasks

**SCRIPT:**
> "Now here's the important security feature. Watch what happens when I try to edit a student's task."

**ACTIONS:**
1. Click **Edit** on a student's task

**[SCREEN: Show the alert/error message]**

**SCRIPT:**
> "I get an error message saying 'You can only edit your own tasks, not students' tasks.' This is enforced both on the frontend and backend."

**ACTIONS:**
2. Click **OK** to dismiss alert
3. Now click **Edit** on the teacher's own task
4. Successfully edit and save

**SCRIPT:**
> "But when I edit my own task, it works fine. The same restriction applies to deleting tasks - teachers can only delete their own tasks."

---

### E. Filter Functionality for Teachers

**SCRIPT:**
> "Teachers can also filter tasks by progress, which is especially useful when managing many students."

**ACTIONS:**
1. Use the filter dropdown to show different progress states

---

## Part 5: Code Walkthrough (2-3 minutes)

**[SCREEN: Switch to VS Code]**

**SCRIPT:**
> "Now let me show you how this is implemented in the code."

---

### A. JWT Validation Middleware

**[SCREEN: Open `server/middleware/auth.js`]**

**SCRIPT:**
> "First, let's look at the authentication middleware. This file handles JWT token validation."

**POINT TO CODE:**
```javascript
const token = authHeader.split(" ")[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**SCRIPT:**
> "Every protected route passes through this middleware. It extracts the JWT token from the request header, verifies it using the secret key, and attaches the user object to the request. If the token is invalid or expired, it returns a 401 Unauthorized error."

---

### B. Role-Based Authorization - GET Tasks

**[SCREEN: Open `server/routes/tasks.js`]**

**SCRIPT:**
> "Now let's look at the most important route: getting tasks. This is where role-based authorization happens."

**POINT TO CODE:**
```javascript
if (req.user.role === "teacher") {
  const students = await User.find({ teacherId: req.user._id });
  const studentIds = students.map(s => s._id);
  const filter = {
    userId: { $in: [...studentIds, req.user._id] }
  };
}
```

**SCRIPT:**
> "When a teacher requests tasks, the code first finds all students whose teacherId matches the logged-in teacher's ID. Then it creates a MongoDB query that fetches tasks where the userId is either the teacher's ID or any of their students' IDs. This is how teachers see all relevant tasks in one view."

**SCRIPT:**
> "For students, it's simpler - they just see their own tasks."

---

### C. Ownership Validation - Update Task

**[SCREEN: Scroll to the PUT endpoint in `tasks.js`]**

**POINT TO CODE:**
```javascript
if (task.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ 
    success: false, 
    message: "Not authorized to update this task" 
  });
}
```

**SCRIPT:**
> "Before allowing any update or delete operation, the backend checks if the task's userId matches the logged-in user's ID. If not, it returns a 403 Forbidden error. This ensures users can only modify their own tasks, regardless of their role."

---

### D. Teacher-Student Association

**[SCREEN: Open `server/models/User.js`]**

**POINT TO CODE:**
```javascript
teacherId: { type: Schema.Types.ObjectId, ref: "User" }
```

**SCRIPT:**
> "The teacher-student relationship is stored in the User model. When a student signs up, their teacherId field stores a reference to their teacher's user ID. This creates a one-to-many relationship: one teacher can have many students."

**[SCREEN: Open `server/routes/auth.js` - signup validation]**

**POINT TO CODE:**
```javascript
if (role === "student") {
  if (!teacherId) {
    return res.status(400).json({ message: "teacherId required for students" });
  }
  // Verify teacher exists and is actually a teacher
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== "teacher") {
    return res.status(400).json({ message: "Invalid teacher" });
  }
}
```

**SCRIPT:**
> "During signup, the backend validates that students provide a teacher ID and that it references an actual teacher account. This prevents orphaned students or invalid relationships."

---

## Part 6: Security Features (30-45 seconds)

**[SCREEN: Can stay on code or switch to a summary slide]**

**SCRIPT:**
> "Let me quickly highlight the security features implemented:

1. **Password Security:** All passwords are hashed using bcrypt before storage - they're never stored in plain text.

2. **Rate Limiting:** The login endpoint has rate limiting to prevent brute-force attacks - 5 attempts per IP address per 15 minutes.

3. **Input Sanitization:** I'm using express-mongo-sanitize to prevent NoSQL injection attacks.

4. **Token Expiration:** JWT tokens expire after 24 hours, and the frontend automatically logs users out when tokens expire.

5. **Validation:** All inputs are validated on both frontend and backend using express-validator.

6. **Consistent API Format:** All API responses follow a standard format with success flags and proper error messages."

---

## Part 7: Closing (30 seconds)

**[SCREEN: Back to the application or a closing slide]**

**SCRIPT:**
> "So to summarize: this application demonstrates role-based access control, secure authentication with JWT, proper authorization checks, and a clean separation between student and teacher functionalities. The backend enforces all security rules, while the frontend provides a user-friendly interface with real-time validation.

Thank you for watching! The complete code is available in the repository with comprehensive documentation."

---

## Recording Tips

1. **Screen Setup:**
   - Close unnecessary tabs/applications
   - Use incognito mode for clean browser
   - Set zoom to 100% or 125% for readability
   - Use a simple desktop background

2. **Audio:**
   - Test microphone before recording
   - Speak clearly and at moderate pace
   - Reduce background noise
   - You can pause between sections and edit later

3. **Visual Clarity:**
   - Highlight cursor or use a cursor highlighter tool
   - When showing code, zoom in so it's readable
   - Pause for 2-3 seconds after showing important information
   - Use mouse to point at specific code lines or UI elements

4. **Time Management:**
   - Practice once before final recording
   - Each section has estimated times - stay within them
   - Don't rush through the code walkthrough
   - It's okay to go slightly over 10 minutes if needed

5. **Common Mistakes to Avoid:**
   - Don't say "um" or "uh" - pause silently instead
   - Don't apologize for code - be confident
   - Don't skip the security features section
   - Don't forget to show the confirmation dialog
   - Make sure tasks are visible in the teacher dashboard

6. **Editing (Optional):**
   - Cut out long pauses or mistakes
   - Add text overlays for key points
   - Speed up repetitive actions (2nd task creation)
   - Add chapter markers for easy navigation

---

## Post-Recording Checklist

- [ ] Video is 5-10 minutes long
- [ ] Audio is clear and understandable
- [ ] All required features demonstrated:
  - [ ] Role-based signup (teacher vs student)
  - [ ] Student CRUD operations
  - [ ] Teacher viewing student tasks
  - [ ] Authorization restrictions (teacher can't edit student tasks)
  - [ ] JWT middleware explanation
  - [ ] Role-based GET /tasks logic
  - [ ] Teacher-student association code
- [ ] Code is readable when shown
- [ ] No sensitive information visible (passwords, API keys, etc.)
- [ ] Video file exported in common format (MP4, MOV)

---

## Quick Reference: Test Accounts

Create these BEFORE recording:

**Teacher Account:**
- Email: `teacher@example.com`
- Password: `password123`
- Role: Teacher

**Student Account:**
- Email: `student1@example.com`
- Password: `password123`
- Role: Student
- Teacher: Select `teacher@example.com`

*Optional: Create a 2nd student for more realistic demo*

---

## Alternative Structure (if time is tight)

If you need to keep it under 7 minutes:

1. **Introduction** (20s)
2. **Quick Signup Demo** (1 min) - Just show student signup with teacher selection
3. **Student Dashboard** (2 min) - Create 1 task, edit it, show filter, delete it
4. **Teacher Dashboard** (1.5 min) - Login, show student tasks, show edit restriction, create own task
5. **Code Walkthrough** (2 min) - Focus on GET /tasks logic and ownership validation only
6. **Closing** (20s)

---

## Upload Instructions

Once recorded:
1. Upload to YouTube, Google Drive, or Vimeo
2. Ensure video is public or unlisted (not private)
3. Add the video link to your README.md
4. Test the link in an incognito window

---

Good luck with your recording! 🎥

