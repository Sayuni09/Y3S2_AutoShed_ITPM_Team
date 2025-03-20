

import axios from "axios";

const API_URL = "http://localhost:5000/api/lic/auth"; // Update the API URL for LIC

export const loginLicUser  = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error("LIC Login error:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw "LIC Login failed. Please try again.";
        }
    }
};

export const checkLicAuthStatus = () => {
    return localStorage.getItem("token") ? true : false;
};

export const logoutLic = () => {
    localStorage.removeItem("token");
};