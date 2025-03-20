import React, { useState, useEffect } from "react";
import { BrowserRouter as Router} from "react-router-dom"; // Import BrowserRouter
import Home from "./pages/Home"; // Import Home component
import AdminLoginForm from "./components/LoginForm"; // Existing Admin Login Form
import LicLoginForm from "./components/LicLoginForm"; // New LIC Login Form
import LecturerLoginForm from "./components/LecturerLoginForm"; // New Lecturer Login Form
import ExaminerLoginForm from "./components/ExaminerLoginForm"; // New Examiner Login Form
import AdminDashboard from "./pages/AdminDashboard";
import LicDashboard from "./pages/LicDashboard"; // New LIC Dashboard
import LecDashboard from "./pages/LecDashboard"; // New Lecturer Dashboard
import ExDashboard from "./pages/ExDashboard"; // New Examiner Dashboard
import { checkAuthStatus } from "./services/authService";
import "./App.css";


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showHome, setShowHome] = useState(true);
    const [loginType, setLoginType] = useState(""); // State to track login type

    useEffect(() => {
        const authStatus = checkAuthStatus();
        setIsAuthenticated(authStatus);
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setShowHome(false);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setShowHome(true);
    };

    const handleAdminLoginClick = () => {
        setLoginType("admin");
        setShowHome(false);
    };

    const handleLicLoginClick = () => {
        setLoginType("lic");
        setShowHome(false);
    };

    const handleLecturerLoginClick = () => {
        setLoginType("lecturer");
        setShowHome(false);
    };

    const handleExaminerLoginClick = () => {
        setLoginType("examiner");
        setShowHome(false);
    };

    return (
        <Router> {/* Wrap your application in Router */}
            <div className="app-container">
                {showHome ? (
                    <Home 
                        onLoginClick={handleAdminLoginClick} 
                        onLicLoginClick={handleLicLoginClick} 
                        onLecturerLoginClick={handleLecturerLoginClick} 
                        onExaminerLoginClick={handleExaminerLoginClick} 
                    />
                ) : isAuthenticated ? (
                    loginType === "admin" ? (
                        <AdminDashboard onLogout={handleLogout} />
                    ) : loginType === "lic" ? (
                        <LicDashboard onLogout={handleLogout} />
                    ) : loginType === "lecturer" ? (
                        <LecDashboard onLogout={handleLogout} />
                    ) : loginType === "examiner" ? (
                        <ExDashboard onLogout={handleLogout} />
                    ) : null
                ) : (
                    loginType === "admin" ? (
                        <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
                    ) : loginType === "lic" ? (
                        <LicLoginForm onLoginSuccess={handleLoginSuccess} />
                    ) : loginType === "lecturer" ? (
                        <LecturerLoginForm onLoginSuccess={handleLoginSuccess} />
                    ) : loginType === "examiner" ? (
                        <ExaminerLoginForm onLoginSuccess={handleLoginSuccess} />
                    ) : null
                )}
            </div>
        </Router>
    );
}

export default App;