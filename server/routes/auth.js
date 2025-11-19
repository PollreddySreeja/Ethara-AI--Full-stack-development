const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// Simple rate limiting implementation
// Tracks login attempts per IP address
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Rate limiting middleware for login
const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  // Get or initialize attempt data for this IP
  let attemptData = loginAttempts.get(ip);
  
  if (!attemptData) {
    attemptData = { count: 0, resetTime: now + WINDOW_MS };
    loginAttempts.set(ip, attemptData);
  }
  
  // Reset if window has passed
  if (now > attemptData.resetTime) {
    attemptData.count = 0;
    attemptData.resetTime = now + WINDOW_MS;
  }
  
  // Check if limit exceeded
  if (attemptData.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((attemptData.resetTime - now) / 1000 / 60);
    return res.status(429).json({ 
      message: `Too many login attempts. Please try again in ${remainingTime} minutes.` 
    });
  }
  
  // Increment attempt count
  attemptData.count++;
  next();
};

// Signup
router.post(
  "/signup",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["student", "teacher"])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role, teacherId } = req.body;

      // Validate student requirements
      if (role === "student") {
        if (!teacherId) {
          return res.status(400).json({ message: "teacherId required for students" });
        }

        // Verify that teacherId refers to an existing user who is actually a teacher
        const teacher = await User.findById(teacherId);
        if (!teacher) {
          return res.status(400).json({ message: "Invalid teacherId: teacher not found" });
        }
        if (teacher.role !== "teacher") {
          return res.status(400).json({ message: "Invalid teacherId: specified user is not a teacher" });
        }
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new User({
        email,
        passwordHash,
        role,
        teacherId: teacherId || null
      });

      await newUser.save();

      res.json({ message: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Login
router.post(
  "/login",
  loginRateLimiter, // Apply rate limiting to prevent brute force attacks
  [
    body("email").isEmail(),
    body("password").exists()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          teacherId: user.teacherId
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
