import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error("Login error:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw "Login failed. Please try again.";
        }
    }
};

export const checkAuthStatus = () => {
    return localStorage.getItem("token") ? true : false;
};

export const logout = () => {
    localStorage.removeItem("token");
};