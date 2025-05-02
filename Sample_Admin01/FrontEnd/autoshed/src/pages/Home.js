// Home.js

import React, { useEffect, useRef } from "react";
import "../styles/home.css";
import { Calendar, Users, BookOpen, Award, ChevronRight } from 'lucide-react';

const Home = ({ onLoginClick, onLicLoginClick, onLecturerLoginClick, onExaminerLoginClick }) => {
    const homeRef = useRef(null);
    const cardsRef = useRef([]);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    const drawConnectionLines = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particleCount = 30;
        const particles = [];
        const connectionDistance = 150;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: Math.random() * 1 - 0.5,
                vy: Math.random() * 1 - 0.5,
                size: Math.random() * 3 + 1
            });
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw particles
            particles.forEach(particle => {
                // Move particle
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
                ctx.fill();
                
                // Connect particles
                particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - distance/connectionDistance)})`;
                        ctx.stroke();
                    }
                });
            });
            
            animationRef.current = requestAnimationFrame(animate);
        }
        
        animate();
    };

    // Handle window resize
    const handleResize = () => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    };

    useEffect(() => {
        // Create canvas for connected nodes
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.className = 'particle-canvas';
        homeRef.current.appendChild(canvas);
        canvasRef.current = canvas;
        
        // Initialize canvas animation
        drawConnectionLines();
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Create floating particles
        const createParticle = () => {
            const particles = document.querySelector('.particles');
            if (!particles) return;
            
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position, size and color variation
            const size = Math.random() * 3 + 1;
            const hue = Math.random() * 60 + 190; // Blue to purple range
            
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.opacity = Math.random() * 0.5 + 0.3;
            particle.style.backgroundColor = `hsla(${hue}, 80%, 70%, 0.8)`;
            particle.style.animationDuration = Math.random() * 3 + 2 + 's';
            
            particles.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                particle.remove();
            }, 5000);
        };

        // Create particles periodically
        const intervalId = setInterval(createParticle, 200);
        
        // Handle mouse move effect for cards
        const handleMouseMove = (e) => {
            cardsRef.current.forEach(card => {
                if (!card) return;
                
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        };
        
        // Add mouse move listener
        const homeContainer = homeRef.current;
        if (homeContainer) {
            homeContainer.addEventListener('mousemove', handleMouseMove);
        }
        
        return () => {
            clearInterval(intervalId);
            if (homeContainer) {
                homeContainer.removeEventListener('mousemove', handleMouseMove);
            }
            
            window.removeEventListener('resize', handleResize);
            
            // Clean up animation
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            
            // Remove canvas
            if (canvasRef.current && homeRef.current) {
                homeRef.current.removeChild(canvasRef.current);
            }
        };
    }, []);

    return (
        <div className="home-container" ref={homeRef}>
            <div className="background-animation"></div>
            <div className="particles"></div>
            <div className="content-wrapper">
                <div className="hero-section">
                    <h1 className="title-animate">AutoShed</h1>
                    <p className="subtitle-animate">Smart Presentation Scheduling System</p>
                    <div className="hero-glow"></div>
                </div>
                
                <div className="login-cards">
                    <div 
                        className="login-card" 
                        onClick={onLoginClick}
                        ref={el => cardsRef.current[0] = el}
                    >
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
                        <div className="card-border"></div>
                    </div>

                    <div 
                        className="login-card" 
                        onClick={onLicLoginClick}
                        ref={el => cardsRef.current[1] = el}
                    >
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
                        <div className="card-border"></div>
                    </div>

                    <div 
                        className="login-card" 
                        onClick={onLecturerLoginClick}
                        ref={el => cardsRef.current[2] = el}
                    >
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
                        <div className="card-border"></div>
                    </div>

                    <div 
                        className="login-card" 
                        onClick={onExaminerLoginClick}
                        ref={el => cardsRef.current[3] = el}
                    >
                        <div className="card-content">
                            <div className="icon-wrapper">
                                <Award size={32} />
                            </div>
                            <div className="card-text">
                                <h3>Examiner Portal</h3>
                                <p>View and Manage Presentation Schedules</p>
                            </div>
                            <ChevronRight className="arrow-icon" size={24} />
                        </div>
                        <div className="card-shine"></div>
                        <div className="card-border"></div>
                    </div>
                </div>

                <div className="features-section">
                    <div className="feature">
                        <span className="feature-icon">📅</span>
                        <h4>Smart Scheduling</h4>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">🔔</span>
                        <h4>Real-time Updates</h4>
                    </div>
                    <div className="feature">
                        <span className="feature-icon">📊</span>
                        <h4>Analytics</h4>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
