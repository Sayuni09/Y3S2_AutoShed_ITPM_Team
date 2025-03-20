import axios from "axios";

const API_URL = "http://localhost:5000/api/lecturers";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const addLecturer = async (lecturerData) => {
    try {
        const response = await axios.post(`${API_URL}/add-lecturer`, lecturerData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error adding lecturer:", error);
        throw error.response?.data?.message || "Failed to add lecturer. Please try again.";
    }
};

export const updateLecturer = async (id, lecturerData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, lecturerData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating lecturer:", error);
        throw error.response?.data?.message || "Failed to update lecturer. Please try again.";
    }
};

export const deleteLecturer = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error deleting lecturer:", error);
        throw error.response?.data?.message || "Failed to delete lecturer. Please try again.";
    }
};

export const getLecturers = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching lecturers:", error);
        throw error.response?.data?.message || "Failed to fetch lecturers. Please try again.";
    }
};