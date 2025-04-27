import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lic'; // Adjust the URL as necessary

const LicViewScheduleService = {
  // Get all schedules for a specific LIC
  getSchedulesByLic: async (licId) => {
    try {
      const response = await axios.get(`${API_URL}/schedules/${licId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  // Get detailed information for a specific schedule
  getScheduleDetails: async (scheduleId) => {
    try {
      const response = await axios.get(`${API_URL}/schedule/${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedule details:', error);
      throw error;
    }
  },

  // Update an existing schedule
  updateSchedule: async (scheduleId, scheduleData) => {
    try {
      const response = await axios.put(`${API_URL}/schedule/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await axios.delete(`${API_URL}/schedule/${scheduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
};

export default LicViewScheduleService;