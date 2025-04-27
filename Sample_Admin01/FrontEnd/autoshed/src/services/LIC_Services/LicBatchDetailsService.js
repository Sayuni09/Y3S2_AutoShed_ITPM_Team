import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class LicBatchDetailsService {
  // Get all batches
  getAllBatches() {
    return axios.get(`${API_URL}/lic/batch-details`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching batches:', error);
        throw error;
      });
  }
  // Get batch details for a specific batch
  getBatchDetails(batch) {
    return axios.get(`${API_URL}/lic/batch-details/${batch}`)
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching batch details:', error);
        throw error;
      });
  }
}

const licBatchDetailsService = new LicBatchDetailsService();
export default licBatchDetailsService;