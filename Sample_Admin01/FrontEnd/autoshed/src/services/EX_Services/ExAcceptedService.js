import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ex/accepted'; // Base URL for accepted schedules API

// Function to accept a schedule
export const acceptSchedule = async (scheduleId, examinerId) => {
    try {
        const response = await axios.post(`${API_URL}/accept`, {
            schedule_id: scheduleId,
            examiner_id: examinerId
        });
        return response.data; // Return the response data from the server
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error accepting schedule');
    }
};

// Function to fetch accepted schedules for an examiner
export const fetchAcceptedSchedules = async (examinerId) => {
    try {
        const response = await axios.get(`${API_URL}/accepted/${examinerId}`);
        return response.data; // Return the accepted schedules data
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Error fetching accepted schedules');
    }
};

