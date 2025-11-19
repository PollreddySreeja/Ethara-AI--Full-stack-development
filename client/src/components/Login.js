import React, { useState } from "react";
import axios from "axios";

function Login({ onLoginSuccess, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

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
    <div style={{ padding: "20px", maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            background: loading ? "#ccc" : "#0066ff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {message && (
        <p style={{
          marginTop: "15px",
          padding: "10px",
          borderRadius: "4px",
          background: message.includes("successful") ? "#d4edda" : "#f8d7da",
          color: message.includes("successful") ? "#155724" : "#721c24",
          textAlign: "center"
        }}>
          {message}
        </p>
      )}

      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Don't have an account?{" "}
        <button
          onClick={onSignup}
          style={{
            background: "none",
            border: "none",
            color: "#0066ff",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Signup here
        </button>
      </p>
    </div>
  );
}

export default Login;
