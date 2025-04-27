import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lec/accepted'; // Base URL for accepted schedules API

// Function to accept a schedule
export const acceptSchedule = async (scheduleId, lecId) => {
    try {
        const response = await axios.post(`${API_URL}/accept`, {
            schedule_id: scheduleId,
            lec_id: lecId
        });
        return response.data; // Return the response data from the server
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error accepting schedule');
    }
};

// Function to fetch accepted schedules for a lecturer
export const fetchAcceptedSchedules = async (lecId) => {
    try {
        const response = await axios.get(`${API_URL}/accepted/${lecId}`);
        return response.data; // Return the accepted schedules data
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error fetching accepted schedules');
    }
};