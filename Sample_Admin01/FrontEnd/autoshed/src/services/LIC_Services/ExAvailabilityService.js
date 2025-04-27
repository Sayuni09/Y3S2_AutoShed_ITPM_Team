import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getExaminers = async (licId) => {
  try {
    const response = await axios.get(`${API_URL}/lic/examiner-availability/examiners/${licId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching examiner availability:', error);
    throw error;
  }
};

const exAvailabilityService = {
  getExaminers
};

export default exAvailabilityService;