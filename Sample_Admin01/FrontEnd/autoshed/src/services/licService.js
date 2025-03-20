import axios from "axios";

const API_URL = "http://localhost:5000/api/lic";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const addLic = async (licData) => {
    try {
        const response = await axios.post(`${API_URL}/add-lic`, licData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error adding lecturer in charge:", error);
        throw error.response?.data?.message || "Failed to add lecturer in charge. Please try again.";
    }
};

export const updateLic = async (id, licData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, licData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating lecturer in charge:", error);
        throw error.response?.data?.message || "Failed to update lecturer in charge. Please try again.";
    }
};

export const deleteLic = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error deleting lecturer in charge:", error);
        throw error.response?.data?.message || "Failed to delete lecturer in charge. Please try again.";
    }
};

export const getLic = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching lecturers in charge:", error);
        throw error.response?.data?.message || "Failed to fetch lecturers in charge. Please try again.";
    }
};