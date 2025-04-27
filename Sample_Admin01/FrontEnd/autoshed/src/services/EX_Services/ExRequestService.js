import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api/ex";

const ExRequestService = {
    // Submit a new reschedule request
    submitRescheduleRequest: async (scheduleId, examinerId, comment) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/reschedule`, {
                schedule_id: scheduleId,
                examiner_id: examinerId,
                comment: comment
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting reschedule request:', error);
            throw error.response ? error.response.data : new Error('Network error occurred');
        }
    },

    // Get all reschedule requests for an examiner
    getExaminerRescheduleRequests: async (examinerId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reschedule/${examinerId}`);
            return response.data.requests;
        } catch (error) {
            console.error('Error fetching reschedule requests:', error);
            throw error.response ? error.response.data : new Error('Network error occurred');
        }
    },

    // Get a specific reschedule request by ID
    getRescheduleRequestById: async (requestId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reschedule/detail/${requestId}`);
            return response.data.request;
        } catch (error) {
            console.error('Error fetching reschedule request details:', error);
            throw error.response ? error.response.data : new Error('Network error occurred');
        }
    }
};

export default ExRequestService;