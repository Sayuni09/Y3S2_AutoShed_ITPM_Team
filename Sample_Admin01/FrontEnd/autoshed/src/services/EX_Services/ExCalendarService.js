import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ExCalendarService = {
  // Fetch accepted schedules for a specific examiner
  getAcceptedSchedules: async (examinerId) => {
    try {
      const response = await axios.get(`${API_URL}/ex/calendar/${examinerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching examiner schedules:', error);
      throw error;
    }
  }
};

export default ExCalendarService;