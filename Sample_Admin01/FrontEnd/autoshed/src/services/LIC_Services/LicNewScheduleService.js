
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lic/schedules'; // Update with your actual API URL

const LicNewScheduleService = {
    createSchedule: async (scheduleData) => {
        try {
            const response = await axios.post(API_URL, scheduleData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token for authentication
                }
            });
            return response.data; // Return the response data
        } catch (error) {
            throw error.response ? error.response.data : new Error('Failed to create schedule');
        }
    }
};

export default LicNewScheduleService;