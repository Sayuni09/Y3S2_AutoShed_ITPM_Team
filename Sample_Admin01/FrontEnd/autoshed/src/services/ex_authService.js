// D:\React_Nodejs\Sample_Admin01\FrontEnd\autoshed\src\services\ex_authService.js

import axios from "axios";

const API_URL = "http://localhost:5000/api/ex/auth"; // Update the API URL for Examiner authentication

export const loginExaminer = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error("Examiner Login error:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw "Examiner Login failed. Please try again.";
        }
    }
};

export const checkExaminerAuthStatus = () => {
    return localStorage.getItem("token") ? true : false;
};

export const logoutExaminer = () => {
    localStorage.removeItem("token");
};