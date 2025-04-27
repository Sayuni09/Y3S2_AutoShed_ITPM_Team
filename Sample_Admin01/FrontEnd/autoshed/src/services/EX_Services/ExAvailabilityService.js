import axios from 'axios';

const API_URL = 'http://localhost:5000/api/examiner-availability';

export const submitAvailability = async (examiner_id, comments, slots) => {
    try {
        const response = await axios.post(API_URL, {
            examiner_id,
            comments,
            slots
        });
        return response.data;
    } catch (error) {
        console.error("Error submitting availability:", error);
        throw error;
    }
};

export const getAvailability = async (examiner_id) => {
    try {
        const response = await axios.get(`${API_URL}/${examiner_id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching availability:", error);
        throw error;
    }
};

export const updateAvailability = async (form_id, comments, slots, deleteSlotIds = []) => {
    try {
        const response = await axios.put(`${API_URL}/${form_id}`, {
            comments,
            slots,
            deleteSlotIds
        });
        return response.data;
    } catch (error) {
        console.error("Error updating availability:", error);
        throw error;
    }
};

export const deleteAvailability = async (form_id) => {
    try {
        const response = await axios.delete(`${API_URL}/${form_id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting availability:", error);
        throw error;
    }
};

// Create service object before exporting as default
const exAvailabilityService = {
    submitAvailability,
    getAvailability,
    updateAvailability,
    deleteAvailability
};

export default exAvailabilityService;