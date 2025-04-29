// D:\React_Nodejs\Sample_Admin01\FrontEnd\autoshed\src\services\lec_authService.js

import axios from "axios";

const API_URL = "http://localhost:5000/api/lec/auth"; // Update the API URL for Lecturer authentication

export const loginLecturer = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error("Lecturer Login error:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw new Error("Lecturer Login failed. Please try again.");
        }
    }
};

export const checkLecturerAuthStatus = () => {
    return localStorage.getItem("token") ? true : false;
};

export const logoutLecturer = () => {
    localStorage.removeItem("token");
};