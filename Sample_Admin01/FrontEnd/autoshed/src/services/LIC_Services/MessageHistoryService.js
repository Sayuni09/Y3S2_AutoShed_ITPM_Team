// D:\React_Nodejs\git repostry\Sayu_Git_Autoshed\AutoShed_Sayu_Thila\Sample_Admin01\FrontEnd\autoshed\src\services\LIC_Services\MessageHistoryService.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lic';

const MessageHistoryService = {
  // Get email history for a LIC
  getEmailHistory: async (licId) => {
    try {
      const response = await axios.get(`${API_URL}/email-history/${licId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch email history');
    }
  },

  // Get WhatsApp message history for a LIC
  getWhatsAppHistory: async (licId) => {
    try {
      const response = await axios.get(`${API_URL}/whatsapp-history/${licId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Failed to fetch WhatsApp message history');
    }
  }
};

export default MessageHistoryService;
