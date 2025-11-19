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

  // Fetch all teachers when component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/teachers");
        setTeachers(res.data);
      } catch (err) {
        console.error("Failed to fetch teachers:", err);
        setMsg("Failed to load teachers list");
      }
    };

    fetchTeachers();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

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

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        <div style={{ marginBottom: "15px", position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              paddingRight: "40px"
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              color: "#0066ff"
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Select Role:
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {/* Teacher dropdown for students */}
        {role === "student" && (
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Select Your Teacher:
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                borderRadius: "4px",
                border: "1px solid #ccc"
              }}
            >
              <option value="">-- Select a Teacher --</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.email}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#ccc" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "10px"
          }}
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>

      {msg && (
        <p style={{
          marginTop: "15px",
          padding: "10px",
          borderRadius: "4px",
          background: msg.includes("success") ? "#d4edda" : "#f8d7da",
          color: msg.includes("success") ? "#155724" : "#721c24",
          textAlign: "center"
        }}>
          {msg}
        </p>
      )}

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Already have an account?{" "}
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "none",
            border: "none",
            color: "#0066ff",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Login here
        </button>
      </p>
    </div>
  );
}

export default Signup;
