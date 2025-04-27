import axios from 'axios';

const API_URL = 'http://localhost:5000/api/lic'; // Adjust the URL as necessary

const getLicTimeSlots = async (lec_id) => {
    try {
        const response = await axios.get(`${API_URL}/time-slots/${lec_id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching time slots:", error);
        throw error;
    }
};

const getAvailableLecturersForTimeSlot = async (slot_id) => {
    try {
        const response = await axios.get(`${API_URL}/time-slots/${slot_id}/available-lecturers`);
        return response.data;
    } catch (error) {
        console.error("Error fetching available lecturers:", error);
        throw error;
    }
};

const getAvailableExaminersForTimeSlot = async (slot_id) => {
    try {
        const response = await axios.get(`${API_URL}/time-slots/${slot_id}/available-examiners`);
        return response.data;
    } catch (error) {
        console.error("Error fetching available examiners:", error);
        throw error;
    }
};

const LicTimeSlotsService = {
    getLicTimeSlots,
    getAvailableLecturersForTimeSlot,
    getAvailableExaminersForTimeSlot,
};

export default LicTimeSlotsService;