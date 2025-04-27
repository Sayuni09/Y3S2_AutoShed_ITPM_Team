import axios from 'axios';

const LIC_API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/lic';

const LicRequestService = {
  // Get all reschedule requests (both pending and responded)
  getAllRescheduleRequests: async (licId) => {
    try {
      const response = await axios.get(`${LIC_API_BASE_URL}/${licId}/reschedule-requests/all`);
      return response;
    } catch (error) {
      console.error('Error fetching all reschedule requests:', error);
      throw error.response ? error.response.data : new Error('Network error occurred');
    }
  },

  // Get only pending reschedule requests
  getPendingRescheduleRequests: async (licId) => {
    try {
      const response = await axios.get(`${LIC_API_BASE_URL}/${licId}/reschedule-requests/pending`);
      return response;
    } catch (error) {
      console.error('Error fetching pending reschedule requests:', error);
      throw error.response ? error.response.data : new Error('Network error occurred');
    }
  },

  // Get details of a specific reschedule request
  getRequestDetails: async (licId, requestType, requestId) => {
    try {
      const response = await axios.get(`${LIC_API_BASE_URL}/${licId}/reschedule-requests/${requestType}/${requestId}`);
      return response;
    } catch (error) {
      console.error('Error fetching request details:', error);
      throw error.response ? error.response.data : new Error('Network error occurred');
    }
  },

  // Respond to a lecturer's reschedule request
  respondToLecturerRequest: async (licId, requestId, status, adminResponse) => {
    try {
      const response = await axios.put(`${LIC_API_BASE_URL}/${licId}/reschedule-requests/lecturer/${requestId}`, {
        status,
        admin_response: adminResponse
      });
      return response;
    } catch (error) {
      console.error('Error responding to lecturer request:', error);
      throw error.response ? error.response.data : new Error('Network error occurred');
    }
  },

  // Respond to an examiner's reschedule request
  respondToExaminerRequest: async (licId, requestId, status, adminResponse) => {
    try {
      const response = await axios.put(`${LIC_API_BASE_URL}/${licId}/reschedule-requests/examiner/${requestId}`, {
        status,
        admin_response: adminResponse
      });
      return response;
    } catch (error) {
      console.error('Error responding to examiner request:', error);
      throw error.response ? error.response.data : new Error('Network error occurred');
    }
  }
};

export default LicRequestService;