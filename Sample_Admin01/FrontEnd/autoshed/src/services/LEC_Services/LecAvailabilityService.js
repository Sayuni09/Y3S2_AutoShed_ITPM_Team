import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lecturer-availability';


export const submitAvailability = async (lec_id, comments, slots) => {
    try {
        const response = await axios.post(API_URL, {
            lec_id,
            comments,
            slots
        });
        return response.data;
    } catch (error) {
        console.error("Error submitting availability:", error);
        throw error;
    }
};


export const getAvailability = async (lec_id) => {
    try {
        const response = await axios.get(`${API_URL}/${lec_id}`);
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
const lecAvailabilityService = {
    submitAvailability,
    getAvailability,
    updateAvailability,
    deleteAvailability
};

export default lecAvailabilityService;

