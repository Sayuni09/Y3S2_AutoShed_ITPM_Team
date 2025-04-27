import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getLecturers = async (licId) => {
  try {
    const response = await axios.get(`${API_URL}/lecturers/${licId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecturer availability:', error);
    throw error;
  }
};

const lecAvailabilityService = {
  getLecturers
};

export default lecAvailabilityService;