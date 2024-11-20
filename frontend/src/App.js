import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import DoctorList from "./components/DoctorList";
import Status from "./components/Status";
import Navbar from "./components/Navbar";
import DoctorDashboard from "./components/DoctorDashboard";
import DoctorConsultationRequests from "./components/DoctorConsultationRequests";
import EmailVerification from "./components/EmailVerification";
import OtpVerification from "./components/OtpVerification";
import DoctorAvailability from "./components/DoctorAvailability"

const App = () => {
  const [token, setToken] = useState(null);
  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedPatientId = localStorage.getItem("patientId");
    const storedDoctorId = localStorage.getItem("doctorId");
    const storedRole = localStorage.getItem("role");
    const storedUsername = localStorage.getItem("username");

    if (storedToken) {
      setToken(storedToken);
    }
    if (storedPatientId) {
      setPatientId(storedPatientId);
    }
    if (storedDoctorId) {
      setDoctorId(storedDoctorId);
    }
    if (storedRole) {
      setRole(storedRole);
    }
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    setPatientId("");
    setDoctorId("");
    setUsername("");
    setRole("");
    localStorage.removeItem("token");
    localStorage.removeItem("patientId");
    localStorage.removeItem("doctorId");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  };

  return (
    <Router>
      <div className="container mx-auto p-4">
        {token && <Navbar token={token} setToken={handleLogout} role={role} />}
        <Routes>
          <Route
            path="/login"
            element={
              !token ? (
                <Login
                  setToken={setToken}
                  setPatientId={setPatientId}
                  setUsername={setUsername}
                  setRole={setRole}
                  setDoctorId={setDoctorId}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/register"
            element={!token ? <Register /> : <Navigate to="/" />}
          />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/verify-otp" element={<OtpVerification />} />

          <Route
            path="/"
            element={
              token ? (
                role === "patient" ? (
                  <Dashboard username={username} />
                ) : (
                  <Navigate to="/doctor-dashboard" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/doctor-dashboard"
            element={
              token && role === "doctor" ? (
                <DoctorDashboard username={username} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/doctors"
            element={
              token && role === "patient" ? (
                <DoctorList patientId={patientId} userRole={role} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/status"
            element={
              token && role === "patient" ? (
                <Status patientId={patientId} userRole={role} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/doctor-availability"
            element={
              token && role === "doctor" ? (
                <DoctorAvailability />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/doctor-requests"
            element={
              token && role === "doctor" ? (
                <DoctorConsultationRequests doctorId={doctorId} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
