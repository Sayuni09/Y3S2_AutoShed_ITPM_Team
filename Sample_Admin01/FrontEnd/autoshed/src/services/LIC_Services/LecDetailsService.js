import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getLecturerDetails = async (lecId) => {
  try {
    const response = await axios.get(`${API_URL}/lic/lecturers/lecturers/${lecId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lecturer details:', error);
    throw error;
  }
};

const lecDetailsService = {
  getLecturerDetails
};

export default lecDetailsService;