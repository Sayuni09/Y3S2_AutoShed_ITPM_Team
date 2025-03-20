import React, { useEffect } from "react";
import "../styles/home.css";
import { Calendar, Users, BookOpen, Award, ChevronRight } from 'lucide-react';

const Home = ({ onLoginClick, onLicLoginClick, onLecturerLoginClick, onExaminerLoginClick }) => {
    useEffect(() => {
        const createParticle = () => {
            const particles = document.querySelector('.particles');
            if (!particles) return;
            
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDuration = Math.random() * 3 + 2 + 's';
            
            particles.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 5000);
        };

        // Create particles periodically
        const intervalId = setInterval(createParticle, 300);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="home-container">
            <div className="background-animation"></div>
            <div className="particles"></div>
            <div className="content-wrapper">
                <div className="hero-section">
                    <h1 className="title-animate">Presentation Scheduling System</h1>
                    <p className="subtitle-animate">Streamline your academic presentations with our efficient management system</p>
                </div>
                
                <div className="login-cards">
                    <div className="login-card" onClick={onLoginClick}>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <Users size={32} />
                            </div>
                            <div className="card-text">
                                <h3>Admin Portal</h3>
                                <p>Manage system settings and users</p>
                            </div>
                            <ChevronRight className="arrow-icon" size={24} />
                        </div>
                        <div className="card-shine"></div>
                    </div>

                    <div className="login-card" onClick={onLicLoginClick}>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <Calendar size={32} />
                            </div>
                            <div className="card-text">
                                <h3>LIC Portal</h3>
                                <p>Schedule and coordinate presentations</p>
                            </div>
                            <ChevronRight className="arrow-icon" size={24} />
                        </div>
                        <div className="card-shine"></div>
                    </div>

                    <div className="login-card" onClick={onLecturerLoginClick}>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <BookOpen size={32} />
                            </div>
                            <div className="card-text">
                                <h3>Lecturer Portal</h3>
                                <p>View and manage your sessions</p>
                            </div>
                            <ChevronRight className="arrow-icon" size={24} />
                        </div>
                        <div className="card-shine"></div>
                    </div>

                    <div className="login-card" onClick={onExaminerLoginClick}>
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <Award size={32} />
                            </div>
                            <div className="card-text">
                                <h3>Examiner Portal</h3>
                                <p>Access evaluation tools</p>
                            </div>
                            <ChevronRight className="arrow-icon" size={24} />
                        </div>
                        <div className="card-shine"></div>
                    </div>
                </div>

                <div className="features-section">
                    <div className="feature">
                        <span className="feature-icon">📅</span>
                        <h4>Smart Scheduling</h4>
                        <div className="feature-pulse"></div>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🔔</span>
                        <h4>Real-time Updates</h4>
                        <div className="feature-pulse"></div>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📊</span>
                        <h4>Analytics</h4>
                        <div className="feature-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;