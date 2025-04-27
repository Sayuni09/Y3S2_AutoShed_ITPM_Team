import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getExaminerDetails = async (lecId) => {
  try {
    const response = await axios.get(`${API_URL}/lic/examiners/${lecId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching examiner details:', error);
    throw error;
  }
};

const exDetailsService = {
  getExaminerDetails
};

export default exDetailsService;