import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // For inline validation errors

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({});

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // Handle new response format: { success: true, data: { token, user, message } }
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      setMessage("Login successful!");
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        onLoginSuccess();
      }, 500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid email or password";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>

        <form onSubmit={handleLogin} className="auth-form">
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
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  // Clear error when user starts typing
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Success/Error Message */}
        {message && (
          <div className={message.includes("successful") ? "success-message" : "error-banner"}>
            {message}
          </div>
        )}

        {/* Footer Link */}
        <div className="auth-footer">
          Don't have an account?{" "}
          <button onClick={onSignup} className="auth-link">
            Signup here
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
