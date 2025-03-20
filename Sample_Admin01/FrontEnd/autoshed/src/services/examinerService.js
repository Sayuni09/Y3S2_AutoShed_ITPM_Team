import axios from "axios";

const API_URL = "http://localhost:5000/api/examiners";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const addExaminer = async (examinerData) => {
    try {
        const response = await axios.post(`${API_URL}/add-examiner`, examinerData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error adding examiner:", error);
        throw error.response?.data?.message || "Failed to add examiner. Please try again.";
    }
};

export const updateExaminer = async (id, examinerData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, examinerData, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error updating examiner:", error);
        throw error.response?.data?.message || "Failed to update examiner. Please try again.";
    }
};

export const deleteExaminer = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error deleting examiner:", error);
        throw error.response?.data?.message || "Failed to delete examiner. Please try again.";
    }
};

export const getExaminers = async () => {
    try {
        const response = await axios.get(API_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        console.error("Error fetching examiners:", error);
        throw error.response?.data?.message || "Failed to fetch examiners. Please try again.";
    }
};