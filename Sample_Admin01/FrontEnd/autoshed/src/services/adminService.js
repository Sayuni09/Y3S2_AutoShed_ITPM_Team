import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

// Configure axios to send the authorization header with each request
const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getAdmins = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching admins:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw new Error("Failed to fetch admin users. Please try again.");
        }
    }
};

export const addAdmin = async (adminData) => {
    try {
        const response = await axios.post(API_URL, adminData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error adding admin:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw new Error("Failed to add admin. Please try again.");
        }
    }
};

export const updateAdmin = async (id, adminData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, adminData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating admin:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw new Error("Failed to update admin. Please try again.");
        }
    }
};

export const deleteAdmin = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error deleting admin:", error);
        
        if (error.response && error.response.data && error.response.data.message) {
            throw error.response.data.message;
        } else {
            throw new Error("Failed to delete admin. Please try again.");
        }
    }
};