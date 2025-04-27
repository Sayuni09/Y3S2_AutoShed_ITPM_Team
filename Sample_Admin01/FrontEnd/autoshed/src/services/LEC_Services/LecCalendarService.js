import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LecCalendarService = {
  // Fetch accepted schedules for a specific lecturer
  getAcceptedSchedules: async (lecId) => {
    try {
      const response = await axios.get(`${API_URL}/lec/calendar/${lecId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lecturer schedules:', error);
      throw error;
    }
  }
};

export default LecCalendarService;