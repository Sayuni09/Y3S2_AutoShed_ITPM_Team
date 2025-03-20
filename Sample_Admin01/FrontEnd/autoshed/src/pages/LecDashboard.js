import React from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from "../components/LEC_Component/Navbar";
import Sidebar from "../components/LEC_Component/Sidebar";
import { Users, FileText, DollarSign, CheckSquare } from 'lucide-react';
import "../styles/LEC_Styles/Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LecDashboard = ({ onLogout }) => {
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Premium Collected',
                data: [12000, 19000, 30000, 50000, 20000, 30000],
                backgroundColor: 'rgba(75, 123, 236, 0.6)',
                borderColor: 'rgba(75, 123, 236, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    family: "'Inter', sans-serif"
                },
                bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif"
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
                }
            }
        }
    };

    const cards = [
        { title: 'Total Users', value: '1,234', icon: <Users className="card-icon" size={24} />, color: '#4b7bec' },
        { title: 'Active Policies', value: '867', icon: <FileText className="card-icon" size={24} />, color: '#26de81' },
        { title: 'Premium Collected', value: '₹4,56,789', icon: <DollarSign className="card-icon" size={24} />, color: '#fd9644' },
        { title: 'Claims Processed', value: '312', icon: <CheckSquare className="card-icon" size={24} />, color: '#a55eea' }
    ];

    return (
        <div className="dashboard-container">
            <Sidebar onLogout={onLogout} />
            <div className="dashboard-content">
                <Navbar onLogout={onLogout} />
                <main className="main-content">
                    <div className="content-wrapper">
                        <div className="dashboard-header">
                            <h1>Welcome Back, John!</h1>
                            <p>Here's your dashboard overview</p>
                        </div>
                        <div className="dashboard-cards">
                            {cards.map((card, index) => (
                                <div className="dashboard-card" key={index}>
                                    <div className="card-icon-wrapper" style={{ backgroundColor: `${card.color}20`, color: card.color }}>
                                        {card.icon}
                                    </div>
                                    <div className="card-content">
                                        <h3>{card.title}</h3>
                                        <p className="card-value" style={{ color: card.color }}>{card.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-container">
                            <div className="chart-header">
                                <h2>Premium Collection Trends</h2>
                                <div className="chart-actions">
                                    <select className="chart-select">
                                        <option value="6months">Last 6 Months</option>
                                        <option value="1year">Last Year</option>
                                        <option value="all">All Time</option>
                                    </select>
                                </div>
                            </div>
                            <div className="chart-wrapper">
                                <Bar data={data} options={options} height={300} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LecDashboard;