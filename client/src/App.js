import "./App.css";
import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

function App() {
  const [page, setPage] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fix session persistence on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setPage("login");
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (page === "login") {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSignup={() => setPage("signup")}
      />
    );
  }

  if (page === "signup") {
    return (
      <Signup
        onSignupSuccess={() => setPage("login")}
        onLogin={() => setPage("login")}
      />
    );
  }

  return null;
}

export default App;
