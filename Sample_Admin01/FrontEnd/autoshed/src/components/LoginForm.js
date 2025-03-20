import React, { useState, useEffect } from "react";
import { ArrowLeft } from 'lucide-react';
import { loginUser } from "../services/authService";
import "../styles/loginForms.css";

const LoginForm = ({ onLoginSuccess, onBack }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const createParticle = () => {
            const particles = document.querySelector('.login-particles');
            if (!particles) return;
            
            const particle = document.createElement('div');
            particle.className = 'login-particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = Math.random() * 3 + 2 + 's';
            
            particles.appendChild(particle);
            
            setTimeout(() => particle.remove(), 5000);
        };

        const intervalId = setInterval(createParticle, 300);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const container = document.querySelector('.login-container1');
        if (!container) return;

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / container.clientWidth) * 100;
            const y = ((e.clientY - rect.top) / container.clientHeight) * 100;
            container.style.setProperty('--mouse-x', `${x}%`);
            container.style.setProperty('--mouse-y', `${y}%`);
        };

        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await loginUser(email, password);
            localStorage.setItem("token", data.token);
            onLoginSuccess();
        } catch (err) {
            setError(err.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-background-animation"></div>
            <div className="login-particles"></div>
            <nav className="nav-sidebar">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={24} />
                    <span className="back-button-text">Back to Home</span>
                </button>
            </nav>
            <div className="login-container1">
                <div className="login-form-content1">
                    <h2>Admin Login</h2>
                    {error && <p className="error-message">{error}</p>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group1">
                            <input 
                                id="email"
                                type="email" 
                                placeholder=" "
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className="form-group1">
                            <input 
                                id="password"
                                type="password" 
                                placeholder=" "
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <label htmlFor="password">Password</label>
                        </div>
                        <button type="submit1" disabled={loading}>
                            {loading ? (
                                <>
                                    Logging in
                                    <span className="loading-spinner" />
                                </>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;