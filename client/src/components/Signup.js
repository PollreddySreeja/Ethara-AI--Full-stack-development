import React, { useState, useEffect } from "react";
import axios from "axios";

function Signup({ onSignupSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [teacherId, setTeacherId] = useState("");
  const [msg, setMsg] = useState("");
  const [teachers, setTeachers] = useState([]); // List of available teachers
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // For inline validation errors
  const [showPassword, setShowPassword] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Teacher ID validation for students
    if (role === "student" && !teacherId) {
      newErrors.teacherId = "Please select a teacher";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch all teachers when component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/teachers");
        // Handle new response format: { success: true, data: [...teachers] }
        setTeachers(res.data.data);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setMsg("Failed to load teachers list");
      }
    };

    fetchTeachers();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMsg("");
    setErrors({});

    try {
      const res = await axios.post("http://localhost:5000/auth/signup", {
        email,
        password,
        role,
        teacherId: role === "student" ? teacherId : null,
      });

      setMsg("User registered successfully!");
      setTimeout(() => onSignupSuccess(), 1500); // Redirect after showing success message
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Signup failed!";
      setMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        
        <form onSubmit={handleSignup} className="auth-form">
          {/* Email Input */}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error when user starts typing
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && (
              <div className="error-message">
                {errors.email}
              </div>
            )}
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Clear error when user starts typing
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                minLength={6}
                className={`form-input ${errors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">
                {errors.password}
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label">Select Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-select"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          {/* Teacher dropdown for students */}
          {role === "student" && (
            <div className="form-group">
              <label className="form-label">Select Your Teacher:</label>
              <select
                value={teacherId}
                onChange={(e) => {
                  setTeacherId(e.target.value);
                  // Clear error when user selects a teacher
                  if (errors.teacherId) setErrors({ ...errors, teacherId: null });
                }}
                className={`form-select ${errors.teacherId ? 'error' : ''}`}
              >
                <option value="">-- Select a Teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.email}
                  </option>
                ))}
              </select>
              {errors.teacherId && (
                <div className="error-message">
                  {errors.teacherId}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success btn-block"
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        {/* Success/Error Message */}
        {msg && (
          <div className={msg.includes("success") ? "success-message" : "error-banner"}>
            {msg}
          </div>
        )}

        {/* Footer Link */}
        <div className="auth-footer">
          Already have an account?{" "}
          <button
            onClick={() => window.location.reload()}
            className="auth-link"
          >
            Login here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
