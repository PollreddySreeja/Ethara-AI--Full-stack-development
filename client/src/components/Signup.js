import React, { useState } from "react";
import { signup } from "../api";

function Signup({ onSignupSuccess, onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email)) newErrors.email = "Valid email required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Min 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setMsg("");
    try {
      const res = await signup(form);
      const { token, user } = res.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setMsg("Account created successfully!");
      setTimeout(() => onSignupSuccess(), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <form onSubmit={handleSignup} className="auth-form">

          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? "error" : ""}`}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "error" : ""}`}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Select Role:</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-select">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-success btn-block">
            {loading ? "Creating account..." : "Signup"}
          </button>
        </form>

        {msg && (
          <div className={msg.includes("success") ? "success-message" : "error-banner"}>
            {msg}
          </div>
        )}

        <div className="auth-footer">
          Already have an account?{" "}
          <button onClick={onLogin} className="auth-link">Login here</button>
        </div>
      </div>
    </div>
  );
}

export default Signup;